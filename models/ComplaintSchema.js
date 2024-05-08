const mongoose=require('mongoose');
const{Schema}=mongoose;
const ComplaintSchema=new Schema({
    Name : {
        type : String
    },
    AdmNo :{
        type : String
    },
    Complaint :{
        type : String
    }
});

module.exports = mongoose.model('complaint', ComplaintSchema);