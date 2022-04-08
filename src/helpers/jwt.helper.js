const jwt = require('jsonwebtoken');
// models
const User = require('../plugins/users/models/user.model').model;
const mongoose = require('mongoose');

const SECRET_KEY = process.env.SECRET_KEY;

decode = async(req, res, next) => {
    if (!req.headers['authorization']) {
        return res.status(400).json({ success: false, message: 'Bad request' });
      }
      const accessToken = req.headers.authorization.split(' ')[1];
    try {
        const decoded = await jwt.verify(accessToken, SECRET_KEY);
        req.userId = decoded._id;
        const user = await User.findOne({ _id: mongoose.Types.ObjectId(decoded._id) });
        if(user){
            req.user = user;
            return next();
        }else{
            return res.status(400).json({ success: false, message: 'Bad request' });
        }
    } catch (error) {
        return res.status(401).json({code: 400, success: false, message: error.message });
    }
}

encode = async (req, res, next) => {
    try {
        const Email  = req.body.Email;
        const user = await User.findOne({ Email: Email });
        if(user){
            const payload = {
                _id: user._id,
            };
            const authToken = await jwt.sign(payload, SECRET_KEY);
            req.authToken = authToken;
            next();
        }else{
            return res.status(400).json({code: 400, success: false, message: "Email/Password invalid" });
        }
    } catch (error) {
        return res.status(500).json({code: 500, success: false, message: error.message });
    }
},

generateRandomString = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

socialEncode = async (req, res) => {
    try {
        const Email  = req.body.Email;
        const user = await User.findOne({ Email: Email });
        if(user){
            const payload = {
                _id: user._id,
            };
            const authToken = await jwt.sign(payload, SECRET_KEY);
            req.authToken = authToken;
            return;
        }else{
            return res.status(400).json({code: 400, success: false, message: "Email/Password invalid" });
        }
    } catch (error) {
        return res.status(500).json({code: 500, success: false, message: error.message });
    }
},

module.exports = {
    decode,
    encode,
    generateRandomString,
    socialEncode
}