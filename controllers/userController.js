import UserModel from "../models/userModel.js";
import generateToken from '../utils/generateToken.js';
import crypto from 'crypto'; // Node.js-in daxili modulu
import sendEmail from '../utils/sendEmail.js';

// 1. YENİ İSTİFADƏÇİNİN QEYDİYYATI
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Eyni email-ə sahib istifadəçinin mövcud olub-olmadığını yoxlayırıq
        const userExists = await UserModel.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'Bu email artıq istifadə olunur' });
        }

        // Yeni istifadəçini yaradırıq (şifrə modelin içində hash olunur)
        const user = await UserModel.create({
            name,
            email,
            password,
        });

        if (user) {
            const token = generateToken(user);
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
        console.error(error);
        res.status(500).json({ message: 'Server xətası baş verdi' });
    }
};

// 2. İSTİFADƏÇİNİN GİRİŞİ
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });

        if (user && (await user.passwordControl(password))) {
            const token = generateToken(user);
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
        console.error(error);
        res.status(500).json({ message: 'Server xətası baş verdi' });
    }
};

// 3. İSTİFADƏÇİNİN ÇIXIŞI
const logoutUser = (req, res) => {
    // Bu funksiya adətən cookie-ni təmizləyir. Frontend tərəfdə isə token localStorage-dan silinir.
    // Sizin kodunuz cookie ilə işləyirsə, bu doğrudur.
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Uğurla çıxış edildi' });
};

// 4. DAXİL OLMUŞ İSTİFADƏÇİNİN MƏLUMATLARINI Gətirmək
const getUserProfile = (req, res) => {
    // Bu route-a gəlmədən öncə bir "protect" middleware-i tokeni yoxlayıb req.user-i təyin etməlidir.
    if (req.user) {
        res.status(200).json({
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
        });
    } else { // DÜZƏLİŞ: "else" bloku əlavə edildi
        res.status(401).json({ message: 'İcazə yoxdur (unauthorized)' });
    }
};

// ŞİFRƏ SIFIRLAMA SORĞUSU
const forgotPassword = async (req, res) => {
    try {
        const user = await UserModel.findOne({ email: req.body.email });

        // Təhlükəsizlik üçün: email bazada olmasa belə, "uğurlu" mesajı qaytarırıq
        if (!user) {
            return res.status(200).json({ message: 'Email göndərildi (əgər mövcuddursa)' });
        }

        // Token yaratmaq
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Tokeni bazaya yazmazdan əvvəl hash edirik (daha təhlükəsiz)
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        // Token üçün son istifadə tarixi (10 dəqiqə)
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        // İstifadəçiyə göndəriləcək link (hash edilməmiş token ilə)
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        const message = `
            <h1>Şifrə Sıfırlama Sorğusu</h1>
            <p>Şifrənizi sıfırlamaq üçün aşağıdakı linkə daxil olun:</p>
            <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
            <p>Bu link 10 dəqiqə sonra qüvvədən düşəcək.</p>
        `;

        await sendEmail({
            email: user.email,
            subject: 'StyleFolio Şifrə Sıfırlama',
            html: message
        });

        res.status(200).json({ message: 'Email göndərildi' });

    } catch (error) {
        // ... (xəta idarəetməsi)
    }
};


// YENİ ŞİFRƏNİ TƏYİN ETMƏ
const resetPassword = async (req, res) => {
    try {
        const resetToken = req.params.token;
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        const user = await UserModel.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() } // Vaxtı keçməyib?
        });

        if (!user) {
            return res.status(400).json({ message: 'Token yanlış və ya vaxtı keçib' });
        }

        // Yeni şifrəni təyin et
        user.password = req.body.password;
        // Tokeni təmizlə
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ message: 'Şifrə uğurla yeniləndi' });

    } catch (error) {
        // ...
    }
};



const getAllUsers = async (req, res) => {
    const users = await User.find({});
    res.json(users);
};


const deleteUser = async (req, res) => {
    try {
        const userIdToDelete = req.params.id;

        // Adminin öz-özünü silməsinin qarşısını alaq
        if (req.user._id.toString() === userIdToDelete) {
            return res.status(400).json({ message: 'Admin öz hesabını silə bilməz' });
        }

        const user = await UserModel.findById(userIdToDelete);

        if (user) {
            // DÜZƏLİŞ: user.remove() yerinə daha müasir deleteOne istifadə edirik
            await UserModel.deleteOne({ _id: userIdToDelete });
            res.json({ message: 'İstifadəçi uğurla silindi' });
        } else {
            res.status(404).json({ message: 'İstifadəçi tapılmadı' });
        }
    } catch (error) {
        // HƏMİŞƏ xətanı terminalda loglayırıq!
        console.error('DELETE USER ERROR:', error);
        // Frontend-ə daha detallı cavab qaytaraq
        res.status(500).json({ message: `Server xətası: ${error.message}` });
    }
};


const updateUser = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
            });
        } else {
            res.status(404).json({ message: 'İstifadəçi tapılmadı' });
        }
    } catch (error) {
        // HƏMİŞƏ xətanı terminalda loglayırıq!
        console.error('UPDATE USER ERROR:', error);

        // Əgər xəta təkrar email ilə bağlıdırsa, xüsusi mesaj qaytaraq
        if (error.code === 11000) { // MongoDB duplicate key error
             return res.status(400).json({ message: `Bu email (${error.keyValue.email}) artıq başqa istifadəçi tərəfindən istifadə olunub.` });
        }

        // Digər xətalar üçün ümumi mesaj
        res.status(500).json({ message: `Server xətası: ${error.message}` });
    }
};

// Bütün funksiyaları ES Module formatında export edirik
export { registerUser, loginUser, logoutUser, getUserProfile, forgotPassword, resetPassword, getAllUsers, deleteUser, updateUser };