// controllers/adminController.js
import UserModel from '../models/userModel.js';
import ClothesModel from '../models/clothesModel.js';
import Activity from '../models/activityModel.js';
// Gələcəkdə ClothesModel və s. də import edəcəksiniz

// Bütün istifadəçilərin siyahısını gətirən funksiya
const getAllUsers = async (req, res) => {
    try {
        const { search } = req.query;

        // YENİ: Axtarış üçün filter obyekti yaradırıq
        const filter = search 
            ? {
                // $or ilə həm adda, həm də email-də axtarırıq
                $or: [
                    { name: { $regex: search, $options: 'i' } }, // 'i' - case-insensitive
                    { email: { $regex: search, $options: 'i' } }
                ]
            } 
            : {}; // Əgər axtarış sözü yoxdursa, filter boş olur (bütün istifadəçilər gəlir)

        const users = await UserModel.find(filter).select('-password'); // Şifrə xaric, bütün istifadəçilər
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
        
        const categoryDistribution = await ClothesModel.aggregate([
            {
                $group: {
                    _id: '$category', // Kateqoriyaya görə qruplaşdır
                    count: { $sum: 1 } // Hər qrupdakı sənəd sayını cəmlə
                }
            },
            {
                $project: {
                    _id: 0, // _id sahəsini göstərmə
                    name: '$_id', // _id-ni 'name' olaraq adlandır (recharts üçün)
                    value: '$count' // count-u 'value' olaraq adlandır (recharts üçün)
                }
            }
        ]);

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
            categoryDistribution,
            signupsLast7Days
        });

    } catch (error) {
        res.status(500).json({ message: 'Statistika yüklənərkən xəta baş verdi' });
        console.error(error);
    }
};

const getRecentActivities = async (req, res) => {
  try {
    const activities = await Activity.find()
      // YENİ ƏLAVƏ: Yalnız "user" sahəsi boş (null) olmayan sənədləri gətirir.
      .where('user').ne(null) 
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name'); 

    res.json(activities);
  } catch (error) {
    // Xətanı server terminalında daha detallı görmək üçün
    console.error("Aktivlikləri gətirərkən xəta baş verdi:", error); 
    res.status(500).json({ message: 'Server xətası' });
  }
};

export { getAllUsers, deleteUser, getDashboardStats, getRecentActivities };