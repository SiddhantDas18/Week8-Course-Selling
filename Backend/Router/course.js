const {Router}= require('express');

const courseRouter = Router();
const {CourseModel} = require('../Database/db')
courseRouter.get('/gallery',async function (req,res){
    try{
        const courses = await CourseModel.find({
            access:"all"
        })
        res.json({
            msg: "Gallery fetched successfully",
            courses:courses
        })
    }catch(err){
        return res.status(500).json({
            msg: "Error fetching courses",
            error: err.message
        })
    }
    
})


module.exports={
    courseRouter:courseRouter
}