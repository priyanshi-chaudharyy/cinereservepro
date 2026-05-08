import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema =new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Name is required'],
        trim:true
    },
    email:{
        type:String,
        required:[true,'Email is required'],
        unique:true,
        lowercase:true,
        match:[/^\S+@\S+\.\S+$/,'Please enter a valid email']
    },
    password:{
        type:String,
        required:[true,'Password is required'],
        minlength:6,
        select:false  // dont return password by defalut
    },
    phone:{
        type:String,
        match:[/^\d{10}$/,'Please enter a valid 10-digit phone number']
    },
    role:{
        type:String,
        enum:['user','admin','theater_admin','staff'],
        default:'user'
    },
    isApproved:{
        type:Boolean,
        default:true  // Regular users are auto-approved; theater_admins set to false on signup
    },
    businessName:{
        type:String,
        trim:true  // Cinema chain name like "PVR Cinemas"
    },
    profilePicture:String,
    bookingHistory:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Booking'
    }]
}, {
    timestamps:true  //auto adds createdAt ,updatedAt
});

//hash password before saving
userSchema.pre('save',async function(){   //.pre('save') => runs before saving
    if(!this.isModified('password'))
        return ;
    this.password=await bcrypt.hash(this.password,12);
});

//method to compare password
userSchema.methods.comparePassword=async function(candidatePassword){
    return await bcrypt.compare(candidatePassword,this.password);
};

export default mongoose.model('User',userSchema);