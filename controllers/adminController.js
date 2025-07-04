import UserModel from '../models/userModel.js';
import ClothesModel from '../models/clothesModel.js';
import Activity from '../models/activityModel.js';
import AnnouncementModel from '../models/announcementModel.js';

const getAllUsers = async (req, res) => {
    try {
        const { search } = req.query;

        const filter = search 
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } }, 
                    { email: { $regex: search, $options: 'i' } }
                ]
            } 
            : {}; 

        const users = await UserModel.find(filter).select('-password'); 
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server xətası' });
    }
};


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
        const clothesCount = await ClothesModel.countDocuments(); 
        
        const categoryDistribution = await ClothesModel.aggregate([
            {
                $group: {
                    _id: '$category', 
                    count: { $sum: 1 } 
                }
            },
            {
                $project: {
                    _id: 0, 
                    name: '$_id', 
                    value: '$count' 
                }
            }
        ]);


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
      .where('user').ne(null) 
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name'); 

    res.json(activities);
  } catch (error) {
    console.error("Aktivlikləri gətirərkən xəta baş verdi:", error); 
    res.status(500).json({ message: 'Server xətası' });
  }
};

const createAnnouncement = async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({ message: 'Başlıq və məzmun boş ola bilməz.' });
        }

        await AnnouncementModel.updateMany({}, { isActive: false });

        const newAnnouncement = new AnnouncementModel({ title, content, isActive: true });
        await newAnnouncement.save();
        
        res.status(201).json({ message: 'Elan uğurla paylaşıldı!' });
    } catch (error) {
        res.status(500).json({ message: 'Server xətası' });
    }
};


const getAllAnnouncements = async (req, res) => {
    try {
        const announcements = await AnnouncementModel.find().sort({ createdAt: -1 });
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ message: 'Server xətası' });
    }
};


const deleteAnnouncement = async (req, res) => {
    try {
        await AnnouncementModel.findByIdAndDelete(req.params.id);
        res.json({ message: 'Elan silindi.' });
    } catch (error) {
        res.status(500).json({ message: 'Server xətası' });
    }
};

export { getAllUsers, deleteUser, getDashboardStats, getRecentActivities, createAnnouncement, getAllAnnouncements, deleteAnnouncement };