const express = require('express');
const User = require('../models/user');

const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: "Welcome" });
});

router.post('/login', (req, res) => {
    if (req.body.email == "bruno@email.com" && req.body.password == "123") {
        res.json({ ok: true });
    }

    res.status(401).end();
});

router.post('/register', async (req, res) => {
    try {
        const user = await User.create(req.body);
        return res.send({ user });
    } catch (e) {
        return res.status(400).send({ message: "Register Failed", error: e});
    }
});

module.exports = app => app.use('/auth', router);