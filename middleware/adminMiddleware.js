// middleware/adminMiddleware.js
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); 
    } else {
        res.status(401).json({ message: 'Admin icazəsi yoxdur' });
    }
};

export default admin;