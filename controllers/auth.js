const { StatusCodes } = require("http-status-codes");
const User = require("../Models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncWrapper = require("../middlewares/asyncWrapper");
const secretKey = process.env.JWT_SECRET_KEY;
const { sendPasswordResetEmail, generateJWT } = require("../services/authServices");

const tokenStore = new Map();
const tokenBlackList = new Set();
const usedTokens = {};

const register = asyncWrapper(async (req, res) => {
  const { email, password, confirmPassword, ...userData } = req.body;
  
  if (password !== confirmPassword) {
    return res.status(StatusCodes.BAD_REQUEST).render("register", { error: "Passwords do not match", message: ''});
  }

  const userEmail = await User.findOne({ email });

  if (userEmail) {
    return res.status(StatusCodes.BAD_REQUEST).render("register", { error: "Email address already exists", message: '' });
  }
  
  await User.create({ email, password, ...userData });
  const message = "Registration successful";
  res.redirect('/login', StatusCodes.CREATED, { message });
});

const login = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).render('login', { error: "Please provide Email and password", message: '' });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(StatusCodes.BAD_REQUEST).render('login', { error: "Invalid Email address", message:''});
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.status(StatusCodes.BAD_REQUEST).render('login', { error: "Invalid password", message: ''});
  }

  const payload = {
    userEmail: user.email,
    schoolId: user._id,
    school: user.schoolName,
    role: user.role
  };

  const token =  await jwt.sign(payload, secretKey, { expiresIn: '100m' });
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
  res.redirect('/user', StatusCodes.OK, {message: 'Login successful', error: ''})
});




const loginPage = asyncWrapper(async (req, res) => {
  res.render('login', { validationError: null, message: '', error: ''});
});

const registerPage = asyncWrapper(async (req, res) => {
  res.render('register', { validationError: null, message: '', error: '' });
});

const forgetPasswordPage = asyncWrapper(async (req, res) => {
  res.render('forgetPassword', {message: '', error: '' });
});

const forgetPassword = asyncWrapper(async (req, res) => {
  const { email } = req.body;
  
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(StatusCodes.BAD_REQUEST).render('forgetPassword', { error: "Invalid Email address" });
  }
  
  const resetToken = jwt.sign({ email }, secretKey, { expiresIn: "100m" });
  await sendPasswordResetEmail(email, user.schoolName, resetToken);

  res.status(StatusCodes.OK).render('forgetPassword', { message: "Check Email to reset password", error});
});

const resetPassword = asyncWrapper(async (req, res) => {
  const { token } = req.params;

  try {
    const decodedToken = jwt.verify(token, secretKey);
    res.redirect(`/updatePassword/${token}`);
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).render('resetPassword', { error: "Invalid or expired token" });
  }
});

const updatePasswordPage = asyncWrapper(async (req, res) => {
  const { token } = req.params;
  res.render('updatePassword', { token, error: '' });
});

const updatePassword = asyncWrapper(async (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(StatusCodes.BAD_REQUEST).render('updatePassword', { token, error: "Passwords do not match" });
  }

  try {
    const decodedToken = jwt.verify(token, secretKey);
    const storedToken = tokenStore.get(decodedToken.email);

    if (!storedToken || usedTokens[token]) {
      return res.status(StatusCodes.BAD_REQUEST).render('updatePassword', { token, error: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne(
      { email: decodedToken.email },
      { $set: { password: hashedPassword } }
    );

    tokenStore.delete(decodedToken.email);
    usedTokens[token] = true;
    res.status(StatusCodes.OK).render('login', { message: "Password reset successful" });
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).render('updatePassword', { token, error: "Invalid or expired token" });
  }
});

const logout = asyncWrapper(async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "No token provided" });
  }

  tokenBlackList.add(token);
  res.status(StatusCodes.OK).render('login', { message: "Logout successful" });
});

module.exports = {
  register,
  login,
  loginPage,
  registerPage,
  forgetPassword,
  forgetPasswordPage,
  resetPassword,
  updatePassword,
  updatePasswordPage,
  logout,
};
