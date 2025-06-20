// controllers/clothesController.js

import ClothesModel from '../models/clothesModel.js';
import fs from 'fs'; // Fayl sistemində işləmək üçün Node.js modulu
import path from 'path'; // Fayl yollarını idarə etmək üçün

// @desc    Yeni bir geyim əlavə et
// @route   POST /api/clothes
// @access  Private
const addCloth = async (req, res) => {
     console.log('addCloth funksiyasına gələn req.user:', req.user);

    if (!req.user) {
        return res.status(500).json({ 
            message: 'Server xətası: `req.user` obyekti tapılmadı! `protect` middleware-i istifadəçini təyin etmədi.' 
        });
    }
    const { name, category, colors, season, brand, notes } = req.body;

    if (!req.file) {
        return res.status(400).json({ message: 'Zəhmət olmasa, bir şəkil yükləyin' });
    }
    if (!name || !category) {
        return res.status(400).json({ message: 'Ad və Kateqoriya sahələri məcburidir' });
    }

    try {
        const newCloth = new ClothesModel({
            user: req.user.id, // "protect" middleware-indən gəlir
            name,
            category,
            colors: colors ? colors.split(',') : [], // "qırmızı,sarı" string-ini array-ə çevirir
            season,
            brand,
            notes,
            image: `/uploads/${req.file.filename}` // Yüklənmiş faylın serverdəki yolu
        });

        const createdCloth = await newCloth.save();
        res.status(201).json(createdCloth);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server xətası' });
    }
};

// @desc    Daxil olmuş istifadəçinin bütün geyimlərini gətir
// @route   GET /api/clothes
// @access  Private
const getMyClothes = async (req, res) => {
    try {
        // Yalnız həmin istifadəçiyə aid olan geyimləri tapırıq
        const clothes = await ClothesModel.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(clothes);
    } catch (error) {
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
            // Təhlükəsizlik yoxlaması
            if (cloth.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(401).json({ message: 'Bu əməliyyatı etməyə icazəniz yoxdur' });
            }

            // DÜZƏLİŞ 1: Şəklin yolunu əvvəlcədən bir dəyişənə götürürük
            const imagePathToDelete = cloth.image; 

            // Geyimi bazadan silirik
            // .remove() köhnəlib, deleteOne daha müasir və təhlükəsizdir
            await ClothesModel.deleteOne({ _id: req.params.id });

            // DÜZƏLİŞ 2: YALNIZ şəklin yolu mövcuddursa, onu silməyə cəhd edirik
            if (imagePathToDelete) {
                // Fayl yolunu qururuq (əvvəlki məsləhətimizə əsasən,
                // addCloth-da yolu "public/uploads/fayl.png" kimi saxladığınızı fərz edirik)
                const fullPath = path.join(path.resolve(), imagePathToDelete); 
                
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            }
            
            res.json({ message: 'Geyim uğurla silindi' });
        } else {
            res.status(404).json({ message: 'Geyim tapılmadı' });
        }
    } catch (error) {
        // HƏMİŞƏ xətanı terminalda loglayın ki, səbəbi biləsiniz!
        console.error("DELETE CLOTH ERROR:", error); 
        res.status(500).json({ message: 'Server xətası' });
    }
};

const updateCloth = async (req, res) => {
    try {
        const cloth = await ClothesModel.findById(req.params.id);

        if (cloth) {
            // İCAZƏ YOXLAMASI: Yalnız sahibi və ya admin redaktə edə bilər
            if (cloth.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(401).json({ message: 'Bu əməliyyatı etməyə icazəniz yoxdur' });
            }

            // Məlumatları yeniləyirik
            cloth.name = req.body.name || cloth.name;
            cloth.category = req.body.category || cloth.category;
            cloth.season = req.body.season || cloth.season;
            // ... digər sahələri də bu şəkildə əlavə edə bilərsiniz ...

            const updatedCloth = await cloth.save();
            res.json(updatedCloth);

        } else {
            res.status(404).json({ message: 'Geyim tapılmadı' });
        }
    } catch (error) {
        console.error("UPDATE CLOTH ERROR:", error);
        res.status(500).json({ message: 'Server xətası' });
    }
};

// Funksiyanı export etməyi unutmayın
// export { ..., updateCloth };

// controllers/clothesController.js

const getAllClothes_Admin = async (req, res) => {
    try {
        console.log('Admin bütün geyimləri çəkir...');
        
        // MÜVƏQQƏTİ DƏYİŞİKLİK: .populate() hissəsini kommentə alırıq (və ya silirik)
        const clothes = await ClothesModel.find({}).sort({ createdAt: -1 });
        
        if (!clothes) {
            return res.status(404).json({ message: 'Heç bir geyim tapılmadı' });
        }
        
        console.log(`${clothes.length} ədəd geyim tapıldı.`);
        res.json(clothes);

    } catch (error) {
        console.error("GET ALL CLOTHES (ADMIN) ERROR:", error);
        res.status(500).json({ message: 'Server xətası' });
    }
};

export { addCloth, getMyClothes, deleteCloth, getAllClothes_Admin, updateCloth };