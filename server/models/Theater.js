import mongoose, { trusted } from 'mongoose';

const screenSchema= new mongoose.Schema({ 
    screenNumber:{
        type:Number,
        required:true
    },
    screenName:String,
    totalSeats:{
        type:Number,
        required:true
    },
    seatLayout:{
        rows:{
            type:Number,
            required:true
        },
        columns:{
            type:Number,
            required:true
        }
    },
    seatType:[{
        type:{
            type:String,
            enum:['VIP',"Preminum",'Economy'],
            required:true
        },
        rows:[String],  //[]=>array of string eg: ['A','B'] for VIP
        basePrice:Number
    }]
});

const theaterSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    location:{
        address:String,
        city:String,
        state:String,
        pincode:String,
        coordinates:{
            lat:Number,
            lng:Number
        }
    },
    screens:[screenSchema],
    facilities:[{
        type:String,
        enum:['IMAX','4DX','Dolby Atmos','Parking','Food Court','Wheelchair Access']
    }],
    isActive:{
        type:Boolean,
        default:true
    }
},{
    timestamps:true
});

export default mongoose.model('Theater',theaterSchema); 