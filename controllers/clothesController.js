// controllers/clothesController.js

import Activity from '../models/activityModel.js';
import ClothesModel from '../models/clothesModel.js';
import users from '../models/userModel.js'; // <-- ƏSAS PROBLEM BU SƏTRİN OLMAMASIDIR
import fs from 'fs';
import path from 'path';

// @desc    Yeni bir geyim əlavə et
// @route   POST /api/clothes
// @access  Private
const addCloth = async (req, res) => {
    // Dəyişiklik: 'image' sahəsini req.body-dən birbaşa URL olaraq alırıq
    const { name, category, colors, season, brand, notes, image } = req.body;

    // Dəyişiklik: Artıq req.file yox, req.body.image-in mövcudluğunu yoxlayırıq
    if (!image) {
        return res.status(400).json({ message: 'Şəkil URL-i tapılmadı. Zəhmət olmasa, şəkil yükləyin.' });
    }
    if (!name || !category) {
        return res.status(400).json({ message: 'Ad və Kateqoriya sahələri məcburidir' });
    }r

    try {
        const newCloth = new ClothesModel({
            user: req.user._id,
            name,
            category,
            colors: colors ? colors.split(',') : [], // Rəngləri string-dən array-ə çevirir
            season,
            brand,
            notes,
            // Dəyişiklik: Şəkil sahəsinə birbaşa Cloudinary-dən gələn URL yazılır
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

// @desc    Daxil olmuş istifadəçinin bütün geyimlərini gətir
// @route   GET /api/clothes
// @access  Private
const getMyClothes = async (req, res) => {
    try {
        const clothes = await ClothesModel.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(clothes);
    } catch (error) {
        console.error("GET MY CLOTHES ERROR:", error);
        res.status(500).json({ message: 'Server xətası' });
    }
};

// @desc    Bir geyimi ID-yə görə sil
// @route   DELETE /api/clothes/:id
// @access  Private
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

// @desc    Bir geyimi ID-yə görə redaktə et
// @route   PUT /api/clothes/:id
// @access  Private
const updateCloth = async (req, res) => {
    try {
        const { name, category, colors, season, brand, notes, image } = req.body;
        
        const cloth = await ClothesModel.findById(req.params.id);

        if (cloth) {
            // İcazə yoxlaması: Yalnız paltarın sahibi və ya admin redaktə edə bilər.
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
            
            // Dəyişiklik: Əgər frontend-dən yeni şəkil URL-i gəlibsə, onu yeniləyirik.
            // Əks halda köhnə URL qalır.
            cloth.image = image || cloth.image;

            const updatedCloth = await cloth.save();
            res.json(updatedCloth);
        } else {
            res.status(404);
            throw new Error('Geyim tapılmadı');
        }
    } catch (error) {
        console.error("UPDATE CLOTH ERROR:", error);
        // Xəta mesajını daha detallı göndəririk
        res.status(500).json({ message: error.message || 'Server xətası baş verdi' });
    }
};

// @desc    Bütün geyimləri gətir (Admin üçün)
// @route   GET /api/clothes/all
// @access  Private/Admin
const getAllClothes_Admin = async (req, res) => {
    try {
         const { search } = req.query;

        // YENİ: Axtarış üçün filter obyekti yaradırıq
        const filter = search
            ? {
                // $or ilə həm adda, həm də kateqoriyada axtarırıq
                $or: [
                    { name: { $regex: search, $options: 'i' } }, // 'i' - case-insensitive
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

// Bütün funksiyaları export edirik
export { 
    addCloth, 
    getMyClothes, 
    deleteCloth, 
    updateCloth,
    getAllClothes_Admin 
};