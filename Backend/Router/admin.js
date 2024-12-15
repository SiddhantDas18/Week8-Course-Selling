const { Router } = require('express');
const jwt = require('jsonwebtoken');
const { JWT_ADMIN_SECRET } = require("../config");
const { AdminMiddleware } = require('../Auth/admin')
const bcrypt = require('bcrypt');
const x = require('zod');



const adminRouter = Router();

const { AdminModel, CourseModel } = require('../Database/db');
const z = require('zod');

const userzod = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    firstname: z.string().min(1, "Firstname is required"),
    lastname: z.string().min(1, "Lastname is required"),
});

const coursezod = z.object({
    title: z.string().min(1).max(30),
    description: z.string().min(1).max(200),
    price: z.number().min(0),
    imageUrl: z.string(),
})

adminRouter.post('/signup', async function (req, res) {
    try {
        const { email, password, firstname, lastname } = userzod.parse(req.body);
        const hashed = await bcrypt.hash(password, 10);
        try {
            const user = await AdminModel.create({
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

adminRouter.post('/login', async function (req, res) {
    try {
        const { email, password } = userzod.parse(req.body);

        const checkuser = await AdminModel.findOne({
            email: email
        });

        if (checkuser) {

            const hashed = await bcrypt.hash(password, 10);
            const passcheck = bcrypt.compare(hashed, checkuser.password);

            if (passcheck) {
                const token = jwt.sign({
                    userId: checkuser._id.toString()
                }, JWT_ADMIN_SECRET);
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

    } catch (e) {
        return res.status(400).json({
            msg: "Invalid request",
            error: e.message
        })
    }
})

adminRouter.post('/addcourse', AdminMiddleware, async function (req, res) {
    try {
        const { title, description, price, imageUrl } = (req.body);
        const addcourse = await CourseModel.create({
            access: "all",
            title,
            description,
            price,
            imageUrl,
            createdby: req.userId
        })
        res.json({
            msg: "Course added successfully",
            course: addcourse
        })
    } catch (e) {
        res.status(403).json({
            msg: "Invalid request",
            error: e.message
        })
    }
})

adminRouter.put('/update', AdminMiddleware, async function (req, res) {
    const userId = req.userId;
    const oldcourse = req.body.oldcourse;
    const { title, description, price, imageUrl, createdby } = coursezod.parse(req.body);

    try {
        const usercheck = await CourseModel.find({
            creadtedby: userId
        })
        if (usercheck) {

            try {
                const updatedCourse = await CourseModel.findOneAndUpdate(
                    { title: oldcourse, createdby: userId }, // Match the course by title and user ID
                    { title, description, price, imageUrl }, // Update fields
                    { new: true } // Return the updated document
                );

                if (updatedCourse) {
                    res.json({
                        msg: "Course updated successfully",
                        course: updatedCourse
                    })
                } else {
                    res.status(404).json({
                        msg: "Course not found"
                    })
                }

            } catch (err) {
                return res.status(400).json({
                    msg: "can't find course",
                    error: err.message
                })
            }

        } else {
            return res.status(403).json({
                msg: "course creator not found"
            })
        }
    } catch (err) {
        res.status(403).json({
            msg: "Invalid request",
            error: err.message
        })
    }

})


module.exports = {
    adminRouter: adminRouter
}