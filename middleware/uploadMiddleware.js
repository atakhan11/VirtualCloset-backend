import multer from 'multer';
import path from 'path';

// Faylın yadda saxlanacağı yeri və adını təyin edən konfiqurasiya
const storage = multer.diskStorage({
    // Faylın hansı qovluğa yüklənəcəyini təyin edir
    destination(req, file, cb) {
        // Faylları 'public/uploads' qovluğuna yükləyəcək
        // 'public' qovluğu serverinizin ana qovluğunda olmalıdır.
        cb(null, 'public/uploads/');
    },
    // Yüklənən faylın adını necə formalaşdıracağını təyin edir
    filename(req, file, cb) {
        // Faylın adını unikal etmək üçün:
        // orijinal_ad-unikal_tarix.genişlənmə
        // Məsələn: koynek-1624812345678.jpg
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

// Yalnız şəkil fayllarının yüklənməsinə icazə verən filtr
function checkFileType(file, cb) {
    // İcazə verilən fayl tipləri
    const filetypes = /jpg|jpeg|png|gif/;
    // Faylın genişlənməsini yoxlayır (məs, .png)
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Faylın MIME tipini yoxlayır (məs, image/jpeg)
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        // Əgər hər ikisi də uyğundursa, yükləməyə icazə ver
        return cb(null, true);
    } else {
        // Əks halda, xəta mesajı qaytar
        cb('Yalnız şəkil faylları yüklənə bilər! (jpg, jpeg, png, gif)');
    }
}

// Multer konfiqurasiyasını yaradırıq
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // Fayl ölçüsü üçün limit (məs, 5MB)
    },
});

export default upload;
