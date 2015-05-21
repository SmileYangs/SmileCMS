$(function(){
	var url = "http://localhost:8888/";



	var IndexView = Backbone.View.extend({
	});

	/*
	* 分类管理
	*/
	var CategoryModel = Backbone.Model.extend({
		urlRoot: url + "category",
		parse: function(data){
			data.id = data._id;
			return data;
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
			DialogState.exit();
			this.$el.html("");
			Categorys.each(this.addOne);
		}
	});

	var UserModel = Backbone.Model.extend({
		urlRoot: url,
		defaults: {
			username: null,
			password: null
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
			{name: "addCategory",from: "*",to: "*"},
			{name: "editCategory",from: "*",to: "*"},
			{name: "addUser",from: "*",to: "*"},
			{name: "addKnowledge",from: "*",to: "*"},
			{name: "editKnowledge",from: "*",to: "*"},
			{name: "tips",from:"",to:""},
			{name: "editUser",from: "*",to: "*"},
			{name: "exit",from: "*",to: "*"}
		],
		callbacks:{
			onaddCategory: function(){
				$(".add_category .error").empty().hide();
				$(".add_category input,.add_category textarea").val('');

    			$(".add_category").center().show();
			},
			oneditCategory: function(a,b,c,data){
				$(".edit_category .error").empty().hide();
				$(".edit_category").attr('data_id',data.id);
				$("#edit_category_title").val(data.title);
				$("#edit_category_desc").val(data.description);
    			$(".edit_category").center().show();
			},
			onaddKnowledge: function(){
				$(".add_knowledge .error").empty().hide();
				$(".add_knowledge input").val('');
    			$(".add_knowledge").center().show();
			},
			oneditKnowledge: function(a,b,c,data){
				$(".edit_knowledge .error").empty().hide();
				$(".edit_knowledge").attr({
					'data_id': data.id,
					'data_publish': data.publish
				});

				$("#edit_category_select").val(data.category_id);
				$("#edit_knowledge_title").val(data.title);
				$("#edit_knowledge_content").val(data.content);

    			$(".edit_knowledge").center().show();
			},
			onaddUser: function(){
				$(".add_user .error").empty().hide();
				$(".add_user input").val('');

    			$(".add_user").center().show();
			},
			oneditUser: function(a,b,c,data){
				$(".edit_user .error").empty().hide();
				$(".edit_user").attr('data_id',data.id);
				$("#edit_username").val(data.username);
				$("#edit_user_email").val(data.email);
				$("#edit_user_nick").val(data.nickname);
				$("#edit_user_sign").val(data.signature);

    			$(".edit_user").center().show();
			},
			ontips: function(a,b,c,data){
				var template = $("#dialog-tips-template").template();
				$(".action-tips").html($.tmpl(template,data)).center().show();
			},
			onexit: function(e){
				$(".dialog_bg").hide();
				$(".dialog").hide(function(){
					$(this).find('input').val("");
					$(this).find('textarea').val("");
				});
			},
			onenter: function(){
				$(".dialog_bg").show();
			},
    		onbefore: function(){
    			$(".dialog_bg").hide();
    			$(".dialog").hide();
    		}
		}
	});

	var ModelView = Backbone.View.extend({
		el: "#model-ph",
		template: $("#modal-template").template(),
		events: {
			"click #user-signin"	: "signin",
			"submit #login"			: "signin",
			"click #user-signiup"	: "signup",
			"submit #reg"			: "signup"		
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
					$("#login .error").html(err.error).css({
						display : "block"
					});
				},
				success: function(res){
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

					window.location.href = '/';
				}
			});
		},

		render: function(){
			this.$el.html($.tmpl(this.template));
		},

		initialize: function(){
			this.render();
		}
	})

	// 对话框
	var DialogView = Backbone.View.extend({
		el: "#dialog-ph",
		template: $("#dialog-template").template(),
		events: {
			"click .close"				: "close",
			"click #btn_add_category"   : "addCategory",
			"click #btn_edit_category"  : "editCategory",
			"click #btn_add_user"   	: "addUser",
			"click #btn_edit_user"   	: "editUser",
			"click #btn_add_knowledge"	: "addKnowledge",
			"click #btn_publish_knowledge" : "addKnowledge",
			"click #btn_edit_knowledge"	: "editKnowledge",
			"click #btn_edit_publish_knowledge" : "editKnowledge"
		},
		close: function(e){
			e.preventDefault();
			DialogState.exit();
		},
		render: function(){
			this.$el.html($.tmpl(this.template));
		},
		addCategory: function(){
			var attr = {
				title: $.trim($("#category_title").val()),
				description: $.trim($("#category_desc").val())
			};

			var category = new CategoryModel(attr);
			if(!category.isValid()){
				$(".add_category .error").html(category.validationError).css({
					display : "block"
				});
				return false;
			}

			Categorys.create(attr,{
				wait: true
			});
		},

		editCategory: function(){
			var attr = {
				title: $.trim($("#edit_category_title").val()),
				description: $.trim($("#edit_category_desc").val())
			}; 

			var category = new CategoryModel(attr);
			
			if(!category.isValid()){
				$(".edit_category .error").html(category.validationError).css({
					display : "block"
				});
				return false;
			}

			category = Categorys.get($(".edit_category").attr('data_id'));
			category.save(attr,{
				wait: true
			});
		},
		addUser: function(){
			var attr = {
				username: $.trim($("#username").val()),
				password: $.trim($("#user_pass").val()),
				rep_pass: $.trim($("#user_pass_comfirm").val()),
				email: $.trim($("#user_email").val()),
				nickname: $.trim($("#user_nick").val()),
				signature: $.trim($("#user_sign").val())
			};

			var user = new UserModel(attr);
			if(!user.isValid()){
				$(".add_user .error").html(user.validationError).css({
					display : "block"
				});
				return false;
			}

			Users.create(attr,{
				wait:true
			})
		},

		editUser: function(){
			var attr = {
				username: $.trim($("#edit_username").val()),
				email: $.trim($("#edit_user_email").val()),
				nickname: $.trim($("#edit_user_nick").val()),
				signature: $.trim($("#edit_user_sign").val())
			};

			

			var user = new UserModel(attr);

			if(!user.isValid()){
				$(".edit_user .error").html(user.validationError).css({
					display : "block"
				});
				return false;
			}

			user = Users.get($(".edit_user").attr('data_id'));

			user.save(attr,{
				wait: true
			});

		},

		addKnowledge: function(e){
			var action = $(e.currentTarget);

			var attr = {
				title: $.trim($("#knowledge_title").val()),
				content: $.trim($("#knowledge_content").val()),
				category_id: $.trim($("#add_category_select").val())
			};

			if(action.hasClass('submit_pub')){
				attr.publish = true;
			}

			var knowledge = new KnowledgeModel(attr);

			if(!knowledge.isValid()){
				$(".add_knowledge .error").html(knowledge.validationError).css({
					display : "block"
				});
				return false;
			}

			Knowledges.create(attr,{
				wait:true,
				beforeSend: function(){
					DialogState.tips({
						title: "添加中...",
						msg: "数据正在添加中",
						action: "waiting",
						canclose: false,
						actionTips: ""
					});
				}
			});	
		},

		editKnowledge: function(e){
			var action = $(e.currentTarget);

			var attr = {
				title: $.trim($("#edit_knowledge_title").val()),
				content: $.trim($("#edit_knowledge_content").val()),
				category_id: $.trim($("#edit_category_select").val())
			};

			if(action.hasClass('submit_pub')){
				attr.publish = true;
			} else {
				attr.publish = $(".edit_knowledge").attr('data_publish');
			}

			var knowledge = new KnowledgeModel(attr);

			if(!knowledge.isValid()){
				$(".add_knowledge .error").html(knowledge.validationError).css({
					display : "block"
				});
				return false;
			}

			knowledge = Knowledges.get($(".edit_knowledge").attr('data_id'));

			knowledge.save(attr,{
				wait:true,
				beforeSend: function(){
					DialogState.tips({
						title: "更新中...",
						msg: "数据正在更新中",
						action: "waiting",
						canclose: false,
						actionTips: ""
					});
				}
			});
		},

		initialize: function(){
			this.render();
		}
	});

	var HeadView = Backbone.View.extend({
		el: "#inews-nav",

		events: {
			"click #headNav li"		: "toggleNav",
			"click .poweroff"		: "loginOut"
		},

		toggleNav: function(e){
			var current = $(e.currentTarget).attr('data-nav');
			ARouter.navigate(current,{trigger: true});
		},

		loginOut: function(e){
			$.ajax({
				url: url + 'signout',
				type: "post",

				success: function(){
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
			window.Categorys = new CategoryList();

			new HeadView();
			new ModelView();
		},

		index: function(){
			var self = this;
			Menu.set({current: 'index'});
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

	// app¹ÜÀí
	var app = {
		start: function(){
			ARouter.navigate('index',{trigger: true}); 
		}
	}

	app.start();
})