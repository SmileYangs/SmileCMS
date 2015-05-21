var EventProxy = require('eventproxy');

var models = require('../models');
var Todo = models.Todo;
var _ = require('lodash');


exports.getTodoById = function (id, callback) {
	Todo.findOne({_id: id},callback);
};

exports.remove = function(id,callback){
	Todo.remove({_id:id},callback);
}

exports.update = function(id,content,done,callback){
	Todo.findOne({_id:id},function(err,todo){
		if(err){
			return callback(err);
		}

		todo.content = content;
		todo.done = done;

		todo.save(callback);
	})
}

exports.getCountByQuery = function (query, callback) {
  Todo.count(query, callback);
};

exports.getTodosByQuery = function (query, opt, callback) {
  Todo.find(query,'', opt, callback);
};

/*新建并保存分类*/
exports.newAndSave = function(content,done,callback){
	var todo = new Todo();
	todo.content = content;
	todo.done = done;

	todo.save(callback);
}