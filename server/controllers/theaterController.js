import Theater from "../models/Theater.js";

export const  getAllTheaters= async (req,res)=>{
    try{
        const theaters=await Theater.find({isActive:true});

        res.json({
            success:true,
            count:Theater.length,
            data:theaters
        });
    }catch(error){
        res.json(500).json({
            success:false,
            message:'Error fetching theaters',
            error:error.message
        });
    }
};

export const createTheater= async(req,res)=>{
    try{
        const theater =await Theater.create(req.body);

        res.status(201).json({
            success:true,
            data:theater
        });
    }catch(error){
        res.status(400).json({
            success:false,
            message:'error creating theater',
            error:error.message
        });
    }
};

export const getTheaterById =async (req,res)=>{
    try{
        const theater=await Theater.findById(req.params.id);

        if(!theater){
            return res.status(404).json({
                success:false,
                message:'Theater not found'
            });
        }

        res.json({
            success:true,
            data:theater
        });
    }catch(error){
        res.status(500).json({
            success:false,
            message:'Errror fetching theater',
            error:error.message
        });
    }
};