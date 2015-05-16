var config = require('../config');

var admin = {
	index: function(req,res){
		res.render('admin/index',{
			"title": config.name,
			"description": config.description,
			"keywords": config.keywords
		});
	}
}



// controllers admin
module.exports = admin;


