var EventProxy = require('eventproxy');

var models = require('../models');
var Knowledge = models.Knowledge;
var _ = require('lodash');



/*新建并保存知识*/
exports.newAndSave = function(title, content, category_ids, callback){
	var knowledge = new Knowledge();
	knowledge.title = title;
	knowledge.content = content;
	knowledge.category_ids = category_ids;
	knowledge.save(callback);
}