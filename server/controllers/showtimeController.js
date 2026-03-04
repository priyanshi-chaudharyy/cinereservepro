import Showtime from '../models/Showtime.js';
import Theater from '../models/Theater.js';
import Movie from '../models/Movie.js';

//helper function to generate seat status array
const generateSeatStatus=(theater,screenId,pricing) =>{
    const screen=theater.screens.id(screenId);
    if(!screen) throw new Error ('Screen not found');

    const seats=[];
    const {rows,columns}= screen.seatLayout;

    for(let r=0;r<rows;r++){
        const rowLetter=String.fromCharCode(65+r); //A,B,C..

        //Determine seat type for this row
        let seatType ='Economy';
        for(const type of screen.seatTypes){
            if(type.rows.includes(rowLetter)){
                seatType = type.type;
                break;
            }
        }
        for(let c=1;c<=columns;c++){
            seats.push({
                seatNumber:`${rowLetter}${c}`,
                status:'Available',
                seatType:seatType
            });
        }
    }
    return seats;
};

//@desc Create new showtime
///@route POST/api/showtimes
//@access Admin
export const createShowtime=async (req,res)=>{
    try{
        const {movieId,theaterId, screenId,showDate,showTime,pricing}=req.body;

        //verify movie exists
        const movie = await Movie.findById(movieId);
        if(!movie){
            return res.status(404).json({
                success:false,
                message:'Movie not found'
            });
        }

        //verify theater and screen exist 
        const theater=await Theater.findById(theaterId);
        if(!theater){
            return res.status(404).json({
                success:false,
                message:'Theater not found'
            });
        }

        const screen = theater.screens.id(screenId);
        if(!screen){
            return res.status(404).json({
                success:false,
                message:'Screen not found'
            });
        }

        //check for conflicting showtimes (prevents double booking same screen )
        const conflictingShow=await Showtime.findOne({
            theaterId,
            screenId,
            showDate:new Date(showDate),
            showTime
        });

        if(conflictingShow){
            return res.status(400).json({
                success:false,
                message:'A show already exists at this time'
            });
        }

        //generate seat status
        const seatStatus=generateSeatStatus(theater,screenId,pricing);

        //create showtime
        const showtime= await Showtime.create({
            movieId,
            theaterId,
            screenId,
            showDate:new Date(showDate),
            showTime,
            pricing: pricing || {
                vip: 500,
                premium: 350,
                economy: 250
            },
            seatStatus,
            totalSeatsAvailable: seatStatus.length
        });

        await showtime.populate(['movieId','theaterId']);

        res.status(201).json({
            success:true,
            data:showtime
        });
    }catch(error){
        res.status(400).json({
            success:false,
            message:'Error creating showtime',
            error:error.message
        });
    }
};

//@desc Get all showtimes
//@route GET/api/showtimes
//@access Public
export const getAllShowtimes= async(req,res)=>{
    try{
        const {movieId,theaterId,showDate}=req.query;

        const filter={};
        if(movieId) filter.movieId=movieId;
        if(theaterId) filter.theaterId=theaterId;
        if(showDate){
            const date = new Date(showDate);
            filter.showDate={
                $gte:new Date(date.setHours(0,0,0,0)),  //start of day
                $lt:new Date(date.setHours(23,59,59,999)) // till end of day
            }; 
        }

        const showtimes= await Showtime.find(filter)
           .populate('movieId')
           .populate('theaterId')
           .sort({showDate:1,showTime:1});

        res.json({
            success:true,
            count:showtimes.length,
            data:showtimes
        });
    }catch(error){
        res.status(500).json({
            success:false,
            message:'Error fetching showtimes',
            error:error.message
        });
    }
};

//@Desc Get showtime by ID
//@route GET/api/showtimes/:id
//@access Public
export const getShowtimeById= async (req,res)=>{
    try{
        const showtime = await Showtime.findById(req.params.id)
          .populate('movieId')
          .populate('theaterId'); //similer to SELECT *
// FROM showtimes
// JOIN movies ON showtimes.movieId = movies.id
// JOIN theaters ON showtimes.theaterId = theaters.id;

        
        if(!showtime){
            return res.status(404).json({
                success:false,
                message:'Showtime not found'
            });
        }

        res.json({
            success:true,
            data:showtime
        });
    }catch(error){
        res.status(500).json({
            success:false,
            message:'Error fetching showtime',
            error:error.message
        });
    }
};

//@desc Delete showtime
//@route DELETE/api/showtime/:ID
//@access Admin
export const deleteShowtime=async (req,res)=>{
    try{
        const showtime= await Showtime.findByIdAndDelete(req.params.id);

        if(!showtime){
            return res.status(404).json({
                success:false,
                message:'Showtime not found'
            });
        }

        res.json({
            success:true,
            message:'Showtime deleted successfully'
        });
    }catch(error){
        res.status(500).json({
            success:false,
            message:'Error deleting showtime',
            error:error.message
        });
    }
};