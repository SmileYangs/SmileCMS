$(function(){
	var url = "http://localhost:8888/admin";

	/*
	* 分类管理
	*/
	var CategoryModel = Backbone.Model.extend({
		urlRoot: url + "/category",
		defaults: {
			"title": null,
			"description": null,
			"sub_count": 0,
			"knowledge_count": 0
		},
		parse: function(data){
			data = data.action ? data.category : data;

			data.id = data._id;
			return data;
		},
		validate:function(attr,option){
			for(k in attr){
				var name = "";
				switch(k){
					case "title" : name = "分类标题"; break;
					case "description" : name = "分类描述"; break;
				}
				if(attr[k] == "" && (k === "title" || k === "description") ){
					
					return name + "不能为空";
				}
			}
		},
		initialize: function(){
			this.on('request',function(req,xhr){
				xhr.error(function(res){
					var err = $.parseJSON(res.responseText);
										
					$(err.parent + " .error").html(err.error).css({
						display : "block"
					});

				}).success(function(res){
					$(res.parent + " .error").empty().hide();

					DialogState.tips({
						title: res.tips.title,
						msg: res.tips.msg,
						action: "",
						canclose: true,
						actionTips: "我知道了"
					});

					if(res.action === "add"){
						Categorys.add(res.category);
					} 

					if(res.action === "update"){
						var category = Categorys.get(res.category._id);
						category.set(res.category);
					}
				})
			})
		},
		//É¾³ýÒ»¸öÌõÄ¿
	    clear: function() {
	    	this.destroy();
	    }
	});

    var CategoryList = Backbone.Collection.extend({
    	url: url + "/category",
    	model: CategoryModel,
    	parse: function(data) {

		   	return data.categorys;
		}
    });

    var CategoryView = Backbone.View.extend({
    	tagName: "li",
    	template: $("#category-item-template").template(),

    	events: {
    		"click .category_toggle": "toggle",
  			"click .category_edit": "edit",
  			"click .category_delete": "clear"
    	},

    	initialize: function(){
    		_.bindAll(this,'render','toggle','remove','edit');
    		this.model.bind('change', this.render);
    		this.model.bind('destroy', this.remove);
    	},

    	toggle: function(e){
    		var current = $(e.currentTarget);
    		
    		if(current.hasClass('category_open')){
    			current.removeClass('category_open');
    			current.children('span').text('展开')
    			current.children('i').removeClass('fa-folder-open').addClass('fa-folder');
    		} else {
    			current.addClass('category_open');
    			current.children('span').text('收起')
    			current.children('i').removeClass('fa-folder').addClass('fa-folder-open');
    		}
    		
    		current.parents('.category_display').next(".category_desc").toggle();
    	},

    	edit: function(){
    		DialogState.editCategory(this.model.toJSON());
    	},

    	render: function(){
    		this.$el.html($.tmpl(this.template,this.model.toJSON()));
    		return this;
    	},

    	clear: function(){
    		this.model.clear();
    	}
    });

	var CategoryListView = Backbone.View.extend({
		el: "#category_view",

		initialize: function(){
			_.bindAll(this, 'addOne', 'addAll', 'render');

			Categorys.bind('add',this.addOne);
			Categorys.bind('reset',this.addAll);
			
			Categorys.fetch({
				reset: true,
				beforeSend: function(){
					DialogState.tips({
						title: "加载中...",
						msg: "数据正在加载中",
						action: "waiting",
						canclose: false,
						actionTips: ""
					});
				}
			});

		},

		addOne: function(category){
			var view = new CategoryView({model: category});
			this.$(".category_list").append(view.render().el);
		},

		addAll: function(){
			DialogState.exit();
			this.$(".category_list").html('');
			Categorys.each(this.addOne);
		}
	});

	var CategoryConView = Backbone.View.extend({
		el: "#admin_right",
		template: $("#category-template").template(),
		events: {
			"click .category_add": "addCategory"
		},

		addCategory: function(){
			DialogState.addCategory();
		},

		render: function(){
			this.$el.html($.tmpl(this.template));
		},
		initialize: function(){
			
		}
	});

	/*
	* todo管理
	*/

	var Todo = Backbone.Model.extend({
		urlRoot: url + "/index/todo",

		defaults: {
			content: "empty todo...",
			done: false
		},
		parse: function(data){
			data.id = data._id ? data._id : '';
			return data;
		},
		
		initialize: function() {
			if (!this.get("content")) {
			  this.set({"content": this.defaults.content});
			}
		},
		
		toggle: function() {
			this.save({done: !this.get("done")});
		},
		
		clear: function() {
			this.destroy();
		}
	});
	
	var TodoList = Backbone.Collection.extend({
		url: url + "/index/todo",
		
		model: Todo,
		
		parse: function(data){
			return data.todos;
		},
		done: function() {
			return this.filter(function(todo){ return todo.get('done'); });
		},

		
		remaining: function() {
			return this.without.apply(this, this.done());
		}
	});

	var TodoView = Backbone.View.extend({
		tagName:  "li",
		template: $('#item-template').template(),

		events: {
			"click .check"              : "toggleDone",
			"dblclick label.todo-content" : "edit",
			"click span.todo-destroy"   : "clear",
			"keypress .todo-input"      : "updateOnEnter",
			"blur .todo-input"          : "close"
		},

		initialize: function() {
			_.bindAll(this, 'render', 'close', 'remove');
			this.model.bind('change', this.render);
			this.model.bind('destroy', this.remove);   
		},

		render: function() {
			$(this.el).html($.tmpl(this.template,this.model.toJSON()));
			this.input = this.$('.todo-input');
			return this;
		},

		toggleDone: function() {
			this.model.toggle();
		},

		edit: function() {
			$(this.el).addClass("editing");
			this.input.focus();
		},

		close: function() {
			this.model.save({content: this.input.val()});
			$(this.el).removeClass("editing");
		},
		updateOnEnter: function(e) {
			if (e.keyCode == 13) this.close();
		},
		clear: function() {
			this.model.clear();
		}
	});


	var TodoListView = Backbone.View.extend({
		el: "#todo_con",

		template: $('#stats-template').template(),

		events: {
			"keypress #new-todo":  "createOnEnter",
			"keyup #new-todo":     "showTooltip",
			"click .todo-clear a": "clearCompleted",
			"click .mark-all-done": "toggleAllComplete"
		},

		initialize: function() {
			_.bindAll(this, 'addOne', 'addAll', 'render', 'toggleAllComplete');

			
			this.input = $(this.el).find("#new-todo");
			this.allCheckbox = $(this.el).find(".mark-all-done")[0];

			Todos.bind('add',     this.addOne);
			Todos.bind('reset',   this.addAll);
			Todos.bind('all',     this.render);

			if(Todos.length > 0){
				Todos.trigger('reset');
			}
		},

		// Re-rendering the App just means refreshing the statistics -- the rest of the app doesn't change.
		render: function() {
			var done = Todos.done().length;
			var remaining = Todos.remaining().length;

			$(this.el).find('#todo-stats').html($.tmpl(this.template,{
				total:      Todos.length,
				done:       done,
				remaining:  remaining
			}));
			this.allCheckbox.checked = !remaining;
		},

		addOne: function(todo) {
			
			var view = new TodoView({model: todo});
			$(this.el).find("#todo-list").append(view.render().el);
		},

		addAll: function() {
			Todos.each(this.addOne);
		},

		newAttributes: function() {
			return {
				content: this.input.val(),
				done:    false
			};
		},
		// persisting it to *localStorage*.
		createOnEnter: function(e) {
			if (e.keyCode != 13) return;
			Todos.create(this.newAttributes());  
			this.input.val('');
		},

		clearCompleted: function() {
			_.each(Todos.done(), function(todo){ todo.clear(); });
			return false;
		},
		showTooltip: function(e) {
			var tooltip = $(this.el).find(".ui-tooltip-top");
			var val = this.input.val();
			tooltip.fadeOut();
			if (this.tooltipTimeout) clearTimeout(this.tooltipTimeout);
			if (val == '' || val == this.input.attr('placeholder')) return;
			var show = function(){ tooltip.show().fadeIn(); };
			this.tooltipTimeout = _.delay(show, 1000);
		},

		toggleAllComplete: function () {
			var done = this.allCheckbox.checked;
			Todos.each(function (todo) { todo.save({'done': done}); });
		}

	});

	/*模板管理*/
	var TemModel = Backbone.Model.extend({
		urlRoot: url + '/template',
		defaults: {
			name: "default",
			selected: null
		},

		toggle: function() {
			this.save({selected: !this.get("selected")});
		}
	});

	var TemList = Backbone.Collection.extend({
		url: url + '/template',
		model: TemModel,
		parse: function(data){
			return data.tems;
		}
	});

	var TemView = Backbone.View.extend({
		tagName: "li",
		template: $("#tem-item-template").template(),

		render: function() {
			$(this.el).html($.tmpl(this.template,this.model.toJSON()));
			
			return this;
		}
	});

	var TemListView = Backbone.View.extend({
		el: "#tem_view",

		initialize: function(){
			_.bindAll(this, 'addOne','addAll');

			Tems.bind('add',this.addOne);
			Tems.bind('reset',this.addAll);
			
			Tems.fetch({
				reset: true,
				beforeSend: function(){
					DialogState.tips({
						title: "加载中...",
						msg: "数据正在加载中",
						action: "waiting",
						canclose: false,
						actionTips: ""
					});
				}
			});
		},

		addOne: function(knowledge){
			var view = new TemView({model: knowledge});
			
			this.$(".tem_list").append(view.render().el);
		},

		addAll: function(){	
			DialogState.exit();
			Tems.each(this.addOne);
		}
	});

	var TemManView = Backbone.View.extend({
		el: "#admin_right",
		template: $("#tem-manage-template").template(),

		render: function(){
			this.$el.html($.tmpl(this.template));
		}
	});

	/*
	* 用户管理
	*/
	var UserModel = Backbone.Model.extend({
		urlRoot: url + '/user',
		defaults: {
			username: null,
			password: null
		},

		parse: function(data){
			data = data.action ? data.user : data;

			data.id = data._id ? data._id : "";
			return data;
		},

		initialize: function(){
			this.on('request',function(req,xhr){
				xhr.error(function(res){
					var err = $.parseJSON(res.responseText);
										
					$(err.parent + " .error").html(err.error).css({
						display : "block"
					});

				}).success(function(res){
					$(res.parent + " .error").empty().hide();

					DialogState.tips({
						title: res.tips.title,
						msg: res.tips.msg,
						action: "",
						canclose: true,
						actionTips: "我知道了"
					});

					if(res.action === "add"){
						Users.add(res.user);
					} 

					if(res.action === "update"){
						var user = Users.get(res.user._id);
						user.set(res.user);
					}
				})
			})
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
		},

		remove: function(){
			this.destroy();
		}
	});

	var UserList = Backbone.Collection.extend({
		url: url + '/user',
		model: UserModel,

		parse: function(data){
			this.originData = data;

			return data.users;
		}
	});

	var UserView = Backbone.View.extend({
	  	tagName: "li",
	  	template: $("#user-item-template").template(),

	  	events: {
			"click .user_edit": "edit",
			"click .user_delete": "clear"
	  	},

	  	initialize: function(){
	  		_.bindAll(this,'render','remove','edit');
	  		this.model.bind('change', this.render);
	  		this.model.bind('destroy', this.remove);
	  	},

	  	edit: function(){
	  		DialogState.editUser(this.model.toJSON());
	  	},

	  	render: function(){
	  		this.$el.html($.tmpl(this.template,this.model.toJSON()));
	  		return this;
	  	},

	  	clear: function(){
	  		this.model.remove();
	  	}
	});

	var UserListView = Backbone.View.extend({
		el: "#user_view",
		initialize: function(){
			_.bindAll(this, 'addOne', 'addAll', 'render');

			Users.bind('add',this.addOne);
			Users.bind('reset',this.addAll);
			
			Users.fetch({
				reset: true,
				beforeSend: function(){
					DialogState.tips({
						title: "加载中...",
						msg: "数据正在加载中...",
						action: "waiting",
						canclose: false,
						actionTips: ""
					});
				}
			});
		},
		addOne: function(user){
			var view = new UserView({model: user});
			this.$(".user_list").append(view.render().el);
		},

		addAll: function(){
			DialogState.exit();
			this.$(".user_list").html('');
			Users.each(this.addOne);
		}
	});

	var UserConView = Backbone.View.extend({
		el: "#admin_right",
		template: $("#user-template").template(),

		events: {
			"click .user_add": "addUser"
		},

		addUser: function(){
			DialogState.addUser();
		},

		render: function(){
			this.$el.html($.tmpl(this.template));
		}
	});

	/*
	* 知识管理
	*/
	var KnowledgeModel = Backbone.Model.extend({
		urlRoot: url + '/knowledge',
		defaults: {
			title: null,
			content: null,
			selected: false
		},

		parse: function(data){
			data = data.action ? data.knowledge : data;
			data.id = data._id ? data._id : "";
			return data;
		},
		initialize: function(){
			this.on('request',function(req,xhr){
				xhr.error(function(res){

				}).success(function(res){

					DialogState.tips({
						title: res.tips.title,
						msg: res.tips.msg,
						action: "",
						canclose: true,
						actionTips: "我知道了"
					});


					if(res.action === "add"){
						Knowledges.add(res.knowledge,{
							add: true
						});
					} 

					if(res.action === "update"){
						var knowledge = Knowledges.get(res.knowledge._id);
						knowledge.set(res.knowledge);
					}
				})
			})
		},
		validate : function(attr,option){
			for(k in attr){
				var name = "";
				switch(k){
					case "title" : name = "文章标题"; break;
					case "content" : name = "文章内容"; break;
				}
				if((k == "title" || k == "content") && attr[k] == ""){
					return name + "不能为空";
				}
			}
		},
		toggle: function(){
			this.set({selected: !this.get("selected")});
		},
		setStatus: function(status){
			this.set({selected: status});
		},
		remove: function(){
			this.destroy();
		}
	});

	var KnowledgeList = Backbone.Collection.extend({
		url: url + '/knowledge',
		model: KnowledgeModel,

		parse: function(data){
			this.originData = data;
			return data.knowledges;
		},

		selected: function() {
			return this.filter(function(knowledge){ return knowledge.get('selected'); });
		}
	});

	var PageView = Backbone.View.extend({
		el: "#knowledge-pages",
		template:  $("#knowledge-pages-template").template(),

		events: {
			"click a": "pageToggle"
		},

		initialize: function(){
			Knowledges.bind("reset",this.render,this);
		},

		pageToggle: function(e){
			e.preventDefault();

			var page = $(e.currentTarget).attr('data-page');

			Knowledges.fetch({
				reset: true,
				data: {
					page: page,
				},
				beforeSend: function(){
					DialogState.tips({
						title: "加载中...",
						msg: "数据正在加载中",
						action: "waiting",
						canclose: false,
						actionTips: ""
					});
				}
			});
		},

		render: function(){
			var data = {
				page: Knowledges.originData.page,
				pages: Knowledges.originData.pages
			}
			
			this.$el.html($.tmpl(this.template,data));
			ARouter.navigate('knowledge/'+data.page,{trigger: false});
		}
	});

	var KnowledgeView = Backbone.View.extend({
		tagName: "li",
	  	template: $("#knowledge-item-template").template(),
	  	events: {
	  		"click": "toggle",
			"click .knowledge_edit": "edit",
			"click .knowledge_delete": "clear"
	  	},

	  	initialize: function(){
	  		_.bindAll(this,'render','remove','edit');
	  		this.model.bind('change', this.render);
	  		this.model.bind('destroy', this.remove);
	  	},
	  	toggle: function(){
	  		this.model.toggle();
	  		this.$el.toggleClass('selected');
	  	},

	  	edit: function(e){
	  		e.stopPropagation();

	  		DialogState.editKnowledge(this.model.toJSON());
	  	},

	  	render: function(){
	  		this.$el.html($.tmpl(this.template,this.model.toJSON()));
	  		return this;
	  	},

	  	clear: function(e){
	  		e.stopPropagation();
	  		this.model.remove();
	  	} 
	});

	var KnowledgeListView = Backbone.View.extend({
		el: "#knowledge_view",
		template: $("#knowledge-status-template").template(),

		initialize: function(){
			_.bindAll(this, 'addOne','addAll', 'render');

			Knowledges.bind('add',this.addOne);
			Knowledges.bind('reset',this.addAll);
			Knowledges.bind('all',this.render);
			
			Knowledges.fetch({
				reset: true,
				data: {
					page: 1,
				},
				beforeSend: function(){
					DialogState.tips({
						title: "加载中...",
						msg: "数据正在加载中",
						action: "waiting",
						canclose: false,
						actionTips: ""
					});
				}
			});

			var template = $("#category-list-template").template(),
				cats = '';
			if(Categorys.length > 0){
				cats = Categorys.toJSON();
				$(".add_knowledge .category").html($.tmpl(template,{
					cats : cats,
					type : "add"
				}));
				$(".edit_knowledge .category").html($.tmpl(template,{
					cats : cats,
					type : "edit"
				}));
			} else {
				Categorys.fetch({
					reset: false,
					success: function(categorys,res){
						cats = categorys.toJSON();
						$(".add_knowledge .category").html($.tmpl(template,{
							cats : cats,
							type : "add"
						}));
						$(".edit_knowledge .category").html($.tmpl(template,{
							cats : cats,
							type : "edit"
						}));
					}
				})
			}
		},

		render: function(){
			var selected = Knowledges.selected().length,
				total = Knowledges.length;

			$("#admin_right").find('#knowledge-stats').html($.tmpl(this.template,{
				total: total,
				selected: selected,
				selectedAll: selected === total
			}));
			
		},

		addOne: function(knowledge){
			var view = new KnowledgeView({model: knowledge});
			
			this.$(".knowledge_list").append(view.render().el);
		},

		addAll: function(){	
			DialogState.exit();
			this.$(".knowledge_list").html('');
			Knowledges.each(this.addOne);
		}
	});

	var KnowledgeConView = Backbone.View.extend({
		el: "#admin_right",
		template: $("#knowledge-template").template(),

		events: {
			"click .knowledge_add": "addKnowledge",
			"click .select_all_knowledge": "toggleSelectAll",
			"click .knowledge-clear a": "clearCompleted"
		},

		addKnowledge: function(){
			DialogState.addKnowledge();
		},
		toggleSelectAll: function(){

			var selected = Knowledges.selected().length,
				status = false;

			if(selected < Knowledges.length){
				status = true;
			}

			if(status){
				$('.knowledge_list > li').addClass('selected');
			} else {
				$('.knowledge_list > li').removeClass('selected');
			}

			Knowledges.each(function(knowledge){
				knowledge.setStatus(status);
			})
		},
		clearCompleted: function(){
			_.each(Knowledges.selected(), function(knowledge){ knowledge.remove(); });
			return false;
		},
		render: function(){
			this.$el.html($.tmpl(this.template));
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
				$('#admin_leftNav').find('a').removeClass('nav_active');
				$('#admin_leftNav').find("a[data-nav='"+current+"']").addClass('nav_active');
			})
		},

	});
	var NavView = Backbone.View.extend({
		el: "#admin_leftNav",
		template: $("#mini-task-pannel").template(),
		events: {
			"click li a" 				: "toggleNav",
			"click .close_mini_plan"	: "closeMiniPlan",
			"click .admin_view_more"	: "toWorkManage"
		},

		toggleNav: function(e){
			var current = $(e.target).attr('data-nav');
			ARouter.navigate(current,{trigger: true});
		},

		closeMiniPlan: function(){
			var miniPlan = $("#admin_plan_mini");

			miniPlan.hide();
		},

		initialize: function(){
			var self = this;

			Todos.fetch({
				reset: false,
				success:function(Todos){
					var data = {
						tasks: Todos.toJSON().slice(0,3)
					};

					$(self.el).find('#admin_plan_mini').html($.tmpl(self.template,data));
				}
			});
		},

		toWorkManage: function(){
			ARouter.navigate('index',{trigger: true});
		}
	});
	var HeadView = Backbone.View.extend({
		el: "#admin_header",
		events: {
			"click .admin_out" 			: "adminOut",
			"click .admin_search"		: "search",
			"keypress #admin_search"	: "search",
			"click h1"					: "toIndex"
		},

		adminOut: function(e){
			$.ajax({
				url: url + '/signout',
				type: "post",
				error: function(){

				},
				success: function(){
					window.location.href = url + '/login';
				}
			})
		},

		search: function(e){
			var self = this,
				inputVal = $("#admin_search").val();

			if(e.type === "click"){
				console.log('dosearch');
			} else {
				if(e.keyCode === 13){
					console.log('dosearch');
				}
			}
		},

		toIndex: function(){
			ARouter.navigate('index',{trigger: true}); 
		}
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

	var DashboardView = Backbone.View.extend({
		el: "#admin_right",
		template: $("#dashboard-template").template(),

		render: function(){
			this.$el.html($.tmpl(this.template));


			$.ajax({
				url: url + "/index",
				dataType: "json",
				type: "get",
				success: function(res){
					$(".all_state .knowledges").html($.tmpl($("#dashboard-knowledge-template").template(),res.knowledge));
					$(".all_state .categorys").html($.tmpl($("#dashboard-category-template").template(),res.category));
					$(".all_state .users").html($.tmpl($("#dashboard-user-template").template(),res.user));
					$(".all_state .works").html($.tmpl($("#dashboard-work-template").template(),res.todo));
				}
			})
		}
	});

	// Â·ÓÉ¿ØÖÆÆ÷
	var AdminRouter = Backbone.Router.extend({
		routes: {
			"index" 			: "index",
			"knowledge/:page" 	: "knowledge",
			"category"  		: "category",
			"user"				: "user",
			"template"			: "template"
		},

		initialize: function(){
			window.Menu = new MenuModel();
			window.Categorys = new CategoryList();
			window.Todos = new TodoList();
			window.Users = new UserList();
			window.Knowledges = new KnowledgeList();
			window.Tems = new TemList();
			
			window.AppStatus = {
				addKnowledge: false
			};

			new NavView();
			new HeadView();
			new DialogView();

			this.categoryConControl = new CategoryConView();
			this.knowledgeConControl = new KnowledgeConView();
			this.userConControl = new UserConView();
			this.dashboarControl = new DashboardView();
			this.temControl = new TemManView();
		},

		index: function(){
			var self = this;
			Menu.set({current: 'index'});
			self.dashboarControl.render();

			new TodoListView();
		},

		knowledge: function(page){
			var self = this;
			Menu.set({current: 'knowledge/1'});
			self.knowledgeConControl.render();

			new KnowledgeListView();
			new PageView();
		},

		category: function(){
			var self = this;
			Menu.set({current: 'category'});
			self.categoryConControl.render();

			new CategoryListView();
		},

		user: function(){
			var self = this;
			Menu.set({current: 'user'});
			self.userConControl.render();

			new UserListView();
		},

		template: function(){
			var self = this;
			Menu.set({current: 'template'});
			self.temControl.render();

			new TemListView();	
		}	
	});

	var ARouter = new AdminRouter();
	Backbone.history.start({pushState: false});

	// app¹ÜÀí
	var app = {
		start: function(){
			ARouter.navigate('index',{trigger: true}); 
		}
	}

	app.start();
})