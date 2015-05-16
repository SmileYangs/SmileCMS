var validator = require('validator');
var eventproxy = require('eventproxy');
var Category = require('../proxy').Category;
var _ = require('lodash');

exports.index = function(req, res, next) {
	var page = parseInt(req.query.page, 10) || 1;
  	page = page > 0 ? page : 1;

  	var proxy = new eventproxy();
  	proxy.fail(next);

  	var query = {};
  	var limit = 20;
  	var options = { skip: (page - 1) * limit, limit: limit, sort: '-sub_count'};
	
	Category.getCategoryByQuery(query,options,proxy.done('categorys',function(categorys){
		return categorys;
	}));

	Category.getCountByQuery(query, proxy.done(function(all_categorys_count){
		var pages = Math.ceil(all_categorys_count / limit);
		proxy.emit('pages', pages);
	}));

	proxy.all("categorys","pages",function(categorys,pages){

		var success = categorys.length > 0 ? true : false;
		
		res.send({
			categorys: categorys,
			pages: pages,
			current_page: page,
			success: success
		});
	})
};

/*创建一个新分类*/
exports.create = function(req,res,next){
	// 判断当前分类是否存在
	var title = req.body.title;
	title = validator.escape(title);
	var description = req.body.description;
	description = validator.escape(description);


	Category.getCategoryByTitle(title,{},function(err,categorys){
		if(err) {
			return res.status(500).send({err: "系统错误"});
		}
		if(categorys && categorys.length > 0) {
			return res.status(500).send({err: "该分类已经存在"});
		}
		console.log(categorys);
		Category.newAndSave(title,description,function(err,category){
			if(err){
				return next(err);
			}

			res.send(category);
		})
	});
}

/*删除一个分类*/
exports.delete = function(req,res,next){
	var id = req.params.id;
	Category.getCategoryById(id,function(err,category){
		if(err){
			return next(err);
		}

		Category.remove(id,function(){
			res.status(200).send({msg:"删除成功"})
		})
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

	Category.update(id,title,description,function(){
		res.status(200).send({msg:"更新成功"})
	})
}