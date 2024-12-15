const mongoose = require('mongoose');



const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const admin = new Schema({
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    firstname:{type:String,required:true},
    lastname:{type:String,required:true}
})

const user = new Schema({
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    firstname:{type:String,required:true},
    lastname:{type:String,required:true}
})

const course= new Schema({
    access:{type:String},
    title:{type:String,required:true},
    description:{type:String,required:true},
    price:{type:Number,required:true},
    imageUrl:{type:String},
    createdby:{type:ObjectId}
})

const purchase = new Schema({
    course:ObjectId,
    userId:ObjectId
})

const AdminModel = mongoose.model('admins',admin);
const UserModel = mongoose.model('users',user);
const CourseModel = mongoose.model('courses',course);
const PurchaseModel = mongoose.model('purchases',purchase);

module.exports={
    AdminModel:AdminModel,
    UserModel:UserModel,
    CourseModel:CourseModel,
    PurchaseModel:PurchaseModel
}
