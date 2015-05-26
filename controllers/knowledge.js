var validator = require('validator');
var eventproxy = require('eventproxy');
var Knowledge = require('../proxy').Knowledge;
var Category = require('../proxy').Category;
var CategorySub = require('../proxy').CategorySub;
var User = require('../proxy').User;
var mail = require('../common/mail');
var tools = require('../common/tools');
var _ = require('lodash');


exports.index = function(req, res, next){
	var page = parseInt(req.query.page, 10) || 1;
	page = page > 0 ? page : 1;

	var ep = new eventproxy();

	ep.fail(next);
	var query = {};

	var limit = 10;
	var options = { skip: (page - 1) * limit, limit: limit, sort: '-create_at'};

	Knowledge.getKnowledgesByQuery(query,options,ep.done('knowledges',function(knowledges){
		return knowledges;
	}));

	Knowledge.getCountByQuery(query, ep.done('pages',function (all_topics_count) {
		var pages = Math.ceil(all_topics_count / limit);
		return pages;
	}));

	ep.all("knowledges","pages",function(knowledges,pages){

		res.send({
			knowledges: knowledges,
			page: page,
			pages: pages
		});
	});
};

exports.categoryKnowledge = function(req,res,next){

};

exports.showKnowledge = function(req,res,next){

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

	// 添加邮件发送

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

		if(knowledge.publish){
			// 查询订阅了该分类的所有用户
			CategorySub.getCategorySubsByCategoryId(category._id,function(err,subs){
				if(err){
					next(err);
				}

				if(subs.length > 0){
					var user_ids = _.pluck(subs,"user_id");
					user_ids.forEach(function(id,i){
						User.getUserById(id,function(err,user){{
							if(err){
								next(err);
							}

							mail.sendTipsMail(user.email,category.title,knowledge._id,user.username,knowledge.title);
						}})
					});
				}

			})
		}

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

				if(knowledge.publish){
					// 查询订阅了该分类的所有用户
					CategorySub.getCategorySubsByCategoryId(category._id,function(err,subs){
						if(err){
							next(err);
						}

						if(subs.length > 0){
							var user_ids = _.pluck(subs,"user_id");
							user_ids.forEach(function(id,i){
								User.getUserById(id,function(err,user){{
									if(err){
										next(err);
									}

									mail.sendTipsMail(user.email,category.title,knowledge._id,user.username,knowledge.title);
								}})
							});
						}
					})
				}
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