// utils/sendEmail.js
import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: `StyleFolio <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.message // Dəyişiklik burada
    };

    await transporter.sendMail(mailOptions);
};

export default sendEmail;