import express from 'express';
import {upload} from '../config/cloudinary.js';
import {uploadImage, deleteImage} from '../controllers/uploadController.js';

const router=express.Router();

router.post('/image', upload.single('image'),uploadImage);
router.delete('/image/:publicId',deleteImage);

export default router;
