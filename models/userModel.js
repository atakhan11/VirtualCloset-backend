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
            unique: true
        },
        password: {
            type: String,
            required: function() {
                return !this.googleId;
            },
            select: false
        },
        avatar: {
            type: String,
            required: false,
            default: '',
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
        resetPasswordExpires: Date,
    },
    {
        timestamps: true
    }
);


userSchema.methods.passwordControl = async function (password) {
    return await bcrypt.compare(password, this.password);
}



const UserModel = mongoose.model('user', userSchema);

export default UserModel;