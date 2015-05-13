/*
* config
*/

var path = require('path');

var config = {
	// debug
	debug: true,
	name: 'SmileCMS', // 网站名称
	description: '基于nodejs的简单cms系统',	//网站描述
	keywords: 'nodejs',

	hostname: 'localhost',
	//程序运行端口
	port: 3333,

	session_secret: 'SmileCMS_own_secret', //密钥

	// 文件上传配置
	upload: {
		path: path.join(__dirname, 'public/upload'),
		url: '/public/upload/'
	},


	// 数据库配置
	db: 'mongodb://127.0.0.1/SmileCMS',
	db_name: 'SmileCMS'
};

module.exports = config;
