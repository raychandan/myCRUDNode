const nodemailer = require('nodemailer');

// setup a transport for sending email
const transporter = nodemailer.createTransport({
    host: "mail.24livehost.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: "testna17@24livehost.com",
        pass: "Bvptk0xzzjG6",
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
      }
});

exports.getEmailTemplate = (templateName) => {
    const emailTemplateModel = require("../plugins/email-templates/models/email_templates.model").model;
    return new Promise((resolve, reject) => {
        emailTemplateModel.findOne({ name: templateName, status: true }, ['name', 'subject', 'type', 'content'], (err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result);
        })
    })
}

exports.sendMail = async(to, subject, body, bodyType, sender) => {

    let emailObject = {
        from: 'testna17@24livehost.com',
        to: to,
        subject: subject,
    }
    
    if (bodyType == 'text') {
        emailObject['text'] = body;
    } else {
        emailObject['html'] = body;
    }
    // send mail with defined transport object
    try{
        return await transporter.sendMail(emailObject);
    }catch(err){
        console.log("Email Error",err);
    }
}