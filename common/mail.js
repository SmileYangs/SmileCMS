var mailer = require('nodemailer');
var config = require('../config');
var util = require('util');

var transport = mailer.createTransport('SMTP', config.mail_opts);

/**
* Send an email
* @param {Object} data 邮件对象
*/

 var sendMail = function(data){
 	transport.sendMail(data,function(err){
 		if(err){
 			console.log(err);
 		}
 	});
 }

 exports.sendMail = sendMail;


 /**
 * 发送激活通知邮件
 * @param {String} who 接收人的邮件地址
 * @param {String} token 重置用的token字符串
 * @param {String} name 接收人的用户名
 */

exports.sendActiveMail = function (who, token, name) {
	var from = util.format('%s <%s>', config.front_name, config.mail_opts.auth.user);
	var to = who;
	var subject = config.front_name + '账号激活';
	var html = '<p>您好：' + name + '</p>' +
	'<p>我们收到您在' + config.front_name + '网站的注册信息，请点击下面的链接来激活帐户：</p>' +
	'<a href="' + config.SITE_ROOT_URL + '/active_account?key=' + token + '&name=' + name + '">激活链接</a>' +
	'<p>若以上链接点击无响应，在浏览器中粘贴以下URL：'+config.SITE_ROOT_URL+'/active_account?key='+token+'&name=' + name+' </p>'+
	'<p>若您没有在' + config.front_name + '社区填写过注册信息，说明有人滥用了您的电子邮箱，请删除此邮件，我们对给您造成的打扰感到抱歉。</p>' +
	'<p>' + config.front_name + '谨上。</p>';

	exports.sendMail({
		from: from,
		to: to,
		subject: subject,
		html: html
	});
};


/**
 * 发送更新通知邮件
 * @param {String} who 接收人的邮件地址
 * @param {String} name 接收人的用户名
 */

exports.sendTipsMail = function (who,category,knowledge_id,username,name) {
	var from = util.format('%s <%s>', config.front_name, config.mail_opts.auth.user);
	var to = who;
	var subject = config.front_name + '更新提醒';
	var html = '<p>您好：' + username + '</p>' +
	'<p>您在' + config.front_name + '网站订阅的 <b>' + category + '</b> 分类的内容更新啦~！：</p>' +
	'<a href="' + config.SITE_ROOT_URL + '/knowledge/' + knowledge_id + '">'+ name +'</a>' +
	'<p>若以上链接点击无响应，请将</p> '+ config.SITE_ROOT_URL + '/knowledge/' + knowledge_id + ' 复制到浏览器的地址栏进行访问</p>' +
	'<p>若您没有在' + config.front_name + '订阅过任何内容，说明有人滥用了您的电子邮箱，请删除此邮件，我们对给您造成的打扰感到抱歉。</p>' +
	'<p>' + config.front_name + '谨上。</p>';

	exports.sendMail({
		from: from,
		to: to,
		subject: subject,
		html: html
	});
};


