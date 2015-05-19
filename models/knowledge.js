var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var KnowledgeSchema = new Schema({
	title: {type: String},
	content: {type: String},
	hot: {type: Boolean, default: false},
	visit_count: {type: Number, default: 0},
	create_at: {type: Date, default: Date.now },
 	update_at: {type: Date, default: Date.now },
 	category_id: {type: ObjectId},
 	last_reply: { type: ObjectId },
  	last_reply_at: { type: Date, default: Date.now },
 	collect_count: {type: Number, default: 0},
 	publish: {type: Boolean, default: false}
});

KnowledgeSchema.index({create_at: -1});
KnowledgeSchema.index({hot: -1, last_reply_at: -1});
KnowledgeSchema.index({last_reply_at: -1});


mongoose.model('Knowledge', KnowledgeSchema);