import jwt from 'jsonwebtoken';
import User from '../models/User.js';

//protect routes - verify JWT
export const protect=async (req,res,next)=>{
    try{
        let token;

        //check for token in cookies or Authorization header
        if(req.cookies.token){
            token=req.cookies.token;
        }else if(req.headers.authorization?.startsWith('Bearer')){
            token=req.headers.authorization.split(' ')[1];
        }

        if(!token){
            return res.status(401).json({
                success:false,
                message:'Not authorized, no token'
            });
        }  

        //verify token 
        const decoded=jwt.verify(token,process.env.JWT_SECRET);

        //get user from token
        req.user=await User.findById(decoded.id).select('-password');

        if(!req.user){
            return res.status(401).json({
                success:false,
                message:'User not found'
            });
        }

        next();
    }catch(error){
        res.status(401).json({
            success:false,
            message:'Not authorized , token failed',
            error:error.message
        });
    }
};

//Admin only access
export const adminOnly=(req,res,next)=>{
    if(req.user && req.user.role =='admin'){
        next();
    }else{
        res.status(403).json({
            success:false,
            message:'Access denied. Admin only'
        });
    }
};