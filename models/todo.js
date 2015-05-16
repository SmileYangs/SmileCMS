var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TodoSchema = new Schema({
	content: {type: String},
	done: {type: Boolean, default: false},
	create_at: {type: Date, default: Date.now}
});

TodoSchema.index({create_at: -1});

mongoose.model('Todo',TodoSchema);

