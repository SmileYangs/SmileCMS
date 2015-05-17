var User = require('../proxy').User;
var eventproxy = require('eventproxy');
var validator = require('validator');
var utility = require('utility');
var crypto = require('crypto');
var _ = require('lodash');


exports.index = function(req, res, next){
	// 获取所有的用户
	User.getUsersByQuery({},{},function(err,users){
		if(err){
			next(err);
		}

		res.send({
			users: users
		})
	})
}

exports.create = function(req, res, next){
	var username = validator.trim(req.body.username);
	var email = validator.trim(req.body.email);
	var nickname = validator.trim(req.body.nickname);
	var signature = validator.trim(req.body.signature);
	var pass = validator.trim(req.body.password);
	var rePass = validator.trim(req.body.rep_pass);

	var ep = new eventproxy();
  	ep.fail(next);

  	ep.on('prop_err', function (msg) {
		res.status(422);
		res.send({parent:".add_user",error: msg, username: username, email: email});
	});

	User.getUsersByQuery({'$or': [
	  {'username': username},
	  {'email': email}
	]},{},function(err, users){
		if (err) {
		  return next(err);
		}
		if (users.length > 0) {
		  ep.emit('prop_err', '用户名或邮箱已被使用。');
		  return;
		}

		//生成密码的md5值
		var md5 = crypto.createHash('md5');
		password = md5.update(pass).digest('base64');

		User.newAndSave(nickname,username,password,email,signature,function(err,user){
			if (err) {
			  return next(err);
			}



			res.send({
				tips: {
					title: "添加成功",
					msg: "恭喜您，已经成功添加用户" + user.username
				},
				action: "add",
				user: user
			});
		})


	})	
}

exports.update = function(req, res, next){
	var id = req.params.id;

	var username = validator.trim(req.body.username);
	var email = validator.trim(req.body.email);
	var nickname = validator.trim(req.body.nickname);
	var signature = validator.trim(req.body.signature);

	var ep = new eventproxy();
  	ep.fail(next);

  	ep.on('prop_err', function (msg) {
		res.status(422);
		res.send({parent:".edit_user",error: msg, username: username, email: email});
	});

	User.getUsersByQuery({'$or': [
	  {'username': username},
	  {'email': email}
	]},{},function(err, users){
		if (err) {
		  return next(err);
		}

		if (users.length > 0) {

			User.getUserById(id,function(err,user){
				if(err){
					return next(err);
				}

				if(users[0]._id != user.id){
					ep.emit('prop_err', '用户名或邮箱已被使用。');
					return;
				}

			});
		}

		User.update(id,nickname, username, email, signature,function(err,user){
			console.log(err);
			if(err){
				return next(err);
			}

			res.send({
				tips: {
					title: "修改成功",
					msg: "您已经成功修改用户" + user.username
				},
				action: "update",
				user: user
			});
		})
	});

	
}

exports.delete = function(req, res, next){
	var id = req.params.id;
	User.getUserById(id,function(err,user){
		if(err){
			return next(err);
		}

		User.remove(id,function(){
			res.send({
				tips: {
					title: "删除成功",
					msg: "您已经成功删除用户" + user.username
				},
				action: "delete",
				user: user
			});
		});
	})
}