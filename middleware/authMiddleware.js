// middleware/authMiddleware.js

import jwt from 'jsonwebtoken';
import UserModel from '../models/userModel.js';

// Route-ları qorumaq üçün middleware
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Tokeni "Bearer " mətnindən ayırırıq
            token = req.headers.authorization.split(' ')[1];

            // Tokeni verifikasiya edirik
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // İstifadəçini ID-yə görə tapıb, şifrə məlumatı xaric olmaqla req obyektinə əlavə edirik
            req.user = await UserModel.findById(decoded.user.id).select('-password');

            // ----> DÜZƏLİŞ BURADADIR <----
            if (!req.user) {
                // Əgər token etibarlıdırsa, amma həmin user bazada yoxdursa...
                return res.status(401).json({ message: 'İcazə yoxdur, bu tokenə aid istifadəçi tapılmadı' });
            }
            // ----> DÜZƏLİŞİN SONU <----

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


const isAdmin = (req, res, next) => {
    // "protect" middleware-i artıq istifadəçini tapıb req.user-ə yerləşdirib.
    // İndi həmin istifadəçinin rolunu yoxlayırıq.
    if (req.user && req.user.role === 'admin') {
        next(); // Əgər admindirsə, növbəti mərhələyə keç
    } else {
        res.status(403).json({ message: 'İcazə yoxdur. Yalnız adminlər.' }); // 403 Forbidden statusu
    }
};

export { protect, isAdmin };