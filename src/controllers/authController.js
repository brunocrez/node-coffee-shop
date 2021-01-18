const express = require('express');
const User = require('../models/user');

const router = express.Router();

router.get('/users', async (req, res) => {
    const data = await User.find();
    return res.status(200).send({ data });
});

router.post('/login', (req, res) => {
    if (req.body.email == "bruno@email.com" && req.body.password == "123") {
        res.json({ ok: true });
    }

    res.status(401).end();
});

router.post('/register', async (req, res) => {  
    try {
        const { email} = req.body;

        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send({ message: "User already registered." });
        }

        const newUser = await User.create(req.body);
        return res.send({ newUser });

    } catch (e) {
        return res.status(400).json({ message: "Register Failed", error: e});
    }
});

module.exports = app => app.use('/auth', router);