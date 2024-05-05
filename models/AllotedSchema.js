const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt= require('bcryptjs');

const AllotedSchema=new Schema(
    {
        Name:{
            type:String,
            required:function(){
                return this.someCondition;
            },
        },
        PhoneNo:{
            type:String,
            //required:true
        },
        password:{
            type:String
        },
        // EmergencyPhoneNo:{
        //     type:String
        // },
        Gender:{
            type:String
        },
        Degree:{
            type:String
        },
        AdmNo:{
            type:String,
        },
        YearOfStudy:{
            type:String
        },
        Branch:{
            type:String
        },
        PAddress1:{
            type:String,
            // required:true
        },
        PAddress2:{
            type:String
        },
        PPincode:{
            type:String,
            // required:true
        },
        PDistrict:{
            type:String
        },
        PState:{
            type:String
        },
        PCountry:{
            type:String
        },
        Adhar:{ 
            type:String
        },
        RAddress1:{
            type:String,
            // required:true
        },
        RAddress2:{
            type:String
        },
        RPincode:{
            type:String,
            // required:true
        },
        RDistrict:{
            type:String
        },
        RState:{
            type:String
        },
        RCountry:{
            type:String
        },
        Income:{
            type:String
        },
        IncomeCertificate:{ 
            type: String 
        },
        GName:{
            type:String,
            required:function(){
                return this.someCondition;
            },
        },
        GPhoneNo:{
            type:String
        },
        Relation:{
            type:String
        },
        GAddress1:{
            type:String,
            // required:true
        },
        GAddress2:{
            type:String
        },
        GPincode:{
            type:String,
            // required:true
        },
        GDistrict:{
            type:String
        },
        GState:{
            type:String
        },
        GCountry:{
            type:String
        },
        Priority:{
            type:String
        },
        Room_No:{
            type:Number
        }, absenceStreaks: {
            type: Map,
            of: Number, // Key is date, value is absence streak
            default: new Map(), // Initialize absenceStreaks as an empty Map
        },
    }
)
AllotedSchema.statics.countStudents = async function () {
    try {
      const count = await this.countDocuments();
      return count;
    } catch (err) {
      throw new Error('Error counting students');
    }
  };
  AllotedSchema.statics.login = async function(AdmNo, password) {
    const user = await this.findOne({ AdmNo });

    if (!user) {
        throw new Error("Invalid Username or Password");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        throw new Error("Invalid Username or Password");
    }

    return user;
}; 
  
module.exports=mongoose.model('user',AllotedSchema)