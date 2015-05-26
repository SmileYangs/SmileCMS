var moment = require('moment');
var crypto = require('crypto');
moment.locale('zh-cn'); // 使用中文

// 格式化时间
exports.formatDate = function (date, friendly) {
	date = moment(date);

	if (friendly) {
		return date.fromNow();
	} else {
		return date.format('YYYY-MM-DD HH:mm');
	}

};

exports.md5 = function(str){
	var md5 = crypto.createHash('md5');
	str = md5.update(str).digest('base64');
	return str;
};