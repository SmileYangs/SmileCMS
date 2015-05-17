var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	nickname: { type: String},
	username: { type: String},
	password: { type: String },
	email: { type: String},
	signature: { type: String },

	create_at: { type: Date, default: Date.now },
	is_star: { type: Boolean, default: false},
	is_active: { type: Boolean, default: false}
});

UserSchema.index({username: 1}, {unique: true});
UserSchema.index({email: 1}, {unique: true});

mongoose.model('User', UserSchema);
