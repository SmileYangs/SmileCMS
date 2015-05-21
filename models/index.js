var mongoose = require('mongoose');
var config = require('../config');

mongoose.connect(config.db, function (err) {
  if (err) {
    console.error('connect to %s error: ', config.db, err.message);
    process.exit(1);
  }
});

//models
require('./user');
require('./category');
require('./knowledge');
require('./todo');
require('./category_sub');

exports.User = mongoose.model('User');
exports.Category = mongoose.model('Category');
exports.Knowledge = mongoose.model('Knowledge');
exports.Todo = mongoose.model('Todo');
exports.CategorySub = mongoose.model('CategorySub');
