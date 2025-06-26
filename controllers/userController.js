import UserModel from "../models/userModel.js";
import ClothesModel from "../models/clothesModel.js";
import generateToken from '../utils/generateToken.js';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';


// 1. YENİ İSTİFADƏÇİNİN QEYDİYYATI
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await UserModel.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'Bu email artıq istifadə olunur' });
        }

        const user = await UserModel.create({ name, email, password });

        if (user) {
            const token = generateToken(user._id); // generateToken adətən yalnız id qəbul edir
            res.status(201).json({
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
            });
        } else {
            res.status(400).json({ message: 'İstifadəçi məlumatları yanlışdır' });
        }
    } catch (error) {
        console.error('REGISTER USER ERROR:', error);
        res.status(500).json({ message: 'Server xətası baş verdi' });
    }
};

// 2. İSTİFADƏÇİNİN GİRİŞİ
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });

        if (user && (await user.passwordControl(password))) {
            const token = generateToken(user._id);
            res.status(200).json({
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } else {
            res.status(401).json({ message: 'Email və ya şifrə yanlışdır' });
        }
    } catch (error) {
        console.error('LOGIN USER ERROR:', error);
        res.status(500).json({ message: 'Server xətası baş verdi' });
    }
};

// 3. İSTİFADƏÇİNİN ÇIXIŞI
const logoutUser = (req, res) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Uğurla çıxış edildi' });
};

// =======================================================
// YENİ və DÜZƏLDİLMİŞ FUNKSİYALAR
// =======================================================

// 4. DAXİL OLMUŞ İSTİFADƏÇİNİN MƏLUMATLARINI Gətirmək
const getUserProfile = async (req, res) => {
    try {
        // req.user "protect" middleware-dən gəlir
        const user = await UserModel.findById(req.user._id).select('-password');

        if (user) {
            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(404).json({ message: 'İstifadəçi tapılmadı' });
        }
    } catch (error) {
        console.error('GET USER PROFILE ERROR:', error);
        res.status(500).json({ message: 'Server xətası' });
    }
};


// 5. DAXİL OLMUŞ İSTİFADƏÇİNİN PROFİLİNİ YENİLƏMƏK
const updateUserProfile = async (req, res) => {
    try {
        const user = await UserModel.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;

            if (req.body.password) {
                // Yeni şifrəni databazaya yazmazdan əvvəl Mongoose-un pre('save') metodu
                // onu avtomatik hash-ləməlidir (userModel.js-də təyin olunubsa).
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                token: generateToken(updatedUser._id), // Yeni məlumatlarla yeni token
            });
        } else {
            res.status(404).json({ message: 'İstifadəçi tapılmadı' });
        }
    } catch (error) {
        console.error('UPDATE USER PROFILE ERROR:', error);
         if (error.code === 11000) {
            return res.status(400).json({ message: 'Bu email artıq mövcuddur' });
        }
        res.status(500).json({ message: 'Server xətası' });
    }
};


// ... Qalan funksiyalar (forgotPassword, resetPassword, Admin funksiyaları) olduğu kimi qalır ...

const forgotPassword = async (req, res) => {
    // ... Sizin mövcud kodunuz ...
};
const resetPassword = async (req, res) => {
    // ... Sizin mövcud kodunuz ...
};
const getAllUsers = async (req, res) => {
    // ... Sizin mövcud kodunuz ...
};
const deleteUser = async (req, res) => {
    // ... Sizin mövcud kodunuz ...
};
const updateUser = async (req, res) => {
    // ... Sizin mövcud kodunuz ...
};

const getChatUsers = async (req, res) => {
    try {
        // Hazırkı istifadəçi xaric, bütün istifadəçiləri tapırıq
        // Təhlükəsizlik üçün yalnız lazımi sahələri (id, name, email) qaytarırıq
        const users = await UserModel.find({ _id: { $ne: req.user._id } }).select('_id name email');
        res.json(users);
    } catch (error) {
        console.error('GET CHAT USERS ERROR:', error);
        res.status(500).json({ message: 'Server xətası' }); 
    }
};


// Bütün funksiyaları ES Module formatında export edirik
export {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    updateUserProfile, // Yeni funksiya
    forgotPassword,
    resetPassword,
    getAllUsers,
    deleteUser,
    updateUser,
    getChatUsers
};
