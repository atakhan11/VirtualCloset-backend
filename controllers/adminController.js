// controllers/adminController.js
import UserModel from '../models/userModel.js';
import ClothesModel from '../models/clothesModel.js';
// Gələcəkdə ClothesModel və s. də import edəcəksiniz

// Bütün istifadəçilərin siyahısını gətirən funksiya
const getAllUsers = async (req, res) => {
    try {
        const users = await UserModel.find({}).select('-password'); // Şifrə xaric, bütün istifadəçilər
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server xətası' });
    }
};

// Bir istifadəçini silən funksiya
const deleteUser = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id);
        if (user) {
            await user.remove();
            res.json({ message: 'İstifadəçi silindi' });
        } else {
            res.status(404).json({ message: 'İstifadəçi tapılmadı' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server xətası' });
    }
};


const getDashboardStats = async (req, res) => {
    try {
        const userCount = await UserModel.countDocuments();
        const clothesCount = await ClothesModel.countDocuments(); // Bu işləmək üçün ClothesModel olmalıdır

        // Son 7 gündəki qeydiyyatları hesablamaq üçün (bu bir az mürəkkəbdir)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const signupsLast7Days = await UserModel.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            { $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } },
            { $project: { _id: 0, date: "$_id", count: "$count" } }
        ]);

        res.json({
            userCount,
            clothesCount,
            signupsLast7Days
        });

    } catch (error) {
        res.status(500).json({ message: 'Statistika yüklənərkən xəta baş verdi' });
        console.error(error);
    }
};

export { getAllUsers, deleteUser, getDashboardStats };