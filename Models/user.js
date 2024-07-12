const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const SchoolSchema = new mongoose.Schema({
    schoolName:{
        type:String,
        required:[true, "School Name must be provided"],
        trim:true,
        maxlength:[255, 'Name can not be more than 255 characters'], 
        minlength:[2, 'Name can not be less than 2 characters']
    },
    email:{
        type:String,
        required:[true, 'School email must be provided'],
        trim:true,
        unique:[true, 'Email has been registered!']
    },
    address:{
        type:String,
        required:[true, 'School address must be provided'],
        trim:true
    },
    password:{
        type:String,
        required:[true, 'School password must be provided'],
        trim:true,
        maxlength:[20, 'password can not be more than 20 characters'], 
        minlength:[2, 'pasword can not be less than 3 characters']
    },
    binPoints:{
        type:Number,
        default:0
    },
    reward:{
        type:String,
        default:""
    },
    role:{
        type:String,
        default:"user"
    },
    createdAt:{
        type:Date,
        default: Date.now()
    },
    

})

SchoolSchema.pre('save', async function (next) {
    const school = this;
  
    if (!school.isModified('password')) return next();
  
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(school.password, salt);
      school.password = hashedPassword;
      next();
    } catch (error) {
      return next(error);
    }
});


  
  
const School = mongoose.models.SchoolSchema || mongoose.model('School', SchoolSchema);

module.exports = School