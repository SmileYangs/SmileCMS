$.fn.extend({
	formToJson:function(){
					function convertArray(o) {
						var v = {}; 
						for (var i in o) { 
							if (typeof (v[o[i].name]) == 'undefined') v[o[i].name] = $.trim(o[i].value); 
								else v[o[i].name] += "," + $.trim	(o[i].value); 
						} 
						return v; 
					};
					return convertArray(this.serializeArray());
				},
	formToObject:function(){
		var o = {};
	    var a = this.serializeArray();
	    $.each(a, function() {
	        if (o[this.name] !== undefined) {
	            if (!o[this.name].push) {
	                o[this.name] = [o[this.name]];
	            }
	            o[this.name].push(this.value || '');
	        } else {
	            o[this.name] = this.value || '';
	        }
	    });
	    return o;
	},
	center : function(){
				this.each(function(){
					var recenter=  function(){
						ele = $(this);
						width = ($(window).width() - ele.width())/2;
						height = ($(window).height() - ele.height())/2;
						ele.css({left:width,top:height,"z-index":99})
					}
					$.proxy(recenter,this)();
					$(window).resize(
						$.proxy(recenter,this)
					);
				})
				return this;
			},
	require:function(){
		var ipts = $(this).parents("form").find(".require");
		var ipts2 = $(this).parents("form").find(".validate");
		var flag = 1;
		function validate(){
			var value = $(this).val();
			if($(this).hasClass("number")){
				if(!value.match(/^\d*$/)){
					flag = 0;
					$(this).css("border-color","#f00");
				}else{
					$(this).css("border-color","#ccc");		
				}
			}else if($(this).hasClass("mail")){
				if(!value.match(/^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/)){
					flag = 0;
					$(this).css("border-color","#f00");
				}else{
					$(this).css("border-color","#ccc");		
				}
			}else if($(this).hasClass("phone")){
				if(!value.match(/^(13[0-9]|15[0|1|2|3|5|6|7|8|9]|18[0|2|3|6|7|8|9])\d{8}$/)){
					flag = 0;
					$(this).css("border-color","#f00");
				}else{
					$(this).css("border-color","#ccc");		
				}
			}else{
				$(this).css("border-color","#ccc");	
			}
		}
		ipts.each(function(){
			if(!$(this).val()){
				$(this).css("border-color","#f00");
				flag = 0;
			}else{
				$.proxy(validate,this)();
			}
		});
		ipts2.each(function(){
			if($(this).val()){
				$.proxy(validate,this)();
			}
		});
		return flag;
		
	},
	tabs:function(){
		var li = $("li",$(this).find(".tab"));
		var content = $(this).children("div");
		li.click(function(e){
			li.removeClass("selected");
			$(this).addClass("selected");
			var c = $(this).attr("class").match(/\d/);
			content.removeClass("current").filter(".content-"+c).addClass("current");
			$("input,textarea").queue(function a(){$(this).placeholder();$(this).dequeue()});
		});
	}
})
$.extend({
	date : function(){
		function checkTime(i){
			if (i<10) 
			  {i="0" + i}
			  return i
		}
		var date = new Date(); //日期对象
		var now = "";
		now = date.getFullYear()+"-"; //读英文就行了
		now = now + checkTime(date.getMonth()+1)+"-";//取月的时候取的是当前月-1如果想取当前月+1就可以了
		now = now + checkTime(date.getDate())+" ";
		now = now + checkTime(date.getHours())+":";
		now = now + checkTime(date.getMinutes())+":";
		now = now + checkTime(date.getSeconds())+"";
		return now;
	},
	date2 : function(day){
		function checkTime(i){
			if (i<10) 
			  {i="0" + i}
			  return i
		}
		var date = new Date(); //日期对象
		var now = "";
		now = date.getFullYear()+"-"; //读英文就行了
		now = now + checkTime(date.getMonth()+1)+"-";//取月的时候取的是当前月-1如果想取当前月+1就可以了
		now = now + checkTime(date.getDate()-(day||0));
		return now;
	},
	datePicker:function(from,to){
		var dates = $( "#"+from+",#"+to ).datepicker({
			defaultDate: "+1w",
			changeMonth: true,
			dateFormat:"yy-mm-dd",
			onSelect: function( selectedDate ) {
				var option = this.id == from ? "minDate" : "maxDate",
					instance = $( this ).data( "datepicker" ),
					date = $.datepicker.parseDate(
						instance.settings.dateFormat ||
						$.datepicker._defaults.dateFormat,
						selectedDate, instance.settings );
				dates.not( this ).datepicker( "option", option, date );
			}
		});
	}
});
//map
var googleMap = function(id){
    var latlng = new google.maps.LatLng(-34.397, 150.644);
    var myOptions = {
      zoom: 8,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById(id),
        myOptions);
}
function downloadJS(url,callback) {
    var elem = document.createElement("script");
    elem.onload = callback;
    elem.src = url;
    document.body.appendChild(elem);
};
//template
function strLimit($string,$limit){
	if(typeof $string !=="string")$string = "";
	if($string.length > $limit){
		return $string.substring(0,$limit)+'...';
	}else{
		return $string;
	}
};
function printPages(total,limit,current){
	var page = "";
	var step = Math.round(total/limit);
	for(var i = 1;i<=step;i++){
		page+=$('<a>');
	}
	return page;
}
