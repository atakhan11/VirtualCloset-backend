import path from 'path';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import 'dotenv/config'; 
import scrapeRoutes from './router/scrapeRoutes.js';
import './configs/passport.js';
import userRoutes from './router/userRoutes.js';
import { connectDB } from './configs/config.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import adminRoutes from './router/adminRoutes.js';
import clothesRoutes from './router/clothesRoutes.js';
import outfitRoutes from './router/outfitRoutes.js';
import wishlistRoutes from './router/wishlistRoutes.js';
import aiRoutes from './router/aiRoutes.js';
import contactRoutes from './router/contactRoutes.js'; 
import uploadRoutes from './router/uploadRoutes.js';
import paymentRoutes from './router/paymentRoutes.js';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors('*')); 
app.use(cookieParser());

app.use(
    session({
        secret: process.env.SESSION_SECRET || 'supersecretkey', 
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/clothes', clothesRoutes);
app.use('/api/outfits', outfitRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/contact', contactRoutes); 
app.use('/api/upload', uploadRoutes);
app.use('/api/scrape', scrapeRoutes);
app.use('/api/payments', paymentRoutes);


const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'public')));

connectDB();

const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda işləyir...`);
});
