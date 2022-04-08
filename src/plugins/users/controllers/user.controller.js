const User = require('../models/user.model').model;
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { generateRandomString, socialEncode } = require('../../../helpers/jwt.helper');
const { sendMail,getEmailTemplate }= require('../../../helpers/email.helper');


const register = (body, req) => {
    return new Promise(async (resolve, reject) => {
        if (!body.Email || !body.Name || !body.Password) {
            return reject({
                code: 400,
                error: {
                    message: "Bad Request"
                }
            });
        }

        try{
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.Password, salt);
            req.body.Password = hashedPassword;

            const user = new User(req.body);
            await user.save();
            resolve({
                code: 200,
                data: user
            });
        }
        catch (err){
            return reject({
                code: 500,
                error: err.message
            });
        }
    });
};

const socialLogin = (body, req, res) => {
    return new Promise(async (resolve, reject) => {
        if (!body.Email || !body.Name) {
            return reject({
                code: 400,
                error: {
                    message: "Bad Request"
                }
            });
        }

        try{
            let user = await User.findOne({Email:body.Email});
            if(!user){
                const usr = new User(req.body);
                await usr.save();
                await socialEncode(req, res);
                
                let Updateusr = await User.findOneAndUpdate({_id:usr._id}, {AccessToken:req.authToken}, {
                    new: true
                });
                resolve({
                    code: 200,
                    data: Updateusr
                });
            }else{
                await socialEncode(req, res);
                
                let Updateusr = await User.findOneAndUpdate({_id:user._id}, {AccessToken:req.authToken}, {
                    new: true
                });

                resolve({
                    code: 200,
                    data: Updateusr
                });
            }
        }
        catch (err){
            return reject({
                code: 500,
                error: err.message
            });
        }
    });
};

const login = (body, req) => {
    return new Promise(async (resolve, reject) => {
        if (!body.Email || !body.Password) {
            return reject({
                code: 400,
                error: {
                    message: "Bad Request"
                }
            });
        }

        try {
            let user = await User.findOne({Email:body.Email});
            if(!user){
                return reject({
                    code: 400,
                    error: {
                        message: "Email/Password invalid"
                    }
                });
            }else{
                const isMatch = await bcrypt.compare(body.Password,user.Password);
    
                if (!isMatch)
                    return reject({
                        code: 400,
                        error: {
                            message: "Email/Password invalid"
                        }
                    });
                else{
                    let usr = await User.findOneAndUpdate({_id:user._id}, {AccessToken:req.authToken}, {
                        new: true
                    });
                    resolve({
                        code: 200,
                        data: usr
                    });
                }     
            }
        } catch (e) {
            return reject({
                code: 500,
                error: e.message
            });
        }
    });
};

const getUserById = (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await User.findOne({_id:mongoose.Types.ObjectId(req.params.id)});
            if(!user){
                return reject({
                    code: 400,
                    error: {
                        message: "Something went wrong"
                    }
                });
            }else{
                resolve({
                    code: 200,
                    data: user
                });    
            }
        } catch (e) {
            return reject({
                code: 500,
                error: e.message
            });
        }
    });
};

const forgetPassword = (body, req) => {
    return new Promise(async (resolve, reject) => {
        if (!body.Email) {
            return reject({
                code: 400,
                error: {
                    message: "Bad Request"
                }
            });
        }

        try {
            let user = await User.findOne({Email:body.Email});
            if(!user){
                return reject({
                    code: 400,
                    error: {
                        message: "Email not found"
                    }
                });
            }else{
                const token = generateRandomString();
                User.findOneAndUpdate({ Email: body.Email }, { $set: { ResetPasswordToken: token } }).then(async (user) => {
                    if (user) {
                        var content = '';
                        const template = await getEmailTemplate('Forgot Password');
                        content += template.content.replace(/{{userName}}/gi, user.Name);
                        content += template.content.replace(/{{reset_url}}/gi, 'http://localhost:4200/auth' + '/update-password/' + token);
                        sendMail(user.Email, template.subject, content, template.type);
                    }
                    resolve({
                        code: 200,
                        data: {"Message":'You will received an email with instructions to reset your password'}
                    });   
                }).catch(err => {
                    return reject({
                        code: 500,
                        error: err.message
                    });
                });
                
            }
        } catch (e) {
            return reject({
                code: 500,
                error: e.message
            });
        }
    });
};

const resetPassword = async (body,req) => {
    return new Promise(async (resolve, reject) => {
        if (!body.Password) {
            return reject({
                code: 400,
                error: {
                    message: "Bad Request"
                }
            });
        }

        try {
            let user = await User.findOne({ResetPasswordToken:body.ResetPasswordToken});
            if(!user){
                return reject({
                    code: 400,
                    error: {
                        message: "Invalid Token"
                    }
                });
            }else{
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(req.body.Password, salt);
                
                User.findOneAndUpdate({ _id: mongoose.Types.ObjectId(user._id) }, { $set: { Password: hashedPassword } }).then(async (user) => {
                    resolve({
                        code: 200,
                        data: {"Message":'Password changed successfully!'}
                    });   
                }).catch(err => {
                    return reject({
                        code: 500,
                        error: err.message
                    });
                });
                
            }
        } catch (e) {
            return reject({
                code: 500,
                error: e.message
            });
        }
    });
}

const updateUser = (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await User.findOne({_id:mongoose.Types.ObjectId(req.params.id)});
            if(!user){
                return reject({
                    code: 400,
                    error: {
                        message: "Something went wrong"
                    }
                });
            }else{
                let updateUserObject = {};
                updateUserObject['Name'] = req.body.Name;
                updateUserObject['Gender'] = req.body.Gender;
                updateUserObject['DateOfBirth'] = req.body.DateOfBirth;
                if(req.body.Base64image && req.body.isFile)
                    updateUserObject['Base64image'] = req.body.Base64image;

                User.findOneAndUpdate({ _id: mongoose.Types.ObjectId(user._id) }, { $set: updateUserObject }, {
                    new: true
                }).then(async (usr) => {
                    resolve({
                        code: 200,
                        data: usr
                    });   
                }).catch(err => {
                    return reject({
                        code: 500,
                        error: err.message
                    });
                });  
            }
        } catch (e) {
            return reject({
                code: 500,
                error: e.message
            });
        }
    });
};

module.exports = {
    register,
    login,
    getUserById,
    forgetPassword,
    resetPassword,
    socialLogin,
    updateUser
};
