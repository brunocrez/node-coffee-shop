const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: "Welcome" });
});

router.post('/login', (req, res) => {
    if (req.body.username == "bruno" && req.body.password == "123") {
        res.json({ ok: true });
    }

    res.status(401).end();
})

module.exports = router;