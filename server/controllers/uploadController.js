import cloudinary from '../config/cloudinary.js';

//@desc upload single image
//@route POST/api/upload/image
//@access Admin
export const uploadImage =async (req,res) =>{
    try{
        if(!req.file){
            return res.status(400).json({
                success:false,
                message:'No file uploaded'
            });
        }

        res.json({
            success:true,
            message:'Image uploaded successfully',
            data:{
                url:req.file.path,
                publicId:req.file.filename
            }
        });
    }catch(error){
        res.status(500).json({
            success:false,
            message:'Error uploading image',
            error:error.message
        });
    }
};

//@desc delete image from cloudinary 
//@route DELETE/api/upload/image/:publicId
//access Admin
export const deleteImage = async (req,res) =>{
    try{
        const {publicId}= req.params;

         await cloudinary.uploader.destroy(publicId);

         res.json({
            success:true,
            message:'Image deleted successfully'
         });
    }catch(error){
        res.status(500).json({
            success:false,
            message:'Error deleting image',
            error:error.message
        });
    }
};