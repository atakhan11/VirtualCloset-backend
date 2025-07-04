import Activity from '../models/activityModel.js';
import ClothesModel from '../models/clothesModel.js';
import users from '../models/userModel.js'; 
import fs from 'fs';
import path from 'path';

const addCloth = async (req, res) => {

    const { name, category, colors, season, brand, notes, image } = req.body;

    if (!image) {
        return res.status(400).json({ message: 'Şəkil URL-i tapılmadı. Zəhmət olmasa, şəkil yükləyin.' });
    }
    if (!name || !category) {
        return res.status(400).json({ message: 'Ad və Kateqoriya sahələri məcburidir' });
    }

    try {
        const newCloth = new ClothesModel({
            user: req.user._id,
            name,
            category,
            colors: colors ? colors.split(',') : [], 
            season,
            brand,
            notes,
            image: image 
        });

        const createdCloth = await newCloth.save();
        await Activity.create({
    user: req.user._id,
    actionType: 'CLOTH_ADDED',
    message: ` adlı istifadəçi yeni bir geyim əlavə etdi: "${createdCloth.name}"`,
  });
        res.status(201).json(createdCloth);
    } catch (error) {
        console.error("ADD CLOTH ERROR:", error);
        res.status(500).json({ message: 'Server xətası' });
    }
};

const getMyClothes = async (req, res) => {
    try {
        const clothes = await ClothesModel.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(clothes);
    } catch (error) {
        console.error("GET MY CLOTHES ERROR:", error);
        res.status(500).json({ message: 'Server xətası' });
    }
};


const deleteCloth = async (req, res) => {
    try {
        const cloth = await ClothesModel.findById(req.params.id);
        if (cloth) {
            if (cloth.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(401).json({ message: 'Bu əməliyyatı etməyə icazəniz yoxdur' });
            }
            const imagePathToDelete = cloth.image;
            await ClothesModel.deleteOne({ _id: req.params.id });
            if (imagePathToDelete) {
                const fullPath = path.join(path.resolve(), 'public', imagePathToDelete);
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            }
            res.json({ message: 'Geyim uğurla silindi' });
        } else {
            res.status(404).json({ message: 'Geyim tapılmadı' });
        }
    } catch (error) {
        console.error("DELETE CLOTH ERROR:", error);
        res.status(500).json({ message: 'Server xətası' });
    }
};


const updateCloth = async (req, res) => {
    try {
        const { name, category, colors, season, brand, notes, image } = req.body;
        
        const cloth = await ClothesModel.findById(req.params.id);

        if (cloth) {
            if (cloth.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                res.status(401);
                throw new Error('Bu əməliyyatı etməyə səlahiyyətiniz yoxdur');
            }

            cloth.name = name || cloth.name;
            cloth.category = category || cloth.category;
            cloth.season = season || cloth.season;
            cloth.brand = brand || cloth.brand;
            cloth.notes = notes || cloth.notes;
            cloth.colors = colors ? colors.split(',') : cloth.colors;
            
            cloth.image = image || cloth.image;

            const updatedCloth = await cloth.save();
            res.json(updatedCloth);
        } else {
            res.status(404);
            throw new Error('Geyim tapılmadı');
        }
    } catch (error) {
        console.error("UPDATE CLOTH ERROR:", error);
        res.status(500).json({ message: error.message || 'Server xətası baş verdi' });
    }
};


const getAllClothes_Admin = async (req, res) => {
    try {
         const { search } = req.query;

        const filter = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } }, 
                    { category: { $regex: search, $options: 'i' } }
                ]
            }
            : {};
        const clothes = await ClothesModel.find(filter)
            .populate('user', 'id name email')
            .sort({ createdAt: -1 });
        res.json(clothes);
    } catch (error) {
        console.error("GET ALL CLOTHES (ADMIN) ERROR:", error);
        res.status(500).json({ message: 'Server xətası' });
    }
};

export { 
    addCloth, 
    getMyClothes, 
    deleteCloth, 
    updateCloth,
    getAllClothes_Admin 
};