import path from 'path';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import './configs/passport.js';
import userRoutes from './router/userRoutes.js';
import { connectDB } from './configs/config.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import adminRoutes from './router/adminRoutes.js';
import clothesRoutes from './router/clothesRoutes.js';
import outfitRoutes from './router/outfitRoutes.js';
import wishlistRoutes from './router/wishlistRoutes.js';


const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors('*'))
app.use(cookieParser())

app.use(
    session({
        secret: 'supersecretkey', // Bunu .env faylında saxlamaq daha yaxşıdır
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());


app.use ('/api/users', userRoutes)
app.use('/api/admin', adminRoutes);
app.use('/api/clothes', clothesRoutes);
app.use('/api/outfits', outfitRoutes);
app.use('/api/wishlist', wishlistRoutes);

const __dirname = path.resolve(); // Bu sətir ESM-də __dirname-i düzgün işləməsi üçün lazımdır
app.use(express.static(path.join(__dirname, 'public')));

connectDB()
app.listen(5000, () => {
    console.log('server isleyir');
})