var express = require('express');
var admin = require('../controllers/admin');
//var admin = require('../controllers/sign');
var user = require('../controllers/user');
var category = require('../controllers/category');
var router = express.Router();
var auth = require('../middlewares/auth');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'SmileCMS' });
});

/* category controller */
router.get('/admin/category',category.index);
router.post('/admin/category',category.create);
router.put('/admin/category/:id',category.update);
router.delete('/admin/category/:id',category.delete);

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
// router.get('/admin',auth.adminRequired,admin.index);
router.get('/admin',admin.index);

/*router of some test*/
router.get('/poptest',function(req,res){
	res.render('components/pop_demo');
});

module.exports = router;
