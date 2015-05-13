var express = require('express');
var admin = require('../controllers/admin');
//var admin = require('../controllers/sign');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'SmileCMS' });
});

// sign controller
// if (config.allow_sign_up) {
//   router.get('/signup', sign.showSignup);  // 跳转到注册页面
//   router.post('/signup', sign.signup);  // 提交注册信息
// } else {
//   router.get('/signup', configMiddleware.github, passport.authenticate('github'));  // 进行github验证
// }
// router.post('/signout', sign.signout);  // 登出
// router.get('/signin', sign.showLogin);  // 进入登录页面
// router.post('/signin', sign.login);  // 登录校验


/*router of admin*/
router.get('/admin',admin.index);

/* GET users listing. */
router.get('/users', function(req, res, next) {
  res.send('respond with a resource  one router');
});


module.exports = router;
