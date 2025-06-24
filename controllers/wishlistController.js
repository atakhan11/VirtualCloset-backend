import WishlistItem from '../models/wishlistItemModel.js';
import ClothesModel from '../models/clothesModel.js';
import fs from 'fs'; // <-- YENİ: Fayl Sistemi modulu
import path from 'path';

// @desc    Yeni bir arzu məhsulu əlavə et
// @route   POST /api/wishlist
// @access  Private
const addWishlistItem = async (req, res) => {
    try {
        const { name, category, price, storeUrl, notes } = req.body;

        const wishlistItem = new WishlistItem({
            name,
            category,
            price,
            storeUrl,
            notes,
            image: req.file ? `/uploads/${req.file.filename}` : null, // Şəkil varsa, yolunu saxlayırıq
            user: req.user._id,
        });

        const createdItem = await wishlistItem.save();
        res.status(201).json(createdItem);
    } catch (error) {
        console.error('ADD WISHLIST ITEM ERROR:', error);
        res.status(500).json({ message: 'Server xətası' });
    }
};

// @desc    Daxil olmuş istifadəçinin arzu siyahısını gətir
// @route   GET /api/wishlist
// @access  Private
const getMyWishlist = async (req, res) => {
    try {
        const wishlist = await WishlistItem.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(wishlist);
    } catch (error) {
        console.error('GET MY WISHLIST ERROR:', error);
        res.status(500).json({ message: 'Server xətası' });
    }
};

// @desc    Arzu siyahısından bir məhsulu sil
// @route   DELETE /api/wishlist/:id
// @access  Private
const deleteWishlistItem = async (req, res) => {
    try {
        const item = await WishlistItem.findById(req.params.id);

        if (item) {
            // Yalnız məhsulun sahibi onu silə bilər
            if (item.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Bu əməliyyatı etməyə icazəniz yoxdur' });
            }
            await WishlistItem.deleteOne({ _id: req.params.id });
            res.json({ message: 'Məhsul arzu siyahısından silindi' });
        } else {
            res.status(404).json({ message: 'Məhsul tapılmadı' });
        }
    } catch (error) {
        console.error('DELETE WISHLIST ITEM ERROR:', error);
        res.status(500).json({ message: 'Server xətası' });
    }
};

// @desc    Arzu siyahısındakı bir məhsulu qarderoba köçür
// @route   POST /api/wishlist/:id/move
// @access  Private
const moveItemToWardrobe = async (req, res) => {
    try {
        const item = await WishlistItem.findById(req.params.id);

        if (item) {
             if (item.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Bu əməliyyatı etməyə icazəniz yoxdur' });
            }

            // Wishlist-dəki məlumatlardan yeni bir geyim obyekti yaradırıq
            const newCloth = new ClothesModel({
                name: item.name,
                category: item.category,
                image: item.image,
                brand: req.body.brand || '', // İstifadəçi bu məlumatları frontend-dən göndərə bilər
                season: req.body.season || 'Mövsümsüz',
                notes: `Arzu siyahısından əlavə edilib. Mağaza: ${item.storeUrl || 'Qeyd edilməyib'}`,
                user: req.user._id,
            });

            await newCloth.save();
            await WishlistItem.deleteOne({ _id: req.params.id }); // Məhsulu wishlist-dən silirik

            res.status(201).json({ message: 'Məhsul uğurla qarderoba əlavə edildi!' });

        } else {
            res.status(404).json({ message: 'Arzu siyahısında belə məhsul tapılmadı' });
        }
    } catch (error) {
        console.error('MOVE TO WARDROBE ERROR:', error);
        res.status(500).json({ message: 'Server xətası' });
    }
};


const updateWishlistItem = async (req, res) => {
    try {
        const item = await WishlistItem.findById(req.params.id);

        if (item) {
            // İcazə yoxlaması
            if (item.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Bu əməliyyatı etməyə icazəniz yoxdur' });
            }

            // === DƏYİŞİKLİK: Köhnə şəklin yolunu yadda saxlayırıq ===
            const oldImagePath = item.image;

            // Məlumatları yeniləyirik
            item.name = req.body.name || item.name;
            item.category = req.body.category || item.category;
            item.price = req.body.price || item.price;
            item.storeUrl = req.body.storeUrl || item.storeUrl;
            item.notes = req.body.notes || item.notes;

            // Əgər sorğu ilə yeni bir şəkil faylı gəlibsə, onu da yeniləyirik
            if (req.file) {
                item.image = `/uploads/${req.file.filename}`;
            }

            const updatedItem = await item.save();

            // === DƏYİŞİKLİK: Yeni şəkil yüklənibsə, köhnəsini serverdən silirik ===
            if (req.file && oldImagePath) {
                // `public` qovluğunu da nəzərə alaraq tam yolu yaradırıq
                const fullOldPath = path.join(path.resolve(), 'public', oldImagePath);
                 if (fs.existsSync(fullOldPath)) {
                    fs.unlinkSync(fullOldPath);
                }
            }

            res.json(updatedItem);

        } else {
            res.status(404).json({ message: 'Məhsul tapılmadı' });
        }
    } catch (error) {
        console.error('UPDATE WISHLIST ITEM ERROR:', error);
        res.status(500).json({ message: 'Server xətası' });
    }
};
export { addWishlistItem, getMyWishlist, deleteWishlistItem, moveItemToWardrobe, updateWishlistItem };
