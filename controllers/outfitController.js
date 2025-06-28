import Outfit from '../models/outfitModel.js';

// @desc    Yeni bir kombin yarat
// @route   POST /api/outfits
// @access  Private
const createOutfit = async (req, res) => {
    const { name, items } = req.body;

    if (!name || !items || items.length === 0) {
        return res.status(400).json({ message: 'Zəhmət olmasa, kombinə ad verin və geyim seçin' });
    }

    try {
        const outfit = new Outfit({
            name,
            items,
            user: req.user._id, // Bu məlumat "protect" middleware-dən gəlir
        });

        const createdOutfit = await outfit.save();
        res.status(201).json(createdOutfit);
    } catch (error) {
        console.error('CREATE OUTFIT ERROR:', error);
        res.status(500).json({ message: 'Server xətası' });
    }
};

// @desc    Daxil olmuş istifadəçinin bütün kombinlərini gətir
// @route   GET /api/outfits
// @access  Private
const getMyOutfits = async (req, res) => {
    try {
        const outfits = await Outfit.find({ user: req.user._id })
            .populate('items') // Bu, geyim ID-ləri yerinə, geyimlərin öz məlumatlarını gətirəcək
            .sort({ createdAt: -1 });
        res.json(outfits);
    } catch (error) {
        console.error('GET MY OUTFITS ERROR:', error);
        res.status(500).json({ message: 'Server xətası' });
    }
};

// @desc    Bir kombini ID-yə görə sil
// @route   DELETE /api/outfits/:id
// @access  Private
const deleteOutfit = async (req, res) => {
    try {
        const outfit = await Outfit.findById(req.params.id);

        if (outfit) {
            // Təhlükəsizlik: Yalnız kombinin sahibi onu silə bilər
            if (outfit.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Bu əməliyyatı etməyə icazəniz yoxdur' });
            }

            await Outfit.deleteOne({ _id: req.params.id });
            res.json({ message: 'Kombin uğurla silindi' });
        } else {
            res.status(404).json({ message: 'Kombin tapılmadı' });
        }
    } catch (error) {
        console.error('DELETE OUTFIT ERROR:', error);
        res.status(500).json({ message: 'Server xətası' });
    }
};

const getOutfitById = async (req, res) => {
    try {
        const outfit = await Outfit.findById(req.params.id)
            .populate('user', 'name email') // Sahibinin adını və emailini gətirir
            .populate('items');             // Kombindəki geyimlərin tam məlumatını gətirir

        if (outfit) {
            // Təhlükəsizlik Yoxlaması: Yalnız kombinin sahibi ona baxa bilər
            if (outfit.user._id.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Bu kombini görməyə icazəniz yoxdur' });
            }
            res.json(outfit);
        } else {
            res.status(404).json({ message: 'Kombin tapılmadı' });
        }
    } catch (error) {
        console.error('GET OUTFIT BY ID ERROR:', error);
        res.status(500).json({ message: 'Server xətası' });
    }
};

const updateOutfitPlan = async (req, res) => {
    try {
        const { date } = req.body; // Frontend-dən gələcək tarix məlumatı
        const outfit = await Outfit.findById(req.params.id);

        if (outfit) {
            // İcazə yoxlaması
            if (outfit.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Bu əməliyyatı etməyə icazəniz yoxdur' });
            }

            // Məlumatları yeniləyirik
            outfit.isPlanned = true;
            outfit.plannedDate = date;

            const updatedOutfit = await outfit.save();
            res.json(updatedOutfit);
        } else {
            res.status(404).json({ message: 'Kombin tapılmadı' });
        }
    } catch (error) {
        console.error('UPDATE OUTFIT PLAN ERROR:', error);
        res.status(500).json({ message: 'Server xətası' });
    }
};

  const unplanOutfit = async (req, res) => {
        try {
            const outfit = await Outfit.findById(req.params.id);
    
            if (outfit) {
                // İcazə yoxlaması
                if (outfit.user.toString() !== req.user._id.toString()) {
                    return res.status(401).json({ message: 'Bu əməliyyatı etməyə icazəniz yoxdur' });
                }
    
                // Planı ləğv edirik
                outfit.isPlanned = false;
                outfit.plannedDate = undefined; // Tarixi təmizləyirik
    
                const updatedOutfit = await outfit.save();
                res.json(updatedOutfit);
            } else {
                res.status(404).json({ message: 'Kombin tapılmadı' });
            }
        } catch (error) {
            console.error('UNPLAN OUTFIT ERROR:', error);
            res.status(500).json({ message: 'Server xətası' });
        }
    };

export { createOutfit, getMyOutfits, deleteOutfit, getOutfitById, updateOutfitPlan, unplanOutfit };
