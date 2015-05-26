var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var CategorySchema = new Schema({
	title: {type: String},
	description: {type: String},
	knowledge_count: {type: Number, default: 0},
	sub_count: {type: Number, default: 0},
	is_default: {type: Boolean, default: false}
});

CategorySchema.index({knowledge_count: -1});
CategorySchema.index({sub_count: -1});

mongoose.model('Category',CategorySchema);

