
const nodemailer = require("nodemailer");

const doumentSend = async (email, title, body, attachments) => {
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
            secure: false,
        });

        let mailOptions = {
            from: `"Varn Hrms" <${process.env.MAIL_USER}>`,
            to: email,
            subject: title,
            html: body,
            attachments: attachments || [],
        };

        let info = await transporter.sendMail(mailOptions);
        console.log(info.response);
        return info;
    } catch (error) {
        console.log(error.message);
        return error.message;
    }
};

module.exports = doumentSend;