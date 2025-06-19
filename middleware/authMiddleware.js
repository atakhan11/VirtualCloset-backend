// middleware/authMiddleware.js

import jwt from 'jsonwebtoken';
import UserModel from '../models/userModel.js';

// Route-ları qorumaq üçün middleware
const protect = async (req, res, next) => {
    let token;

    // Header-da "Authorization" və "Bearer" sözü ilə başlayan tokeni axtarırıq
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Tokeni "Bearer " mətnindən ayırırıq
            token = req.headers.authorization.split(' ')[1];

            // Tokeni verifikasiya edirik
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // İstifadəçini ID-yə görə tapıb, şifrə məlumatı xaric olmaqla req obyektinə əlavə edirik
            req.user = await UserModel.findById(decoded.id).select('-password');

            next(); // Hər şey qaydasındadırsa, növbəti mərhələyə (controller-ə) keç
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'İcazə yoxdur, token xətası' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'İcazə yoxdur, token tapılmadı' });
    }
};

// Adlı export istifadə edirik
export { protect };