import express from 'express';
import { Resend } from 'resend';

const router = express.Router();


const resend = new Resend(process.env.RESEND_API_KEY);


router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;


        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: "Bütün sahələr doldurulmalıdır." });
        }

        const { data, error } = await resend.emails.send({
            from: 'Stylefolio Contact Form <onboarding@resend.dev>', 
            to: ['hacizadeataxann@gmail.com'], 
            subject: `Stylefolio Əlaqə: ${subject}`,
            reply_to: email, 
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2 style="color: #333;">Stylefolio Vebsaytından Yeni Mesaj</h2>
                    <p>Aşağıdakı şəxsdən yeni bir mesaj aldınız:</p>
                    <hr>
                    <p><strong>Ad:</strong> ${name}</p>
                    <p><strong>E-poçt:</strong> ${email}</p>
                    <p><strong>Mövzu:</strong> ${subject}</p>
                    <p><strong>Mesaj:</strong></p>
                    <p style="background-color: #f4f4f4; padding: 15px; border-radius: 5px;">${message}</p>
                    <hr>
                    <p style="font-size: 0.9em; color: #777;">Bu mesaj Stylefolio vebsaytının əlaqə formu vasitəsilə göndərilib.</p>
                </div>
            `
        });


        if (error) {
            console.error("Resend error:", error);
            return res.status(400).json({ message: "Mesaj göndərilərkən xəta baş verdi.", error });
        }


        res.status(200).json({ message: 'Mesajınız uğurla göndərildi!' });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: 'Daxili server xətası baş verdi.' });
    }
});

export default router;
