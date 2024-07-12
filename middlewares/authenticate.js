const jwt = require('jsonwebtoken')
const secretKey = process.env.JWT_SECRET_KEY
const User = require('../Models/user')

const authenticate = async (req, res, next) => {
    const token = req.cookies.token //Where it is stored
    if (!token) {
        return res.status(401).json({ message: 'User is not logged in' });
    }

    try {
        const payload = jwt.verify(token.replace("Bearer ", ""), secretKey);
        const user = await User.findById(payload.schoolId);

        if (!user) {
            return res.status(401).json({ message: 'Invalid token: user not found' });
        }

        req.user = {
            userId: payload.schoolId, 
            email: payload.userEmail, 
            school: payload.school,        
            role: payload.role,
            token
        };
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token', error });
    }
};




module.exports = authenticate