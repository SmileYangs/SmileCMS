$(function(){
	var url = "http://localhost:3333/admin";
	// 导航模型
	var MenuModel = Backbone.Model.extend({
		defaults:{
			current: "index"
		},
		initialize: function(){
			this.on("change:current",function(model,current){
				$('#admin_leftNav').find('a').removeClass('nav_active');
				$('#admin_leftNav .dropdown').removeClass('active');
				$('#admin_leftNav').find('a[data-nav='+current+']').addClass('nav_active');
			})
		},

	});

	// 分类模型
	var CategoryModel = Backbone.Model.extend({
		urlRoot: url + "/category",
		defaults: {
			"title": null,
			"description": null,
			"sub_count": 0,
			"knowledge_count": 0
		},
		parse: function(data){
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
					console.log(k);
					return name + "不能为空";
				}
			}
		},
		//删除一个条目
	    clear: function() {
	    	this.destroy();
	    }
	});

	// 分类集合
    var CategoryList = Backbone.Collection.extend({
    	url: url + "/category",
    	model: CategoryModel,
    	parse: function(data) {
    		// 将原始数据挂载到categorylist上
           	this.originData = data;

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
			
			Categorys.fetch({reset: true});

		},

		addOne: function(category){
			var view = new CategoryView({model: category});
			this.$(".category_list").append(view.render().el);
		},

		addAll: function(){
			this.$(".category_list").html('');
			Categorys.each(this.addOne);
		}
	});


	// 左侧导航视图
	var NavView = Backbone.View.extend({
		el: "#admin_leftNav",
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

		toWorkManage: function(){
			ARouter.navigate('work',{trigger: true});
		}
	});

	// 顶部视图
	var HeadView = Backbone.View.extend({
		el: "#admin_header",
		events: {
			"click .admin_out" 			: "adminOut",
			"click .admin_search"		: "search",
			"keypress #admin_search"	: "search",
			"click h1"					: "toIndex"
		},

		adminOut: function(e){
			console.log("adminout");
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


	// 对话框状态机
	var DialogState = StateMachine.create({
		events: [
			{name: "addCategory",from: "*",to: "*"},
			{name: "editCategory",from: "*",to: "*"},
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
			onexit: function(e){
				$(".dialog_bg").hide();
				$(".dialog").hide(function(){
					$(this).find('input').val("");
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

	// 弹出框
	var DialogView = Backbone.View.extend({
		el: "#dialog-ph",
		template: $("#dialog-template").template(),
		events: {
			"click .close"				: "close",
			"click .dialog_bg"			: "close",
			"click #btn_add_category"   : "addCategory",
			"click #btn_edit_category"  : "editCategory"
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

			Categorys.create(attr);
			DialogState.exit();
		},

		editCategory: function(){
			var attr = {
				title: $.trim($("#edit_category_title").val()),
				description: $.trim($("#edit_category_desc").val())
			}; 

			var category = Categorys.get($(".edit_category").attr('data_id'));
			category.set(attr);
			if(!category.isValid()){
				$(".edit_category .error").html(category.validationError).css({
					display : "block"
				});
				return false;
			}
			console.log(category);
			category.save();
			DialogState.exit();
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
		}
	});

	var KnowledgeConView = Backbone.View.extend({
		el: "#admin_right",
		template: $("#knowledge-template").template(),

		render: function(){
			this.$el.html($.tmpl(this.template));
		}
	});

	var UserConView = Backbone.View.extend({
		el: "#admin_right",
		template: $("#user-template").template(),

		render: function(){
			this.$el.html($.tmpl(this.template));
		}
	});

	var WorkConView = Backbone.View.extend({
		el: "#admin_right",
		template: $("#work-template").template(),

		render: function(){
			this.$el.html($.tmpl(this.template));
		}
	});

	var SystemView = Backbone.View.extend({
		el: "#admin_right",
		template: $("#system-template").template(),

		render: function(){
			this.$el.html($.tmpl(this.template));
		}
	});

	// 路由控制器
	var AdminRouter = Backbone.Router.extend({
		routes: {
			"index" 	: "index",
			"knowleage" : "knowleage",
			"category"  : "category",
			"user"		: "user",
			"work"		: "work",
			"system"	: "system"
		},

		initialize: function(){
			window.Menu = new MenuModel();
			window.Categorys = new CategoryList();

			new NavView();
			new HeadView();
			new DialogView();

			this.categoryConControl = new CategoryConView();
			this.knowledgeConControl = new KnowledgeConView();
			this.userConControl = new UserConView();
			this.workConControl = new WorkConView();
			this.dashboarControl = new DashboardView();
			this.systemControl = new SystemView();
		},

		index: function(){
			var self = this;
			Menu.set({current: 'index'});
			self.dashboarControl.render();
		},

		knowleage: function(){
			var self = this;
			Menu.set({current: 'knowleage'});
			self.knowledgeConControl.render();
		},

		category: function(){
			var self = this;
			Menu.set({current: 'category'});
			self.categoryConControl.render();

			window.CategoryListView = new CategoryListView();
		},

		user: function(){
			var self = this;
			Menu.set({current: 'user'});
			self.userConControl.render();
		},

		work: function(){
			var self = this;
			Menu.set({current: 'work'});
			self.workConControl.render();
		},

		system: function(){
			var self = this;
			Menu.set({current: 'system'});
			self.systemControl.render();
		}
	});

	var ARouter = new AdminRouter();
	Backbone.history.start({pushState: false});

	// app管理
	var app = {
		start: function(){
			ARouter.navigate('index',{trigger: true}); 
		}
	}

	app.start();
})