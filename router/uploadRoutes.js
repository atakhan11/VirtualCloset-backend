import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

const router = express.Router();

// Cloudinary konfiqurasiyası
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Bu funksiya dəyişmir
const streamUpload = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                // Bu parametr vacibdir, Cloudinary-ə fonu təmizləməyi tapşırır
                background_removal: "cloudinary_ai", 
            },
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

router.post('/remove-bg', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Şəkil faylı tapılmadı.' });
    }

    try {
        const result = await streamUpload(req.file.buffer);
        
        // === ƏSAS DƏYİŞİKLİK BURADADIR ===
        // Cloudinary-dən gələn standart URL-i alırıq
        const originalUrl = result.secure_url;

        // URL-i "upload/" hissəsindən iki yerə bölürük
        const urlParts = originalUrl.split('/upload/');

        // Arasına fon təmizləmə parametrini (`e_background_removal`) əlavə edirik
        const transformedUrl = `${urlParts[0]}/upload/e_background_removal/${urlParts[1]}`;
        
        // Diaqnostika üçün konsola çıxaraq
      

        // Frontend-ə fonu təmizlənmiş şəklin URL-ni göndəririk
        res.status(200).json({ imageUrl: transformedUrl });

    } catch (error) {
        console.error('Cloudinary upload error:', error);
        res.status(500).json({ message: 'Şəkil yüklənərkən xəta baş verdi.', error });
    }
});

export default router;
