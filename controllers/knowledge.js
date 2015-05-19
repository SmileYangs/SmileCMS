var validator = require('validator');
var eventproxy = require('eventproxy');
var Knowledge = require('../proxy').Knowledge;
var Category = require('../proxy').Category;
var tools = require('../common/tools');
var _ = require('lodash');


exports.index = function(req, res, next){

	var ep = new eventproxy();

	ep.fail(next);
	var query = {};

	Knowledge.getKnowledgesByQuery(query,{sort: '-create_at'},ep.done('knowledges',function(knowledges){
		return knowledges;
	}))

	ep.all("knowledges",function(knowledges){

		res.header("Content-Type", "application/json; charset=utf-8").send({
			knowledges: knowledges
		});
	});
};

exports.create = function(req, res, next){
	var title = validator.trim(req.body.title);
	title = validator.escape(title);
	var category_id = validator.trim(req.body.category_id);
	var content = validator.trim(req.body.content);
	content = validator.escape(content);
	var publish = req.body.publish ? true : false;

	var ep = new eventproxy();
	ep.fail(next);

	Category.addKnowledge(category_id,ep.done('category_count_add',function(category){
		return category;
	}))

	Knowledge.newAndSave(title,content,category_id,publish, ep.done('knowledge',function(knowledge){
		return knowledge;
	}));

	ep.all('category_count_add','knowledge',function(category,knowledge){
		knowledge = knowledge.toObject();

		knowledge.friendly_create_at = tools.formatDate(knowledge.create_at, true);
		knowledge.category = category;

		res.header("Content-Type", "application/json; charset=utf-8").send({
			tips: {
				title: "添加成功",
				msg: knowledge.title + "添加成功"
			},
			action: 'add',
			knowledge: knowledge
		})
	});
};

exports.update = function(req, res, next){
	
};

exports.delete = function(req, res, next){
	var id = req.params.id;

	var ep = new eventproxy();
	ep.fail(next);

	Knowledge.getKnowById(id,function(err,knowledge){
		if(err){
			return next(err);
		}

		ep.emit('getKnowledge',knowledge)

		Category.reduceKnowledge(knowledge.category_id,ep.done('category_count_reduce',function(category){
			return category;
		}));

		Knowledge.remove(id,ep.done('knowledge_remove',function(knowledge){
			return knowledge;
		}));
	});


	ep.all('category_count_reduce','knowledge_remove','getKnowledge',function(category,status,knowledge){
		res.header("Content-Type", "application/json; charset=utf-8").send({
			tips: {
				title: "删除成功",
				msg: knowledge.title + "删除成功"
			},
			action: 'delete',
			knowledge: knowledge
		})
	})
};