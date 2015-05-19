var eventproxy = require('eventproxy');

var models = require('../models');
var Knowledge = models.Knowledge;
var Category = require('./category');
var tools = require('../common/tools');
var _ = require('lodash');


exports.getKnowledgeById = function (id, callback) {
	var proxy = new eventproxy();
	var events = ['knowledge', 'category'];
	proxy.assign(events, function (knowledge, category) {
		if (!category) {
			return callback(null, null, null);
		}
		return callback(null, knowledge, category);
	}).fail(callback);

	Knowledge.findOne({_id: id}, proxy.done(function (knowledge) {
		if (!knowledge) {
			proxy.emit('knowledge', null);
			proxy.emit('category', null);
			return;
		}
		proxy.emit('knowledge', knowledge);
		Category.getCategoryById(knowledge.category_id, proxy.done('category'));
	}));
};

exports.getKnowById = function (id, callback) {
	Knowledge.findOne({_id: id},callback);
};

exports.getKnowledgesByQuery = function (query, opt, callback) {
 	Knowledge.find(query, '_id', opt, function(err,knowledges){
 	 	if (err) {
 	 		return callback(err);
 	 	}

 	 	if (knowledges.length === 0) {
 	 	 	return callback([]);
 	 	}

 	 	var knowledges_id = _.pluck(knowledges,'id');

  		var getTitle = new eventproxy();
  		getTitle.fail(callback);

  		getTitle.after('category_title',knowledges_id.length,function(knowledges){
  			return callback(null,knowledges);
  	  	});

  	  	knowledges_id.forEach(function (id, i) {
			exports.getKnowledgeById(id, getTitle.group('category_title', function (knowledge,category) {
				
				if (knowledge) {
					knowledge = knowledge.toObject();

					knowledge.category = category;
					knowledge.friendly_create_at = tools.formatDate(knowledge.create_at, true);
				}
				return knowledge;
			}));
  	  	});
 	});
};


exports.remove = function(id,callback){
	Knowledge.remove({_id:id},callback);
}


/*新建并保存知识*/
exports.newAndSave = function(title, content, category_id, publish, callback){
	var knowledge = new Knowledge();
	knowledge.title = title;
	knowledge.content = content;
	knowledge.category_id = category_id;

	if(publish){
		knowledge.publish = publish;
	}
	
	knowledge.save(callback);
}