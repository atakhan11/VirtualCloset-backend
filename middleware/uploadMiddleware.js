import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Yalnız şəkil faylları yüklənə bilər! (jpg, jpeg, png, gif)');
    }
}


const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
    limits: {
        fileSize: 5 * 1024 * 1024, 
    },
});

export default upload;
