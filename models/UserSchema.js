const mongoose = require('mongoose');
const { Schema } = mongoose;
const UserSchema=new Schema(
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
        EmergencyPhoneNo:{
            type:String
        },
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
            data: Buffer, 
            contentType: String 
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
            data: Buffer, 
            contentType: String 
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
    }
)
module.exports=mongoose.model('student',UserSchema)