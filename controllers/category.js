var validator = require('validator');
var eventproxy = require('eventproxy');
var User = require('../proxy').User;
var Category = require('../proxy').Category;
var Knowledge = require('../proxy').Knowledge;
var CategorySub = require('../proxy').CategorySub;
var _ = require('lodash');

exports.index = function(req, res, next) {
  	var proxy = new eventproxy();
  	proxy.fail(next);

	
	Category.getCategoryByQuery({},{sort: '-sub_count'},proxy.done('categorys',function(categorys){
		return categorys;
	}));

	var events = [];

	if(req.session.user){
		// 查询用户的订阅,在分类中生成是否已订阅
		CategorySub.getCategorySubsByUserId(req.session.user._id,proxy.done('subs',function(docs){
			return docs;
		}));
		events = ["categorys","subs"];
	} else {
		events = ["categorys"];
	}

	proxy.assign(events,function(categorys,subs){

		// 处理categorys,添加是否已订阅

		var subs_ids = subs ? _.pluck(subs,'category_id') : [];
		
		categorys = _.map(categorys,function(category){
			category = category.toObject();

			category.is_sub = _.some(subs_ids,function(id){
				return _.isEqual(id,category._id);
			});

			return category;
		});

		
		res.send({
			categorys: categorys
		});
	})
};

exports.userCategory = function(req,res,next){
	var user_id = req.params.id;
	var ep = new eventproxy();
	ep.fail(next);

	CategorySub.getCategorySubsByUserId(user_id,function(err,categorySubs){
		
		if (err) {
			return next(err);
		}

		if (!categorySubs) {
			return res.send({
				subs: []
			});
		}

		var category_ids = _.pluck(categorySubs,'category_id');

		ep.after('category_ready',category_ids.length,function(categorys){
			res.send({
				subs: categorys
			});
		})

		category_ids.forEach(function(id,i){
			Category.getCategoryById(id,ep.group('category_ready',function(category){
				return category;
			}));
		});
	})

};


exports.sub = function(req,res,next){
	var category_id = req.body.category_id;

	Category.getCategory(category_id, function (err, category) {
		if (err) {
			return next(err);
		}
		if (!category) {
			res.json({status: 'failed'});
		}

		CategorySub.getCategorySub(req.session.user._id, category._id, function (err, doc) {
			if (err) {
			  return next(err);
			}
			if (doc) {
			  res.json({status: 'success'});
			  return;
			}

			CategorySub.newAndSave(req.session.user._id, category._id, function (err) {
				if (err) {
				return next(err);
				}	
				res.json({status: 'success'});
			});
			
			category.sub_count += 1;
			category.save();
		});
	});
};

exports.de_sub = function(req,res,next){
	var category_id = req.body.category_id;
	Category.getCategory(category_id, function (err, category) {
		if (err) {
			return next(err);
		}
		if (!category) {
			res.json({status: 'failed'});
		}

		CategorySub.remove(req.session.user._id, category._id, function (err) {
			if (err) {
			  return next(err);
			}
			res.json({status: 'success'});
		});

		category.sub_count -= 1;
		category.save();
	});
};

/*创建一个新分类*/
exports.create = function(req,res,next){
	// 判断当前分类是否存在
	var title = req.body.title;
	title = validator.escape(title);
	var description = req.body.description;
	description = validator.escape(description);

	var ep = new eventproxy();
  	ep.fail(next);

  	ep.on('prop_err', function (msg) {
		res.status(422);
		res.send({parent:".add_category",error: msg});
	});

	Category.getCategoryByTitle(title,{},function(err,categorys){
		if(err) {
			next(err);
		}

		if(categorys) {
			ep.emit('prop_err',"该分类已经存在");
			return;
		}
		
		Category.newAndSave(title,description,function(err,category){
			if(err){
				return next(err);
			}

			res.send({
				tips: {
					title: "添加成功",
					msg: "恭喜您，已经成功添加分类 " + category.title
				},
				action: "add",
				parent:  "add_category",
				category: category
			});
		})
	});
}

/*删除一个分类*/
exports.delete = function(req,res,next){
	var id = req.params.id;

	var ep = new eventproxy();
	ep.fail(next);


	Category.getCategoryById(id,function(err,category){
		if(err){
			return next(err);
		}

		if(category.knowledge_count > 0){
			var category_id = '555b2ba13064406418358e74';

			Knowledge.getKnowledgesByQuery({category_id: category.id},{},ep.done('move',function(knowledges){
				
				knowledges.forEach(function(knowledge){
					Knowledge.moveToUncate(knowledge._id,category_id,function(err,knowledge){
						return knowledge;
					})
				});

				return knowledges;
			}));

			Category.addKnowledges(category_id,category.knowledge_count,ep.done('add',function(category){
				return category;
			}));

		} else {
			ep.emit('move',null);
			ep.emit('add',null);
		}
	});

	/*
	*  分类删除时，删除订阅表中所有与该分类相关的订阅
	*/

	ep.all('move','add',function(knowledges,uncategory){
		Category.remove(id,ep.done('remove',function(category){
			res.send({
				tips: {
					title: "删除成功",
					msg: "您已经成功删除分类"
				},
				action: "delete",
				category: category
			});
		}));
	})
}

/*修改一个分类*/
exports.update = function(req,res,next){
	var id = req.params.id;
	// 判断当前分类是否存在
	var title = req.body.title;
	title = validator.escape(title);
	var description = req.body.description;
	description = validator.escape(description);

	var ep = new eventproxy();
  	ep.fail(next);

  	ep.on('prop_err', function (msg) {
		res.status(422);
		res.send({parent:".edit_category",error: msg});
	});


	Category.getCategoryByTitle(title,function(err,categorys){
		if(err) {
			next(err);
		}

		if(categorys) {
			Category.getCategoryById(id,function(err,category){
				if(err){
					return next(err);
				}

				if(categorys._id != category.id){
					ep.emit('prop_err',"该分类已经存在");
					return;
				}
			})
		} 

		Category.update(id,title,description,function(err,category){
			if(err){
				return next(err);
			}

			res.send({
				tips: {
					title: "更新成功",
					msg: "您已经成功更新分类 " + category.title
				},
				action: "update",
				parent: ".edit_category",
				category: category
			});
		})

	});
	
}