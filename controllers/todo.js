var validator = require('validator');
var eventproxy = require('eventproxy');
var Todo = require('../proxy').Todo;
var _ = require('lodash');

exports.index = function(req,res,next){

	var query = {},
		options = {sort: '-create_at'};

	Todo.getTodosByQuery(query,options,function(err,todos){
		if(err) {
			next(err)
		}

		
		res.send({
			todos: todos
		});
	})
};

exports.create = function(req,res,next){
	var content = req.body.content;
	content = validator.escape(content);
	var done = req.body.done;

	Todo.newAndSave(content,done,function(err,todo){
		if(err){
			next(err);
		}

		res.send(todo);
	})
};

exports.update = function(req,res,next){
	var id = req.params.id;
	var content = req.body.content;
	content = validator.escape(content);
	var done = req.body.done;

	Todo.update(id,content,done,function(err,todo){
		if(err){
			next(err);
		}

		res.send(todo);
	})
};

exports.delete = function(req,res,next){
	var id = req.params.id;	
	Todo.getTodoById(id,function(err,todo){
		if(err){
			next(err);
		}

		Todo.remove(id,function(){
			res.status(200).send({msg:"删除成功"})
		})
	})
};