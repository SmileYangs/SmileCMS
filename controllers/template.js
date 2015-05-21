var path = require('path');
var eventproxy = require('eventproxy');

exports.index = function(req,res,next){
	res.send({
		tems: [{
			name: "默认模板",
			id: 1,
			selected: true
		},{
			name: "新模板",
			id: 2,
			selected: false
		}]
	})
}

exports.update = function(req,res,next){
	
}
