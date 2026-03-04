import Movie from '../models/Movie.js';
//import cloudinary from '../config/cloudinary.js';


// export const createMovie = async (req, res) => {
//     const result = await cloudinary.uploader.upload(req.file.path);

//     const movie = await Movie.create({
//         ...req.body,
//         poster: result.secure_url
//     });
// };


//@desc   Get all movies
//@route  GET/api/movies
//@access Public
export const getAllMovies=async(req,res)=>{
    try{
        const {search,genre,language,isActive}=req.query;

        const filter={};
        if(search){
            filter.title={$regex:search,$options:'i'};  //i=>case-insensitive
        }
        if(genre){
            filter.genre=genre;
        }
        if(language){
            filter.language=language;
        }
        if(isActive!==undefined){
            filter.isActive=isActive=='true';
        }

        const movies=await Movie.find(filter).sort({createdAt:-1});  // fetches from db and sorts createdAt :-1 -> newest first or newest to oldest

        res.json({
            
            success:true,
            count:movies.length,
            data:movies
        });
    }catch(error){
        res.status(500).json({
            success:false,
            messsage:'Error fetching movies',
            error:error.messsage
        });
    }
};

//@desc  Get single movie
//@route GET/api/movie/:id
//@access Public
export const getMovieById=async(req,res)=>{
    try{
        const movie=await Movie.findById(req.params.id);

        if(!movie){
            return res.status(404).json({  //404=>id dont exist
                success:false,
                message:'Movie not found'
            });
        }

        res.json({
            success:true,
            data:movie
        });
    }catch(error){
        res.status(500).json({
            success:false,
            message:'Error fetchig movie',
            error:error.message
        });
    }
};

//@desc Create new movie
//@route POST/api/movies
//@access Admin
export const createMovie= async(req,res)=>{
    try{
        const movie=await Movie.create(req.body);

        res.status(201).json({  //201=>resource created successfully
            success:true,
            data:movie
        });
    }catch(error){
        res.status(400).json({
            success:false,
            message:'Error creating movie',
            error:error.message
        });
    }
;}

//@desc Update movie
//@route PUT/api/movies/:id
//@access Admin

export const updateMovie=async (req,res)=>{
    try{
        const movie=await Movie.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new:true,runValidators:true}
        );

        if(!movie){
            return res.status(404).json({
                success:false,
                message:'Movie not found'
            });
        }

        res.json({
            success:true,
            data:movie
        });
    }catch(error){
        res.status(400).json({
            success:false,
            message:'Error updating movie',
            error:error.message
        });
    }
};

//@desc  Delete movie
//@route DELETE/api/movies/:id
//@access Admin
export const deleteMovie =async (req,res)=>{
    try{
        const movie=await Movie.findByIdAndDelete(req.params.id);

        if(!movie){
            return res.status(404).json({
                success:false,
                message:'Movie not found'
            });
        }

        res.json({
            success:true,
            message:'Movie deleted successfully'
        });
    }catch(error){
        res.status(500).json({
            success:false,
            message:'Error deleting movie',
            error:error.message
        });
    }
};