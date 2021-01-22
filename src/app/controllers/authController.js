const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');

const verifyJWT = require('../middlewares/auth');
const User = require('../models/user');
const mailer = require('../helpers/mailer');
const { SECRET } = require('../../config/auth.json');

const router = express.Router();

router.get('/users', verifyJWT, async (req, res) => {
    const data = await User.find();
    return res.status(200).send({ data, userId: req.userId });
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

router.post('/password/forgot', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send({ message: "User not found in database." }); 
        }

        const hash = crypto.randomBytes(12).toString('hex');

        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
            $set: {
                tokenResetPassword: hash,
                tokenResetExpires: expirationDate
            },
            
        });

        const mailInfo = {
            to: email,
            from: 'admin@admin.com.br',
            subject: 'Recuperação de Senha',
            template: 'forgot-password',
            context: { hash }
        };

        mailer.sendMail(mailInfo, (err) => {
            if (err) {
                return res.status(400).send({ message: 'Error trying to send e-mail to recovery password.' });
            }

            res.send();
        })
        

    } catch (e) {
        res.status(400).send({ message: "Error trying to call forgot password's service." });
    }
});

router.post('/password/reset', async (req, res) => {
    const { email, hash, password } = req.body;

    try {
        const user = await User.findOne({ email }).select('+tokenResetPassword tokenResetExpires');
        if (!user) {
            return res.status(400).send({ message: "User not found in database." }); 
        }

        if (hash !== user.tokenResetPassword) {
            return res.status(400).send({ message: "Invalid Token." }); 
        }

        const now = new Date();
        if (now > user.tokenResetExpires) {
            return res.status(400).send({ message: "Token Expired. Please, generate a new one." });
        }

        user.password = password;
        await user.save();

        res.send();
    } catch (err) {
        res.status(400).send({ message: "Error trying to call reset password's service." });
    }
});

module.exports = app => app.use('/auth', router);