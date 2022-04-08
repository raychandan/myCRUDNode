const mongoose = require('mongoose');

const name = 'User';

const schema = new mongoose.Schema({
    Name: {
        type: String,
        required: true,
    },
    Email: {
        type: String,
        required: true,
        unique: true
    },
    Password: {
        type: String
    },
    AccessToken: {
        type: String,
        default: ''
    },
    ResetPasswordToken: {
        type: String,
        default: ''
    },
    IsSocialLogin: {
        type: Boolean,
        default: false
    },
    Base64image: {
        type: String,
        default: ''
    },
    Gender: {
        type: String,
        default: ''
    },
    DateOfBirth: {
        type: String,
        default: ''
    }
});

schema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.Password;
    return obj;
};

const model = mongoose.model(name, schema);
module.exports = {
    name: name,
    model: model,
    schema: schema
};