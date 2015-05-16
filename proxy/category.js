var EventProxy = require('eventproxy');

var models = require('../models');
var Category = models.Category;
var _ = require('lodash');


/**
 * 根据主题ID获取主题
 * Callback:
 * - err, 数据库错误
 * - topic, 主题
 * - author, 作者
 * - lastReply, 最后回复
 * @param {String} id 主题ID
 * @param {Function} callback 回调函数
 */
exports.getCategoryById = function (id, callback) {
	Category.findOne({_id: id},callback);
};
/**
 * 根据关键词，获取主题列表
 * Callback:
 * - err, 数据库错误
 * - count, 主题列表
 * @param {String} query 搜索关键词
 * @param {Object} opt 搜索选项
 * @param {Function} callback 回调函数
 */
exports.getCategoryByQuery = function (query, opt, callback) {
  Category.find(query, '_id', opt, function (err, docs) {
    if (err) {
      return callback(err);
    }
    if (docs.length === 0) {
      return callback(null, []);
    }

    var categorys_id = _.pluck(docs, 'id');
    var proxy = new EventProxy();
    proxy.after('category_ready', categorys_id.length, function (categorys) {
      // 过滤掉空值
      var filtered = categorys.filter(function (item) {
        return !!item;
      });
      return callback(null, filtered);
    });
    proxy.fail(callback);

    categorys_id.forEach(function (id, i) {
      exports.getCategoryById(id, proxy.group('category_ready',function(category){
      	return category;
      }));
    });
  });
};

/**
 * 获取关键词能搜索到的主题数量
 * Callback:
 * - err, 数据库错误
 * - count, 主题数量
 * @param {String} query 搜索关键词
 * @param {Function} callback 回调函数
 */
exports.getCountByQuery = function (query, callback) {
  Category.count(query, callback);
};

/**
 * 根据分类ID，查找一个分类
 * @param {String} id 分类ID
 * @param {Function} callback 回调函数
 */
exports.getCategory = function (id, callback) {
  Category.findOne({_id: id}, callback);
};

/**
 * 
 * Callback:
 * - err, 数据库异常
 * - users, 
 * @param {Array} names 用户名列表
 * @param {Function} callback 回调函数
 */
exports.getCategoryByTitle = function (title,opt,callback) {
  Category.findOne({ title: title },opt,callback);
};


exports.remove = function(id,callback){
	Category.remove({_id:id},callback);
}

exports.update = function(id,title,description,callback){
	Category.findOne({_id:id},function(err,category){
		if(err){
			return callback(err);
		}

		category.title = title;
		category.description = description;

		category.save(callback);
	})
}

/*新建并保存分类*/
exports.newAndSave = function(title,description,callback){
	var category = new Category();
	category.title = title;
	category.description = description;

	category.save(callback);
}