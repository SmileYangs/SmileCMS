var validator = require('validator');
var eventproxy = require('eventproxy');
var User = require('../proxy').User;
var utility = require('utility');
var config = require('../config');
var authMiddleWare = require('../middlewares/auth');
var uuid = require('node-uuid');
var crypto = require('crypto');


exports.login = function(req,res,next){
	var username = validator.trim(req.body.name);
	var pass = validator.trim(req.body.pass);
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


// sign out
exports.signout = function (req, res, next) {
  req.session.destroy();
  res.clearCookie(config.auth_cookie_name, { path: '/' });
  res.send({
  	"status": "success"
  })
};
