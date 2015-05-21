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

	if(req.session.user){
		// 查询用户的订阅
		CategorySub.getCategorySubsByUserId(req.session.user._id,function(err,docs){
			console.log(docs);
		})
	} else {

	}

	proxy.all("categorys",function(categorys){
		res.send({
			categorys: categorys
		});
	})
};


exports.sub = function(req,res,next){
	
};

exports.de_sub = function(req,res,next){

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