var CategorySub = require('../models').CategorySub;

exports.getCategorySub = function (userId, category_id, callback) {
  CategorySub.findOne({user_id: userId, category_id: category_id}, callback);
};

exports.getCategorySubsByUserId = function (userId, callback) {
  CategorySub.find({user_id: userId}, callback);
};

exports.getCategorySubsByCategoryId = function (category_id, callback) {
  CategorySub.find({category_id: category_id}, callback);
};

exports.newAndSave = function (userId, category_id, callback) {
  var category_sub = new CategorySub();
  category_sub.user_id = userId;
  category_sub.category_id = category_id;

  category_sub.save(callback);
};

exports.remove = function (userId, category_id, callback) {
  CategorySub.remove({user_id: userId, category_id: category_id}, callback);
};

exports.removeAll = function(category_id,callback) {
	CategorySub.remove({category_id: category_id}, callback);
}

