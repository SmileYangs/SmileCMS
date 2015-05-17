var express = require('express');
var admin = require('../controllers/admin');
var sign = require('../controllers/sign');
var user = require('../controllers/user');
var category = require('../controllers/category');
var todo = require('../controllers/todo');
var router = express.Router();
var auth = require('../middlewares/auth');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'SmileCMS' });
});

/* category controller */
router.get('/admin/category',auth.adminRequired,category.index);
router.post('/admin/category',auth.adminRequired,category.create);
router.put('/admin/category/:id',auth.adminRequired,category.update);
router.delete('/admin/category/:id',auth.adminRequired,category.delete);


/* todos controller */
router.get('/admin/index/todo',auth.adminRequired,todo.index);
router.post('/admin/index/todo',auth.adminRequired,todo.create);
router.put('/admin/index/todo/:id',auth.adminRequired,todo.update);
router.delete('/admin/index/todo/:id',auth.adminRequired,todo.delete);

/* user controller */
router.get('/admin/user',auth.adminRequired,user.index);
router.post('/admin/user',auth.adminRequired,user.create);
router.put('/admin/user/:id',auth.adminRequired,user.update);
router.delete('/admin/user/:id',auth.adminRequired,user.delete);

// sign controller
// if (config.allow_sign_up) {
//   router.get('/signup', sign.showSignup);  // 跳转到注册页面
//   router.post('/signup', sign.signup);  // 提交注册信息
// } else {
//   router.get('/signup', configMiddleware.github, passport.authenticate('github'));  // 进行github验证
// }
// router.post('/signout', sign.signout);  // 登出
// router.get('/signin', sign.showLogin);  // 进入登录页面
router.post('/signin', sign.login);  // 登录校验


/*router of admin*/
router.get('/admin/login',admin.showLogin);
router.post('/admin/loginout',auth.adminRequired,sign.signout);
router.get('/admin',auth.adminRequired,admin.index);
//router.get('/admin',admin.index);

/*router of some test*/
router.get('/poptest',function(req,res){
	res.render('components/pop_demo');
});

module.exports = router;
