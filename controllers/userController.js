import UserModel from "../models/userModel.js";
import generateToken from '../utils/generateToken.js';

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
            const token = generateToken(user._id);
            res.status(201).json({
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
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
            const token = generateToken(user._id);
            res.status(200).json({
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
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

// Bütün funksiyaları ES Module formatında export edirik
export { registerUser, loginUser, logoutUser, getUserProfile };