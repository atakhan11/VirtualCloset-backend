// middleware/adminMiddleware.js
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); // İstifadəçi mövcuddursa və rolu "admin"-dirsə, davam et
    } else {
        res.status(401).json({ message: 'Admin icazəsi yoxdur' });
    }
};

export default admin;