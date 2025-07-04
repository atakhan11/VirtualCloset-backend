import UserModel from "../models/userModel.js";
import ClothesModel from "../models/clothesModel.js";
import generateToken from '../utils/generateToken.js';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import bcrypt from 'bcryptjs';
import Activity from "../models/activityModel.js";


const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await UserModel.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'Bu email artıq istifadə olunur' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await UserModel.create({ name, email, password, password: hashedPassword });

        if (user) {
            const token = generateToken(user._id);
            await Activity.create({
      user: user._id,
      actionType: 'USER_REGISTERED',
      message: 'sistemdə yeni istifadəçi kimi qeydiyyatdan keçdi.',
    });
            res.status(201).json({
                token,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar 
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


const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email }).select('+password');;

        if (user && (await user.passwordControl(password))) { 
            const token = generateToken(user._id);
            res.status(200).json({
                token,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar 
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


const logoutUser = (req, res) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Uğurla çıxış edildi' });
};


const getUserProfile = async (req, res) => {
    try {
        
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
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                avatar: updatedUser.avatar,
                token: generateToken(updatedUser._id), 
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



const forgotPassword = async (req, res) => {
    try {
        const user = await UserModel.findOne({ email: req.body.email });
        if (!user) {
            return res.status(200).json({ message: 'Sorğu göndərildi.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

        const updatedUser = await user.save();
        
      

        if (!updatedUser.resetPasswordToken) {
            console.log("KRİTİK XƏTA: Save əməliyyatı tokeni bazaya YAZMADI!");
            throw new Error("Tokeni bazaya yazmaq mümkün olmadı.");
        }

        const resetURL = `http://localhost:5173/reset-password/${resetToken}`;
        const message = `<p>Şifrəni sıfırlamaq üçün bu linkə klikləyin: <a href="${resetURL}">Sıfırla</a></p>`;

        await sendEmail({
            email: user.email,
            subject: 'Şifrə Sıfırlama Sorğusu',
            message: message
        });

        res.status(200).json({ message: 'Sıfırlama linki email-inizə göndərildi.' });

    } catch (error) {
        console.error("FORGOT PASSWORD ERROR:", error);
        res.status(500).json({ message: 'Server xətası' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await UserModel.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Şifrə sıfırlama linki yanlışdır və ya vaxtı keçib.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        
        await user.save();

        const token = generateToken(user._id);
        res.status(200).json({ token, message: 'Şifrə uğurla yeniləndi.' });

    } catch (error) {
        console.error("RESET PASSWORD ERROR:", error);
        res.status(500).json({ message: 'Server xətası' });
    }
};
const getAllUsers = async (req, res) => {
    try {
        
        const users = await UserModel.find({}).select('-password'); 
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server xətası' });
    }
};

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
           
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            
           
            if (req.body.isAdmin !== undefined) {
                user.isAdmin = req.body.isAdmin;
            }

            const updatedUser = await user.save();

          
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
        const users = await UserModel.find({ _id: { $ne: req.user._id } })
                                     .select('_id name email avatar'); 

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



export {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    updateUserProfile, 
    forgotPassword,
    resetPassword,
    getAllUsers,
    deleteUser,
    updateUser,
    getChatUsers,
    deleteUserProfile
};
