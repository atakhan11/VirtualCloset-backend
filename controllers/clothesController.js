// controllers/clothesController.js

import ClothesModel from '../models/clothesModel.js';
import users from '../models/userModel.js'; // <-- ƏSAS PROBLEM BU SƏTRİN OLMAMASIDIR
import fs from 'fs';
import path from 'path';

// @desc    Yeni bir geyim əlavə et
// @route   POST /api/clothes
// @access  Private
const addCloth = async (req, res) => {
    const { name, category, colors, season, brand, notes } = req.body;

    if (!req.file) {
        return res.status(400).json({ message: 'Zəhmət olmasa, bir şəkil yükləyin' });
    }
    if (!name || !category) {
        return res.status(400).json({ message: 'Ad və Kateqoriya sahələri məcburidir' });
    }

    try {
        const newCloth = new ClothesModel({
            user: req.user._id, // req.user.id və ya req.user._id, hər ikisi işləməlidir
            name,
            category,
            colors: colors ? colors.split(',') : [],
            season,
            brand,
            notes,
            image: `/uploads/${req.file.filename}` // public/ olmadan
        });

        const createdCloth = await newCloth.save();
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
        const cloth = await ClothesModel.findById(req.params.id);

        if (cloth) {
            // İcazə yoxlaması
            if (cloth.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(401).json({ message: 'Bu əməliyyatı etməyə icazəniz yoxdur' });
            }

            // Silinmə ehtimalı üçün köhnə şəklin yolunu yadda saxlayırıq
            const oldImagePath = cloth.image;

            // Mətn sahələrini yeniləyirik
            cloth.name = req.body.name || cloth.name;
            cloth.category = req.body.category || cloth.category;
            cloth.season = req.body.season || cloth.season;
            cloth.brand = req.body.brand || cloth.brand;
            cloth.notes = req.body.notes || cloth.notes;
            cloth.colors = req.body.colors ? req.body.colors.split(',') : cloth.colors;

            // Əgər sorğu ilə yeni bir şəkil faylı gəlibsə, onu da yeniləyirik
            if (req.file) {
                cloth.image = `/uploads/${req.file.filename}`;
            }

            const updatedCloth = await cloth.save();

            // Əgər yeni şəkil yüklənibsə və köhnə şəkil yolu mövcuddursa, köhnə faylı serverdən silirik
            if (req.file && oldImagePath) {
                // public qovluğunu da nəzərə alaraq tam yolu yaradırıq
                const fullOldPath = path.join(path.resolve(), 'public', oldImagePath);
                 if (fs.existsSync(fullOldPath)) {
                    fs.unlinkSync(fullOldPath);
                }
            }

            res.json(updatedCloth);

        } else {
            res.status(404).json({ message: 'Geyim tapılmadı' });
        }
    } catch (error) {
        console.error("UPDATE CLOTH ERROR:", error);
        if (error.name === 'ValidatorError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server xətası' });
    }
};

// @desc    Bütün geyimləri gətir (Admin üçün)
// @route   GET /api/clothes/all
// @access  Private/Admin
const getAllClothes_Admin = async (req, res) => {
    try {
        const clothes = await ClothesModel.find({})
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