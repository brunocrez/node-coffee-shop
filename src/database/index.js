const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/coffeedb', { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;

module.exports = mongoose;