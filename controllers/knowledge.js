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

		res.send({
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

		res.send({
			tips: {
				title: "添加成功",
				msg: "文章添加成功"
			},
			action: 'add',
			knowledge: knowledge
		})
	});
};

exports.update = function(req, res, next){
	var title = validator.trim(req.body.title);
	title = validator.escape(title);
	var category_id = validator.trim(req.body.category_id);
	var content = validator.trim(req.body.content);
	content = validator.escape(content);
	var publish = req.body.publish;
	var id = req.params.id;

	var ep = new eventproxy();
	ep.fail(next);

	var events = [];
	
	//查找当前id对应的knowledge,判断category的id是否有变化
	Knowledge.getKnowById(id,function(err,knowledge){
		if(err){
			return next(err);
		}

		Knowledge.update(id,title,content,category_id,publish,ep.done('knowledge_update',function(knowledge){
			return knowledge;
		}));

		if(knowledge.category_id != category_id){
			
			Category.reduceKnowledge(knowledge.category_id,ep.done('category_count_reduce',function(category){
				return category;
			}));

			Category.addKnowledge(category_id,ep.done('category_count_add',function(category){
				return category;
			}));

			events = ['category_count_reduce','category_count_add','knowledge_update'];
			
			ep.assign(events,function(category_old,category,knowledge){
				knowledge = knowledge.toObject();

				knowledge.friendly_create_at = tools.formatDate(knowledge.create_at, true);
				knowledge.category = category;

				res.send({
					tips: {
						title: "更新成功",
						msg: "文章更新成功"
					},
					action: 'update',
					knowledge: knowledge
				})
			});
		} else {
			Category.getCategoryById(category_id,ep.done('getCategory',function(category){
				return category;
			}));

			ep.all('knowledge_update','getCategory',function(knowledge,category){
				knowledge = knowledge.toObject();

				knowledge.friendly_create_at = tools.formatDate(knowledge.create_at, true);
				knowledge.category = category;

				res.send({
					tips: {
						title: "更新成功",
						msg: "文章更新成功"
					},
					action: 'update',
					knowledge: knowledge
				})
			})
		}

	})
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
			console.log(category);
			return category;
		}));

		Knowledge.remove(id,ep.done('knowledge_remove',function(knowledge){
			return knowledge;
		}));
	});


	ep.all('category_count_reduce','knowledge_remove','getKnowledge',function(category,status,knowledge){
		res.send({
			tips: {
				title: "删除成功",
				msg: "文章删除成功"
			},
			action: 'delete',
			knowledge: knowledge
		})
	})
};