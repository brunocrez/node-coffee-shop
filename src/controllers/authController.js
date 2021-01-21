const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET = require('../config/secret');
const User = require('../models/user');

const router = express.Router();

router.get('/users', async (req, res) => {
    const data = await User.find();
    return res.status(200).send({ data });
});

router.post('/register', async (req, res) => {  
    try {
        const { email } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send({ message: "User already registered." });
        }

        const newUser = await User.create(req.body);
        newUser.password = undefined;
        return res.send({ newUser });

    } catch (e) {
        return res.status(400).json({ message: "Register Failed", error: e});
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return res.status(400).send({ message: "User not found in database." }); 
    }

    if (!await bcrypt.compare(password, user.password)) {
        return res.status(400).send({ message: "Password is not correct." });
    }

    user.password = undefined;

    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: 300 });
    res.send({ user, token });
    
});

module.exports = app => app.use('/auth', router);