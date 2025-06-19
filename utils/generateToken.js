// utils/generateToken.js

import jwt from 'jsonwebtoken'; // "require" yerinə "import" istifadə edirik

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d' // Tokenin etibarlılıq müddəti
    });
};

// "module.exports" yerinə "export default" istifadə edirik
export default generateToken;