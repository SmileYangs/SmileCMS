$(function(){
	var url = "http://localhost:8888/";

	var IndexView = Backbone.View.extend({
		el: "#index-con",
		template: $("#sub-item-template").template(),
		initialize: function(){
			var self = this;
			// 判断用户是否已经登录，登录后获取用户的订阅
			if(User.isLogined(false)){
				$.ajax({
					url: url + "userCategory/" + User.get('_id'),
					type: "get",
					error: function(err){

					},
					success: function(res){
						var data = {};

						data.has_sub = res.subs.length ? true : false;
						data.categorys = res.subs;

						self.render(data);
					}
				})
			}
		},
		render: function(data){
			this.$el.html($.tmpl(this.template,data));
		}
	});

	var IndexConView = Backbone.View.extend({
		el: "#main-con",
		template: $('#index-template').template(),
		render: function(){
			this.$el.html($.tmpl(this.template));
		}
	})

	var HotView = Backbone.View.extend({
		el: "#mail-con"
	});
	
	/*
	* 分类管理
	*/
	var CategoryModel = Backbone.Model.extend({
		urlRoot: url + "category",
		defaults: {
			is_sub: false
		},
		parse: function(data){
			data.id = data._id;
			return data;
		},
		toggle: function(){
			this.set({is_sub: !this.get("is_sub")});
		}
	});

    var CategoryList = Backbone.Collection.extend({
    	url: url + "category",
    	model: CategoryModel,
    	parse: function(data) {
    		var categorys = data.categorys;

    		categorys = _.filter(categorys,function(cate){
    			return !cate.is_default;
    		})

		   	return categorys;
		}
    });

    var CategoryView = Backbone.View.extend({
    	tagName: "div",
    	template: $("#category-item-template").template(),
    	events: {
    		"click #doSUb"	: "sub",
    		"click #dodeSUb": "dodeSUb"
    	},
    	initialize: function(){
    		this.model.bind("change",this.render,this);
    	},
    	sub: function(e){
    		var self = this;
    		e.preventDefault();
    		var islogin = User.isLogined(true,false);

    		if(islogin){
    			var category_id = self.$('.category').attr('data-id');

    			$.ajax({
    				url: url+ "category/sub",
    				type: "post",
    				data: {
    					category_id: category_id
    				},
    				error: function(err){

    				},
    				success: function(res){
    					self.model.toggle();
    				}
    			})
    		}
    			
    	},

    	dodeSUb: function(e){
    		var self = this;
    		e.preventDefault();
    		var category_id = self.$('.category').attr('data-id');

    		$.ajax({
    			url: url+ "category/de_sub",
    			type: "post",
    			data: {
    				category_id: category_id
    			},
    			error: function(err){

    			},
    			success: function(res){
    				self.model.toggle();
    			}
    		})
    	},

    	render: function(){
    		this.$el.attr("class","col-md-4 category-con");
    		this.$el.html($.tmpl(this.template,this.model.toJSON()));
    		return this;
    	}
    });

	var CategoryListView = Backbone.View.extend({
		el: "#main-con",

		initialize: function(){
			_.bindAll(this, 'addOne', 'addAll', 'render');

			Categorys.bind('add',this.addOne);
			Categorys.bind('reset',this.addAll);
			
			Categorys.fetch({
				reset: true
			});

		},

		addOne: function(category){
			var view = new CategoryView({model: category});
			this.$el.append(view.render().el);
		},

		addAll: function(){
			this.$el.html("");
			Categorys.each(this.addOne);
		}
	});

	var UserModel = Backbone.Model.extend({
		urlRoot: url,
		defaults: {
			user_id: null,
			username: null,
			password: null
		},
		isLogined: function(toggle,toRegister){
			try{
				if(!this.get('username'))
					throw ('not Login');
				else
					return true;
			}catch(e){
				if(toggle){
					if(!toRegister){
						DialogState.login();
					} else {
						DialogState.register();
					}
				}
				return false;
			}
		},

		initialize: function(){
			if(!this.get('newCheck')){
				var user = $.cookie('user_info');
				if(user){
					var data = $.parseJSON(user);
					this.set(data);
				}
			}
		},

		validate : function(attr,option){
			for(k in attr){
				var name = "";
				switch(k){
					case "username" : name = "用户名"; break;
					case "password" : name = "密码"; break;
					case "rep_pass" : name = "确认密码"; break;
					case "email" : name = "邮箱"; break;
				}
				if((k == "rep_pass" || k == "username" || k == "password" || k == "email") && attr[k] == ""){
					return name + "不能为空";
				} else if(k == "username" && attr[k] != null && !attr[k].match(/^(\w){1,16}$/)){
					return name + "不符合规范";
				} else if(k == "rep_pass" && attr[k] != null && !(attr[k] == attr['password'])){
					return "两次输入的密码不一致";
				}  
			}
		}
	});

	/*
	*	公共部分
	*/
	var MenuModel = Backbone.Model.extend({
		defaults:{
			current: "index"
		},
		initialize: function(){
			this.on("change:current",function(model,current){
				$('#headNav').find('li').removeClass('active');
				$('#headNav').find('li[data-nav='+current+']').addClass('active');
			})
		},

	});

	// 状态机
	var DialogState = StateMachine.create({
		events: [
			{name: "login",from: "*",to: "*"},
			{name: "register",from: "*",to: "*"},
			{name: "hideUpdate",from: "*",to: "*"},
			{name: "hideRegister",from: "*",to: "*"},
			{name: "hideLogin",from: "*",to: "*"},
			{name: "tips",from: "*",to: "*"}
		],
		callbacks:{
			onlogin: function(){
				$('#loginModal').modal('show');
			},
			onregister: function(){
				$('#registerModal').modal('show');
			},
			onhideUpdate: function(){
				$('#updateModal').modal('hide');
			},
			onhideRegister: function(){
				$('#registerModal').modal('hide');
			},
			onhideLogin: function(){
				$('#loginModal').modal('hide');
			},
			ontips: function(a,b,c,data){
				var template = $("#modal-tips-template").template();
				$("#action-tips").html($.tmpl(template,data));
				$('#tipModal').modal('show');
			},
		}
	});

	var ModelView = Backbone.View.extend({
		el: "#model-ph",
		template: $("#modal-template").template(),
		events: {
			"click #user-signin"	: "signin",
			"submit #login"			: "signin",
			"click #user-signiup"	: "signup",
			"submit #reg"			: "signup",
			"click #user-update"	: "update",
			"submit #update"		: "update"		
		},
		signin: function(e){
			e.preventDefault();

			var attr = {
				username: $('#login #username').val(),
				password: $('#login #password').val()
			}

			var user = new UserModel(attr);
			if(!user.isValid()){
				$("#login .error").html(user.validationError).css({
					display : "block"
				});
				return false;
			}

			$.ajax({
				type: "post",
				url: url + "signin",
				data: attr,
				dataType: 'json',
				error: function(err){
					err = $.parseJSON(err.responseText);
					if(err.tips){
						DialogState.hideLogin();
						DialogState.tips(err.tips);
					} else {
						
						$("#login .error").html(err.error).css({
							display : "block"
						});
					}		
				},
				success: function(res){
					$.cookie('user_info', JSON.stringify(res.user), { expires: 30 });
					window.location.href = '/';
				}
			});
		},

		signup: function(e){
			e.preventDefault();

			var attr = {
				username: $('#reg #username').val(),
				password: $('#reg #password').val(),
				email: $('#reg #email').val(),
				rep_pass: $('#reg #password-repeat').val()
			}

			var user = new UserModel(attr);
			if(!user.isValid()){
				$("#reg .error").html(user.validationError).css({
					display : "block"
				});
				return false;
			}

			$.ajax({
				type: "post",
				url: url + "signup",
				data: attr,
				dataType: 'json',
				error: function(err){
					err = $.parseJSON(err.responseText);
					$("#reg .error").html(err.error).css({
						display : "block"
					});
				},
				success: function(res){
					// $.cookie('user_info', JSON.stringify(res.user), { expires: 30 });
					// window.location.href = '/';
					DialogState.hideRegister();
					DialogState.tips(res.tips);
				}
			});
		},

		update: function(e){
			e.preventDefault();

			var attr = {
				nickname: $('#update #nickname').val(),
				email: $('#update #email').val(),
				signature: $('#update #signature').val(),
				username: User.get('username'),
				newCheck: true
			}

			console.log(attr);
			var user = new UserModel(attr);
			if(!user.isValid()){
				console.log('aaa');
				$("#update .error").html(user.validationError).css({
					display : "block"
				});
				return false;
			}

			$.ajax({
				type: "put",
				url: url + "update/" + User.get('_id'),
				data: attr,
				dataType: 'json',
				error: function(err){
					err = $.parseJSON(err.responseText);
					$("#update .error").html(err.msg).css({
						display : "block"
					});
				},
				success: function(res){
					User.set(res.user);
					DialogState.hideUpdate();
					DialogState.tips(res.tips);	
					$.cookie('user_info', JSON.stringify(res.user), { expires: 30 });
					
				}
			});
		},

		render: function(){
			this.$el.html($.tmpl(this.template));

			if(User.get("username") != ""){
				var user = User.toJSON();
				$("#update #email").val(user.email);
				$("#update #nickname").val(user.nickname);
				$("#update #signature").val(user.signature);
			}

			$("#loginModal,#registerModal").on('show.bs.modal',function(e){
				$(this).find(".error").css({
					display : "none"
				});
				$(this).find("input").val('');
			});

			$("#updateModal").on('show.bs.modal',function(e){
				$(this).find(".error").css({
					display : "none"
				});

				if(User.get("username") != ""){
					var user = User.toJSON();
					$("#update #email").val(user.email);
					$("#update #nickname").val(user.nickname);
					$("#update #signature").val(user.signature);
				}
			});
		},

		initialize: function(){
			this.render();
		}
	})

	var HeadView = Backbone.View.extend({
		el: "#inews-nav",
		template: $("#user-info-template").template(),
		events: {
			"click #headNav li"		: "toggleNav",
			"click .poweroff"		: "loginOut"
		},

		toggleNav: function(e){
			var current = $(e.currentTarget).attr('data-nav');
			ARouter.navigate(current,{trigger: true});
		},

		render: function(e){
			this.$('.dropdown').html($.tmpl(this.template,User.toJSON()));
		},

		initialize: function(e){
			User.bind('all',this.render,this);
			this.render();
		},

		loginOut: function(e){
			$.ajax({
				url: url + 'signout',
				type: "post",

				success: function(){
					$.removeCookie('user_info');
					window.location.href = url;
				}
			})
		},
	})

	var FrontRouter = Backbone.Router.extend({
		routes: {
			"index" 			: "index",
			"hot"				: "hot",
			"sub"				: "sub"
		},

		initialize: function(){
			window.Menu = new MenuModel();
			window.User = new UserModel();
			window.Categorys = new CategoryList();

			new HeadView();
			new ModelView();

			this.indexControl = new IndexConView();
		},

		index: function(){
			var self = this;
			Menu.set({current: 'index'});
			self.indexControl.render();

			new IndexView();
		},
		hot: function()	{
			Menu.set({current: 'hot'});
		},
		sub: function(){
			Menu.set({current: 'sub'});

			new CategoryListView();
		}
	});

	var ARouter = new FrontRouter();
	Backbone.history.start({pushState: false});

	var app = {
		start: function(){
			ARouter.navigate('index',{trigger: true}); 
		}
	}

	app.start();
})