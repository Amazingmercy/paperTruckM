require('dotenv').config()
const googleapis = require('googleapis')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const secretKey = process.env.JWT_SECRET_KEY
const asyncWrapper = require('../middlewares/asyncWrapper')

const sendEmail = async(recipient, message, html = '') => {
  // Create OAuth2 client
  const oAuth2Client = new googleapis.oauth2.Client({
    clientId: clientId,
    clientSecret: process.env.CLIENT_SECRET,
  });

  try {
    // Get access token
    const accessToken = await oAuth2Client.getAccessToken();

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.SENDER_EMAIL, // Your Gmail address
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        accessToken: accessToken
      }
    });

    const mailOptions = {
      from: 'Paper Truck',
      to: recipient,
      subject: "Reset Password",
      text: message,
      html: html
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.response);
  } catch (error) {
    console.log('Error sending email: ', error);
  }
}


const sendPasswordResetEmail = asyncWrapper(async (email, schoolName, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/resetPassword/${resetToken}`;

  const message = `<div><h2>Hello ${schoolName},</h2><br>Looks like you misplaced your password for Paper Truck. No worries, it happens to the best of us!<br> Click the button below to reset your password and continue your journey of Paper submission to getting Amazing rewards.</div>
  <a href="${resetUrl}" style="background-color: #4CAF50; border: none; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer;">Reset Password</a>
  <div><h3>If you didn't request a password reset, you can safely ignore this email.</h3></div>
  <div>See you soon,<br><h2>The Paper Truck Team</h2></div>`;
  await sendEmail(email, message);
  console.log('Password reset email sent successfully.');
});



const generateJWT = asyncWrapper(async (userId,userSchool, userEmail, userRole) => {
  const payload = {
    userId: userId,
    userEmail: userEmail,
    school: userSchool,
    role: userRole
  };

  return await jwt.sign(payload, secretKey, { expiresIn: '100m' });
})




module.exports = {
  generateJWT,
  sendPasswordResetEmail
}