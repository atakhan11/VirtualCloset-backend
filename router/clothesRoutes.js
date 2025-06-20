// routes/clothesRoutes.js

import express from 'express';
import path from 'path';
import multer from 'multer';
import { addCloth, getMyClothes, deleteCloth, getAllClothes_Admin, updateCloth } from '../controllers/clothesController.js';
import { protect } from '../middleware/authMiddleware.js';
import admin from '../middleware/adminMiddleware.js';
const router = express.Router();

// --- Multer ilə Fayl Yükləmə Konfiqurasiyası ---
const storage = multer.diskStorage({
    // Faylların hara yüklənəcəyini təyin edir
    destination(req, file, cb) {
        cb(null, 'public/uploads/');
    },
    // Yüklənən faylın adını təyin edir
    filename(req, file, cb) {
        // Fayl adının unikal olması üçün tarix və orijinal ad birləşdirilir
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Fayl tipini yoxlayan funksiya
function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Yalnız şəkil yükləyə bilərsiniz (jpg, jpeg, png)!');
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

// --- Route Təyinləri ---

router.route('/all').get(protect, admin, getAllClothes_Admin);


// /api/clothes/
router.route('/')
    .get(protect, getMyClothes) // Bütün geyimləri gətirir
    .post(protect, upload.single('image'), addCloth); // Yeni geyim əlavə edir ('image' - frontend-dəki inputun adı)

// /api/clothes/:id
router.route('/:id')
    .put(protect, updateCloth)
    .delete(protect, deleteCloth); // Bir geyimi silir
    

export default router;