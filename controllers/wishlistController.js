import WishlistItem from '../models/wishlistItemModel.js';
import ClothesModel from '../models/clothesModel.js';

// @desc    Yeni bir arzu məhsulu əlavə et
// @route   POST /api/wishlist
// @access  Private
const addWishlistItem = async (req, res) => {
    try {
        const { name, category, price, storeUrl, notes, image } = req.body;

        if (!name || !image) {
            return res.status(400).json({ message: 'Ad və Şəkil sahələri məcburidir' });
        }

        const wishlistItem = new WishlistItem({
            name,
            category,
            price,
            storeUrl,
            notes,
            image: image,
            user: req.user._id,
        });

        const createdItem = await wishlistItem.save();
        res.status(201).json(createdItem);
    } catch (error) {
        console.error('ADD WISHLIST ITEM ERROR:', error);
        res.status(500).json({ message: 'Server xətası' });
    }
};

// @desc    Arzu siyahısındakı bir məhsulu yenilə
// @route   PUT /api/wishlist/:id
// @access  Private
const updateWishlistItem = async (req, res) => {
    try {
        const item = await WishlistItem.findById(req.params.id);

        if (item) {
            if (item.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Bu əməliyyatı etməyə icazəniz yoxdur' });
            }

            const { name, category, price, storeUrl, notes, image } = req.body;

            item.name = name || item.name;
            item.category = category || item.category;
            item.price = price || item.price;
            item.storeUrl = storeUrl || item.storeUrl;
            item.notes = notes || item.notes;
            item.image = image || item.image;

            const updatedItem = await item.save();
            res.json(updatedItem);

        } else {
            res.status(404).json({ message: 'Məhsul tapılmadı' });
        }
    } catch (error) {
        console.error('UPDATE WISHLIST ITEM ERROR:', error);
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

            // DƏYİŞİKLİK: Yeni qarderob məhsulu yaradarkən əskik ola biləcək
            // sahələr üçün standart dəyərlər təyin edirik.
            const newCloth = new ClothesModel({
                name: item.name,
                category: item.category,
                image: item.image,
                brand: item.brand || '', // Wishlist-də brand yoxdursa, boş string olsun
                season: item.season || 'Mövsümsüz', // Wishlist-də mövsüm yoxdursa, standart dəyər olsun
                colors: item.colors || [], // Wishlist-də rəng yoxdursa, boş massiv olsun
                notes: `Arzu siyahısından əlavə edilib. Mağaza: ${item.storeUrl || 'Qeyd edilməyib'}`,
                user: req.user._id,
            });

            await newCloth.save();
            await WishlistItem.deleteOne({ _id: req.params.id });

            res.status(201).json({ message: 'Məhsul uğurla qarderoba əlavə edildi!' });

        } else {
            res.status(404).json({ message: 'Arzu siyahısında belə məhsul tapılmadı' });
        }
    } catch (error) {
        // DƏYİŞİKLİK: Daha detallı xəta mesajı göndəririk
        console.error('MOVE TO WARDROBE ERROR:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: `Məlumat yoxlama xətası: ${messages.join(', ')}` });
        }
        res.status(500).json({ message: 'Server xətası: Məhsulu qarderoba köçürmək mümkün olmadı.' });
    }
};


// --- DİGƏR FUNKSİYALAR OLDUĞU KİMİ QALIR ---
const getMyWishlist = async (req, res) => {
    try {
        const wishlist = await WishlistItem.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(wishlist);
    } catch (error) {
        console.error('GET MY WISHLIST ERROR:', error);
        res.status(500).json({ message: 'Server xətası' });
    }
};

const deleteWishlistItem = async (req, res) => {
    try {
        const item = await WishlistItem.findById(req.params.id);
        if (item) {
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

export { 
    addWishlistItem, 
    getMyWishlist, 
    deleteWishlistItem, 
    moveItemToWardrobe, 
    updateWishlistItem 
};
