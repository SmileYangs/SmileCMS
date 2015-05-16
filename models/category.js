var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var CategorySchema = new Schema({
	title: {type: String},
	description: {type: String},
	sub_count: {type: Number, default: 0},
	knowledge_count: {type: Number, default: 0}
});

CategorySchema.index({knowledge_count: -1});
CategorySchema.index({sub_count: -1});

mongoose.model('Category',CategorySchema);

