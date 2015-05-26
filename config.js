/*
* config
*/

var path = require('path');

var config = {
	// debug
	debug: true,
	name: 'SmileCMS', // 网站名称
	front_name: '爱百科',
	description: '基于nodejs的简单cms系统',	//网站描述
	keywords: 'nodejs,cms',

	hostname: 'localhost',
	//程序运行端口
	port: 8888,
	SITE_ROOT_URL: "localhost:8888",
	template: "default",
	session_secret: 'SmileCMS_own_secret', //密钥
	auth_cookie_name: 'SmileCMS_own_secret',

	 // 邮箱配置
	mail_opts: {
		host: 'smtp.163.com',
		port: 25,
		auth: {
			user: 'killliuaijj@163.com',
			pass: '617607115'
		}
	},


	// 数据库配置
	db: 'mongodb://127.0.0.1/SmileCMS',
	db_name: 'SmileCMS'
};

module.exports = config;
