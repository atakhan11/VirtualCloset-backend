import jwt from 'jsonwebtoken';

const generateToken = (user) => {

    return jwt.sign(
        {
            user: {
                id: user._id,       
                name: user.name,    
                email: user.email,  
                role: user.role     
            }
        },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

export default generateToken;