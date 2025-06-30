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
            const token = generateToken(user._id);
            res.status(201).json({
                token,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar // DÜZƏLİŞ: Avatar sahəsi cavaba əlavə edildi
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

// 2. İSTİFADƏÇİNİN GİRİŞİ (YENİLƏNMİŞ)
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email }).select('+password');;

        // DİQQƏT: Sizin kodunuzda 'passwordControl' yazılıb. Mən standart 'matchPassword' istifadə edirəm.
        // Zəhmət olmasa, bunu öz funksiya adınızla əvəz edin.
        if (user && (await user.passwordControl(password))) { 
            const token = generateToken(user._id);
            res.status(200).json({
                token,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar // DÜZƏLİŞ: Avatar sahəsi cavaba əlavə edildi
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

            if (req.body.avatar) {
            user.avatar = req.body.avatar;
        }

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
                avatar: updatedUser.avatar,
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
    try {
        // 1. Emaili tapırıq
        const user = await UserModel.findOne({ email: req.body.email });

        // 2. İstifadəçi tapılmasa belə, təhlükəsizlik üçün uğurlu mesaj qaytarırıq
        if (!user) {
            return res.status(200).json({ message: 'Əgər email-iniz sistemdə mövcuddursa, sizə şifrə sıfırlama linki göndərildi.' });
        }

        // 3. İstifadəçi üçün xüsusi sıfırlama tokeni yaradırıq (bu metod userModel-də olmalıdır)
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false }); // pre-save hook-larını ötürmək üçün

        // 4. Frontend-də istifadə olunacaq sıfırlama URL-ni yaradırıq
        // Məsələn: http://localhost:5173/reset-password/TOKEN
        const resetURL = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

        const message = `Şifrənizi sıfırlamaq üçün bu linkə daxil olun: ${resetURL}\n\nƏgər bu sorğunu siz etməmisinizsə, bu email-ə məhəl qoymayın.`;

        try {
            // 5. Email göndərmə servisini çağırırıq (hazırda kommentdədir)
            /*
            await sendEmail({
                email: user.email,
                subject: 'Şifrə Sıfırlama Sorğusu (10 dəqiqə ərzində etibarlıdır)',
                message
            });
            */

            res.status(200).json({ message: 'Sıfırlama linki email-inizə göndərildi.' });

        } catch (err) {
            // Email göndərilməzsə, tokeni databazadan təmizləyirik
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ message: 'Email göndərilərkən xəta baş verdi.' });
        }
    } catch (error) {
        console.error("FORGOT PASSWORD ERROR:", error);
        res.status(500).json({ message: 'Server xətası' });
    }
};
const resetPassword = async (req, res) => {
    try {
        // 1. URL-dən gələn tokeni şifrələyib databazadakı ilə müqayisə edirik
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        // 2. Tokenə uyğun və vaxtı keçməmiş istifadəçini tapırıq
        const user = await UserModel.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() } // Tokenin vaxtının keçmədiyini yoxlayırıq
        });

        // 3. Əgər token səhvdirsə və ya vaxtı keçibsə, xəta qaytarırıq
        if (!user) {
            return res.status(400).json({ message: 'Şifrə sıfırlama linki yanlışdır və ya vaxtı keçib.' });
        }

        // 4. Yeni şifrəni təyin edib, token məlumatlarını təmizləyirik
        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        // 5. Yeni token ilə istifadəçini sistemə daxil edirik
        const token = generateToken(user._id);
        res.status(200).json({ 
            token, 
            message: 'Şifrə uğurla yeniləndi.' 
        });

    } catch (error) {
        console.error("RESET PASSWORD ERROR:", error);
        res.status(500).json({ message: 'Server xətası' });
    }
};
const getAllUsers = async (req, res) => {
    try {
        const users = await UserModel.find({}).select('-password'); // Şifrəni göstərmirik
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server xətası' });
    }
};

// @desc    İstifadəçini ID-yə görə sil (Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id);
        if (user) {
            if (user.isAdmin) {
                return res.status(400).json({ message: 'Admin istifadəçini silmək olmaz' });
            }
            await user.deleteOne();
            res.json({ message: 'İstifadəçi uğurla silindi' });
        } else {
            res.status(404).json({ message: 'İstifadəçi tapılmadı' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server xətası' });
    }
};
const updateUser = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id);

        if (user) {
            // Adminin yeniləyə biləcəyi sahələri təyin edirik
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            
            // 'isAdmin' statusunu yalnız təyin edildikdə dəyişirik
            if (req.body.isAdmin !== undefined) {
                user.isAdmin = req.body.isAdmin;
            }

            const updatedUser = await user.save();

            // Cavab olaraq şifrəni qaytarmırıq
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
            });
        } else {
            res.status(404).json({ message: 'İstifadəçi tapılmadı' });
        }
    } catch (error) {
        console.error("UPDATE USER (ADMIN) ERROR:", error);
        res.status(500).json({ message: 'Server xətası' });
    }
};

const getChatUsers = async (req, res) => {
    try {
        // Hazırkı istifadəçi xaric, bütün istifadəçiləri tapırıq
        // və indi 'avatar' sahəsini də sorğuya əlavə edirik
        const users = await UserModel.find({ _id: { $ne: req.user._id } })
                                     .select('_id name email avatar'); // <--- ƏSAS DƏYİŞİKLİK BURADADIR

        res.json(users);
    } catch (error) {
        console.error('GET CHAT USERS ERROR:', error);
        res.status(500).json({ message: 'Server xətası' }); 
    }
};


const deleteUserProfile = async (req, res) => {
    try {
        const user = await UserModel.findById(req.user._id);

        if (user) {
            // Bu hissə istəyə bağlıdır: İstifadəçi silinəndə onun bütün məlumatları da silinsinmi?
            // await Clothes.deleteMany({ user: req.user._id });
            // await Outfit.deleteMany({ user: req.user._id });
            // await WishlistItem.deleteMany({ user: req.user._id });

            await user.deleteOne();
            res.json({ message: 'Hesab uğurla silindi' });
        } else {
            res.status(404);
            throw new Error('İstifadəçi tapılmadı');
        }
    } catch (error) {
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
    getChatUsers,
    deleteUserProfile
};
