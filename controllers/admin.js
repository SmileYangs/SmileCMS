var config = require('../config');
var User = require('../proxy').User;
var Knowledge = require('../proxy').Knowledge;
var Category = require('../proxy').Category;
var Todo = require('../proxy').Todo;
var eventproxy = require('eventproxy');


var admin = {
	index: function(req,res){
		res.render('admin/index',{
			"title": config.name,
			"description": config.description,
			"keywords": config.keywords
		});
	},

	showLogin: function(req,res){
		res.render('sign/sign_in', {
			"error": "",
			"title": config.name,
			"description": config.description,
			"keywords": config.keywords
		});
	},

	indexData: function(req,res,next){
		var ep = new eventproxy();
		ep.fail(next);

		Knowledge.getCountByQuery({},ep.done('countKnowledge',function(count){
			return count;
		}));

		Knowledge.getCountByQuery({hot:true},ep.done('countHotKnowledge',function(count){
			return count;
		}));

		Category.getCountByQuery({},ep.done('countCategory',function(count){
			return count;
		}));

		Todo.getCountByQuery({},ep.done('countTodo',function(count){
			return count;
		}));

		Todo.getCountByQuery({done:true},ep.done('countDoneTodo',function(count){
			return count;
		}));

		User.getCountByQuery({},ep.done('countUser',function(count){
			return count;
		}));

		User.getCountByQuery({is_active:true},ep.done('countHotUser',function(count){
			return count;
		}));

		ep.all('countUser','countHotUser','countTodo','countDoneTodo','countCategory','countKnowledge','countHotKnowledge',
			function(user,huser,todo,dtodo,category,knowledge,hknowledge){
				res.send({
					user: {
						total: user,
						hot: huser
					},
					todo: {
						total: todo,
						done: dtodo
					},
					category: {
						total: category
					},
					knowledge: {
						total: knowledge,
						hot: hknowledge
					}
				})
			})
	}
}



// controllers admin
module.exports = admin;

