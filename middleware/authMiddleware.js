import jwt from 'jsonwebtoken';
import UserModel from '../models/userModel.js';

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await UserModel.findById(decoded.user.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'İcazə yoxdur, bu tokenə aid istifadəçi tapılmadı' });
            }

            next(); 
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
    if (req.user && req.user.role === 'admin') {
        next(); 
    } else {
        res.status(403).json({ message: 'İcazə yoxdur. Yalnız adminlər.' }); 
    }
};

export { protect, isAdmin };