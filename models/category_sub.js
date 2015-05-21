var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var CategorySubSchema = new Schema({
	user_id: { type: ObjectId },
	category_id: { type: ObjectId },
	create_at: { type: Date, default: Date.now }
});

mongoose.model('CategorySub', CategorySubSchema);
