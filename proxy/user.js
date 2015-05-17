var models = require('../models');
var User = models.User;
var utility = require('utility');
var uuid = require('node-uuid');

/**
 * 根据用户名列表查找用户列表
 * Callback:
 * - err, 数据库异常
 * - users, 用户列表
 * @param {Array} names 用户名列表
 * @param {Function} callback 回调函数
 */
exports.getUsersByNames = function (usernames, callback) {
  if (usernames.length === 0) {
    return callback(null, []);
  }
  User.find({ username: { $in: usernames } }, callback);
};

/**
 * 根据登录名查找用户
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} username 登录名
 * @param {Function} callback 回调函数
 */
exports.getUserByUsername = function (username, callback) {
  User.findOne({'username': username}, callback);
};

/**
 * 根据用户ID，查找用户
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} id 用户ID
 * @param {Function} callback 回调函数
 */
exports.getUserById = function (id, callback) {
  User.findOne({_id: id}, callback);
};

/**
 * 根据邮箱，查找用户
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} email 邮箱地址
 * @param {Function} callback 回调函数
 */
exports.getUserByMail = function (email, callback) {
  User.findOne({email: email}, callback);
};

/**
 * 根据用户ID列表，获取一组用户
 * Callback:
 * - err, 数据库异常
 * - users, 用户列表
 * @param {Array} ids 用户ID列表
 * @param {Function} callback 回调函数
 */
exports.getUsersByIds = function (ids, callback) {
  User.find({'_id': {'$in': ids}}, callback);
};

exports.remove = function(id,callback){
  User.remove({_id:id},callback);
}

exports.update = function(id,nickname, username, email, signature,callback){
  User.findOne({_id:id},function(err,user){
    if(err){
     return callback(err);
    }

    user.nickname = nickname;
    user.username = username;
    user.email = email;
    user.signature = signature;

    user.save(callback);

  })
}

/**
 * 根据关键字，获取一组用户
 * Callback:
 * - err, 数据库异常
 * - users, 用户列表
 * @param {String} query 关键字
 * @param {Object} opt 选项
 * @param {Function} callback 回调函数
 */
exports.getUsersByQuery = function (query, opt, callback) {
  User.find(query, '', opt, callback);
};


exports.newAndSave = function (nickname, username, pass, email, signature,callback) {
  var user = new User();
  user.nickname = nickname;
  user.username = username;
  user.password = pass;
  user.email = email;
  user.signature = signature;
  
  user.save(callback);
};