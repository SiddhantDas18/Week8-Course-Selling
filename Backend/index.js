require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');


const { userRouter } = require('./Router/user');
const { adminRouter } = require('./Router/admin');
const { courseRouter } = require('./Router/course');



const JWT_SECRET = 'Honolulu';
exports.JWT_SECRET = JWT_SECRET;

const app = express();

app.use(express.json());

app.use('/user', userRouter);
app.use('/admin', adminRouter);
app.use('/course', courseRouter);


async function main() {
    await mongoose.connect(process.env.URI);
    console.log(process.env.URI);
    app.listen(3000);
    console.log("server listening on port: 3000");
}

main();
