import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

//configure multer storage with cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: { // how img will be stored in cloudinary
        folder: 'cinereserve-pro/movies',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 500, height: 750, crop: 'fill' }]
    }
});

export const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }  //5 mb
});

export default cloudinary;
