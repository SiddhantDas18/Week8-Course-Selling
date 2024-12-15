const { Router } = require('express');
const jwt = require('jsonwebtoken');
const { JWT_USER_SECRET } = require('../config')
const { UserMiddleware } = require('../Auth/user')
const bcrypt = require('bcrypt');
const z = require('zod');

const userRouter = Router();
const { UserModel, CourseModel, PurchaseModel } = require('../Database/db')

const userzod = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    firstname: z.string().min(1, "Firstname is required"),
    lastname: z.string().min(1, "Lastname is required"),
});

userRouter.post('/signup', async function (req, res) {

    try {
        const { email, password, firstname, lastname } = userzod.parse(req.body);
        const hashed = await bcrypt.hash(password, 10);
        try {
            const user = await UserModel.create({
                email,
                password: hashed,
                firstname,
                lastname
            })

            res.json({
                msg: "User created successfully",
                user: user
            })

        } catch (err) {
            return res.status(400).json({
                msg: "User already exists"
            })
        }

    } catch (err) {
        return res.status(400).json({
            msg: "Invalid request",
            error: err.message
        })
    }



})

userRouter.post('/login', async function (req, res) {
    try {
        const { email, password } = userzod.parse(req.body);
        const checkuser = await UserModel.findOne({
            email: email
        });

        if (checkuser) {

            const hashed = await bcrypt.hash(password, 10);
            const passcheck = bcrypt.compare(hashed, checkuser.password);
            console.log("hashed: " + hashed)
            console.log("Userpassword" + checkuser.password)

            if (passcheck) {
                const token = jwt.sign({
                    userId: checkuser._id.toString()
                }, JWT_USER_SECRET);
                res.json({
                    msg: "Login successful",
                    token: token
                })

            } else {
                res.status(403).json({
                    msg: "Invalid password"
                })
            }
        } else {
            res.status(403).json({
                msg: "User not found"
            })
        }

    } catch (err) {
        return res.status(400).json({
            msg: "Invalid request",
            error: err.message
        })
    }

})

userRouter.post('/purchase',UserMiddleware, async function(req,res){
    const userId = req.userId;
    const courseId = req.body.courseId;

    try{

        const courseSeach = await CourseModel.findOne({
            _id: courseId
        })

        if(!courseSeach){
            return res.status(404).json({
                msg: "Course not found"
            })
        }else{
            const purchase = await PurchaseModel.create({
                course: courseId,
                userId
            })

            res.json({
                msg: "Course purchased successfully",
                purchase: purchase,
                course: courseSeach
            })
        }

    }catch(e){
        return res.status(400).json({
            msg: "Invalid request",
            error: e.message
        })
    }
})

userRouter.get('/mycourses',UserMiddleware, async function(req,res){
    const userId = req.userId;
    
    const purchasedCourse = await PurchaseModel.find({
        userId:userId
    })

    if(purchasedCourse){
        const courses = await CourseModel.find({
            _id: {$in: purchasedCourse.map(p => p.course)}
        })
        res.json({
            msg: "My courses fetched successfully",
            courses: courses
        })
    }else{
        res.status(404).json({
            msg: "No purchased courses found"
        })
    }

})






module.exports = {
    userRouter: userRouter
}