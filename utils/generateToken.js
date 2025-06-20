import jwt from 'jsonwebtoken';

// Funksiya "user" adlı bir parametr qəbul edir.
const generateToken = (user) => {
    // Funksiyanın daxilində yalnız "user" parametrindən istifadə edirik.
    // "savedUser" və ya başqa bir addan yox.
    return jwt.sign(
        {
            user: {
                id: user._id,       // Düzəliş: savedUser._id YOX, user._id
                name: user.name,    // Düzəliş: savedUser.name YOX, user.name
                email: user.email,  // Düzəliş: savedUser.email YOX, user.email
                role: user.role     // Düzəliş: savedUser.role YOX, user.role
            }
        },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

export default generateToken;