import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true // E-poçtların təkrar olunmasının qarşısını alır
        },
        password: {
            type: String,
            required: function() {
                // Yalnız googleId yoxdursa, şifrə məcburidir
                return !this.googleId;
            },
            select: false // Təhlükəsizlik üçün şifrəni sorğularda gizlədir
        },
        avatar: {
            type: String,
            required: false, // Məcburi deyil
            default: '',     // Standart dəyər boş string
        },
        googleId: {
            type: String
        },
        role: {
            type: String,
            required: true,
            enum: ['user', 'admin'],
            default: 'user'
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date,
    },
    {
        timestamps: true // `createdAt` və `updatedAt` sahələrini avtomatik əlavə edir
    }
);

userSchema.pre('save', async function (next) {
    // YALNIZ şifrə sahəsi mövcuddursa və ya dəyişdirilibsə, hash etmə işini gör.
    if (!this.isModified('password')) {
        return next();
    }

    // Əgər sosial şəbəkə ilə girirsə və şifrə yoxdursa, yuxarıdakı sətir
    // prosesi dayandırıb birbaşa next()-ə göndərəcək.
    // Əgər normal qeydiyyatdırsa və ya şifrə yenilənirsə, bu kod işə düşəcək.
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.passwordControl = async function (password) {
    return await bcrypt.compare(password ,this.password)  
}

const UserModel = mongoose.model('user', userSchema)

export default UserModel