
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import './configs/passport.js';
import closesRouter from './router/closesRouter.js';
import userRoutes from './router/userRoutes.js';
import { connectDB } from './configs/config.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';



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

app.use ('/api/closes', closesRouter)
app.use ('/api/users', userRoutes)

connectDB()
app.listen(5000, () => {
    console.log('server isleyir');
})