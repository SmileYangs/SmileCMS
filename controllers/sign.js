var validator = require('validator');
var eventproxy = require('eventproxy');
var User = require('../proxy').User;
var utility = require('utility');
var config = require('../config');
var authMiddleWare = require('../middlewares/auth');
var uuid = require('node-uuid');
var mail = require('../common/mail');
var tools = require('../common/tools');
var crypto = require('crypto');


exports.login = function(req,res,next){
	var username = validator.trim(req.body.username);
	var pass = validator.trim(req.body.password);
	var ep = new eventproxy();
	ep.fail(next);

	if (!username || !pass) {
		res.status(422);
		return res.send({ 
			"error": '信息不完整。' 
		});
	}

	var getUser;
	
	if (username.indexOf('@') !== -1) {
		getUser = User.getUserByMail;
	} else {
		getUser = User.getUserByUsername;
	}

	ep.on('login_error', function (login_error) {
		res.status(403);
		res.send({ 
			"error": '用户名或密码错误'
		});
	});

	getUser(username, function (err, user) {
		if (err) {
			return next(err);
		}
		if (!user) {
			return ep.emit('login_error');
		}

		if(!user.is_star){
			return ep.emit('login_error');
		}

		//生成密码的md5值
		var md5 = crypto.createHash('md5');
		password = md5.update(pass).digest('base64');

		var passhash = user.password;


		if(password === passhash){
			// store session cookie
			authMiddleWare.gen_session(req,user, res);

			res.send({
			  	"status": "success"
			})

		} else {
			return ep.emit('login_error');
		}
	});
}


exports.userLogin = function(req,res,next){
	var username = validator.trim(req.body.username);
	var pass = validator.trim(req.body.password);
	var ep = new eventproxy();
	ep.fail(next);

	if (!username || !pass) {
		res.status(422);
		return res.send({ 
			"error": '信息不完整。' 
		});
	}

	var getUser;
	
	if (username.indexOf('@') !== -1) {
		getUser = User.getUserByMail;
	} else {
		getUser = User.getUserByUsername;
	}

	ep.on('login_error', function (login_error) {
		res.status(403);
		res.send({ 
			"error": '用户名或密码错误'
		});
	});

	getUser(username, function (err, user) {
		if (err) {
			return next(err);
		}
		if (!user) {
			return ep.emit('login_error');
		}

		//生成密码的md5值
		var md5 = crypto.createHash('md5');
		password = md5.update(pass).digest('base64');

		var passhash = user.password;


		var string = user.email + passhash + config.session_secret,
			activeHash = tools.md5(string);

		if(password === passhash){

			if(!user.is_active){
				mail.sendActiveMail(user.email,activeHash,user.username);
				res.status(403);
				return res.send({
					tips: {
						title: user.username+"账号未激活",
						msg: '我们已给您的注册邮箱发送了一封邮件，请点击里面的链接来激活您的帐号。'
					}
				})
			}
			
			// store session cookie
			authMiddleWare.gen_session(req,user, res);

			res.send({
			  	user: user
			})

		} else {
			return ep.emit('login_error');
		}
	});
}



// sign up
exports.signup = function(req,res,next){
	var username = validator.trim(req.body.username);
	var email = validator.trim(req.body.email);
	var pass = validator.trim(req.body.password);
	var rePass = validator.trim(req.body.rep_pass);
	var nickname = "";
	var signature = "";

	var ep = new eventproxy();
  	ep.fail(next);

  	ep.on('prop_err', function (msg) {
		res.status(422);
		res.send({error: msg});
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
		var string = email + password + config.session_secret,
			activeHash = tools.md5(string);

		User.newAndSave(nickname,username,password,email,signature,function(err,user){
			if (err) {
			  return next(err);
			}

			// 发送激活邮件
			mail.sendActiveMail(email, activeHash, username);

			res.send({
				user: user,
				tips: {
					title: "欢迎"+user.username+"加入" + config.front_name,
					msg: '我们已给您的注册邮箱发送了一封邮件，请点击里面的链接来激活您的帐号。'
				}
			});
		})


	})	
}


exports.active_account = function (req, res, next) {
	var key = validator.trim(req.query.key);
	var name = validator.trim(req.query.name);

	User.getUserByUsername(name, function (err, user) {
		if (err) {
		  return next(err);
		}
		if (!user) {
		  return next(new Error('[ACTIVE_ACCOUNT] no such user: ' + name));
		}

		var passhash = user.password;

		if (!user || tools.md5(user.email + passhash + config.session_secret) !== key) {
			return res.render('notify', {
				error: '信息有误，帐号无法被激活。',
				success: false
			});
		}
		if (user.is_active) {
			return res.render('notify', {
				error: '帐号已经是激活状态。请去登录',
				success: false
			});
		}

		user.is_active = true;

		user.save(function (err) {
			if (err) {
				return next(err);
			}
			res.render('notify', {
				success: '帐号已被激活，请去登录',
				error: false
			});
		});
	});
};

// sign out
exports.signout = function (req, res, next) {
  req.session.destroy();
  res.clearCookie(config.auth_cookie_name, { path: '/' });
  
  res.send({
  	"status": "success"
  })
};