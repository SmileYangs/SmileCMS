var express = require('express');
var admin = require('../controllers/admin');
var sign = require('../controllers/sign');
var user = require('../controllers/user');
var category = require('../controllers/category');
var todo = require('../controllers/todo');
var config = require('../config');
var knowledge = require('../controllers/knowledge');
var template = require('../controllers/template');
var router = express.Router();
var auth = require('../middlewares/auth');


var front_template_path = "templates/" + config.template;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render(front_template_path + '/index', { 
  	title: 'iBaike',
  	user: req.session.user,
  	superuser : req.session.superuser
  });
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

/* knowledge controller */
router.get('/admin/knowledge',auth.adminRequired,knowledge.index);
router.post('/admin/knowledge',auth.adminRequired,knowledge.create);
router.put('/admin/knowledge/:id',auth.adminRequired,knowledge.update);
router.delete('/admin/knowledge/:id',auth.adminRequired,knowledge.delete);

/* template controller */

router.get('/admin/template',auth.adminRequired,template.index);
router.put('/admin/template/:id',auth.adminRequired,template.update);

// sign controller
router.post('/signup', sign.signup);  // 提交注册信息
router.post('/signout',sign.signout);  // 登出
router.post('/signin', sign.userLogin);  // 登录校验
router.get('/active_account',sign.active_account);
router.put('/update/:id',auth.userRequired, user.update); 

//前端显示
router.get('/category',category.index);
router.get('/userCategory/:id',category.userCategory),
router.get('/category/knowledge/',knowledge.categoryKnowledge);
router.get('/knowledge/:id', knowledge.showKnowledge);

router.post('/category/sub', auth.userRequired, category.sub); // 关注某话题
router.post('/category/de_sub', auth.userRequired, category.de_sub); // 取消关注某话题

/*router of admin*/
router.get('/admin/login',admin.showLogin);
router.post('/admin/signout',auth.adminRequired,sign.signout);
router.get('/admin',auth.adminRequired,admin.index);
router.get('/admin/index',auth.adminRequired,admin.indexData);

module.exports = router;
