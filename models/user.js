var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var utility = require('utility');
var UserSchema = new Schema({
	name: { type: String},
	loginname: { type: String},
	pass: { type: String },
	email: { type: String},
	profile_image_url: {type: String},
	location: { type: String },
	signature: { type: String },
	profile: { type: String },
	avatar: { type: String },
	is_block: {type: Boolean, default: false},

	create_at: { type: Date, default: Date.now },
	update_at: { type: Date, default: Date.now },
	is_star: { type: Boolean },
	level: { type: String },
	active: { type: Boolean, default: false },
});

UserSchema.virtual('avatar_url').get(function () {
  var url = this.avatar || ('//www.gravatar.com/avatar/' + utility.md5(this.email.toLowerCase()) + '?size=48');
  // 让协议自适应
  if (url.indexOf('http:') === 0) {
    url = url.slice(5);
  }
  
  return url;
});

UserSchema.index({loginname: 1}, {unique: true});
UserSchema.index({email: 1}, {unique: true});

mongoose.model('User', UserSchema);
