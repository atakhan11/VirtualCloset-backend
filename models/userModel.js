import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const userSchema = mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true},
    password: {
    type: String,
    // "required" bir funksiya olaraq yazılır
    required: function() {
        // Bu funksiya deyir: Əgər bu istifadəçinin "googleId"-si YOXDURSA,
        // deməli, bu normal qeydiyyatdır və şifrə MƏCBURİDİR.
        // Əks halda (googleId varsa), şifrə məcburi deyil.
        return !this.googleId;
    }
},
    googleId: { type: String },
    role: {
        type: String,
        required: true,
        enum: ['user', 'admin'],
        default: 'user' // Bütün yeni istifadəçilər avtomatik "user" olacaq
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, {timestamps:true})

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