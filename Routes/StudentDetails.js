const express=require('express');
const router=express.Router();
const User=require('../models/UserSchema');
const RSchema=require('../models/RaddressSchema');
const { body, validationResult } = require('express-validator');
router.post('/student',
// [
//     body('PhoneNo',"invalid phone no").isLength({min:10})
// ],
async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
        await User.create({
            Name:req.body.Name,
            PhoneNo:req.body.PhoneNo,
            Gender:req.body.Gender,
            Degree:req.body.gender,
            AdmNo:req.body.AdmNo,
            YearOfStudy:req.body.YearOfStudy,
            Branch:req.body.Branch
        })
        await RSchema.create({
            Address1:req.body.Address1,
            Address2:req.body.Address2,
            Pincode:req.body.Pincode,
            District:req.body.District,
            State:req.body.State,
            Country:req.body.Country

        })
        res.json({success:true})
    } catch (error) {
        console.log(error);
        res.json({success:false});
    }
}
)
module.exports=router;