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
 	publish: {type: Boolean, default: false}
});

KnowledgeSchema.index({create_at: -1});

mongoose.model('Knowledge', KnowledgeSchema);