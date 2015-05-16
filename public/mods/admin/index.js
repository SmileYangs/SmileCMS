$(function(){
	var url = "http://localhost:3333/admin";

	/*
	* 分类管理
	*/

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
	* todo部分
	*/

	// todo 模型
	var Todo = Backbone.Model.extend({
		urlRoot: url + "/index/todo",

		// 设置默认的属性
		defaults: {
			content: "empty todo...",
			done: false
		},
		parse: function(data){
			data.id = data._id ? data._id : '';
			return data;
		},
		//确保每一个content都不为空
		initialize: function() {
			if (!this.get("content")) {
			  this.set({"content": this.defaults.content});
			}
		},
		// 将一个任务的完成状态置为逆状态
		toggle: function() {
			this.save({done: !this.get("done")});
		},
		//删除一个条目
		clear: function() {
			this.destroy();
		}
	});
	/**
	 *Todo的一个集合
	 **/
	var TodoList = Backbone.Collection.extend({
		url: url + "/index/todo",
		// 设置Collection的模型为Todo
		model: Todo,
		//获取所有已经完成的任务数目
		parse: function(data){
			console.log(data);

			return data.todos;
		},
		done: function() {
			// 使用underscore的filter过滤出所有已经完成的事件
			return this.filter(function(todo){ return todo.get('done'); });
		},

		//获取任务列表中未完成的任务数目
		remaining: function() {
			// 使用underscore的without函数移除已经完成的任务
			return this.without.apply(this, this.done());
		}
	});

	/**
	 *这个view的主要作用是控制任务列表
	 **/
	var TodoView = Backbone.View.extend({
		//下面这个标签的作用是，把template模板中获取到的html代码放到这标签中。
		tagName:  "li",
		// 获取一个任务条目的模板
		template: $('#item-template').template(),

		// 为每一个任务条目绑定事件
		events: {
			"click .check"              : "toggleDone",
			"dblclick label.todo-content" : "edit",
			"click span.todo-destroy"   : "clear",
			"keypress .todo-input"      : "updateOnEnter",
			"blur .todo-input"          : "close"
		},

		//在初始化设置了todoview和todo的以一对一引用，这里我们可以把todoview看作是todo在界面的映射。
		initialize: function() {
			_.bindAll(this, 'render', 'close', 'remove');
			this.model.bind('change', this.render);
			this.model.bind('destroy', this.remove);   //这个remove是view的中的方法，用来清除页面中的dom
		},

		// 渲染todo中的数据到 item-template 中，然后返回对自己的引用this
		render: function() {
			$(this.el).html($.tmpl(this.template,this.model.toJSON()));
			this.input = this.$('.todo-input');
			return this;
		},

		// 控制任务完成或者未完成
		toggleDone: function() {
			this.model.toggle();
		},

		// 修改任务条目的样式
		edit: function() {
			$(this.el).addClass("editing");
			this.input.focus();
		},

		// 关闭编辑界面，并把修改内容同步到界面
		close: function() {
			this.model.save({content: this.input.val()});
			$(this.el).removeClass("editing");
		},
		// 按下回车之后，关闭编辑界面
		updateOnEnter: function(e) {
			if (e.keyCode == 13) this.close();
		},
		// 移除对应条目，以及对应的数据对象
		clear: function() {
			this.model.clear();
		}
	});

	/**
	 *这个view的功能是显示所有任务列表，显示整体的列表状态（如：完成多少，未完成多少），以及任务的添加。主要是整体上的一个控制
	 **/
	var TodoListView = Backbone.View.extend({
		//绑定页面上主要的DOM节点
		el: "#todo_con",

		// 在底部显示的统计数据模板
		template: $('#stats-template').template(),

		// 绑定dom节点上的事件
		events: {
			"keypress #new-todo":  "createOnEnter",
			"keyup #new-todo":     "showTooltip",
			"click .todo-clear a": "clearCompleted",
			"click .mark-all-done": "toggleAllComplete"
		},

		//在初始化过程中，绑定事件到Todos上，当任务列表改变时会触发对应的事件。最后把存在localStorage中的数据取出来。
		initialize: function() {
			//下面这个是underscore库中的方法，用来绑定方法到目前的这个对象中，是为了在以后运行环境中调用当前对象的时候能够找到对象中的这些方法。
			_.bindAll(this, 'addOne', 'addAll', 'render', 'toggleAllComplete');

			
			this.input = $(this.el).find("#new-todo");
			this.allCheckbox = $(this.el).find(".mark-all-done")[0];

			Todos.bind('add',     this.addOne);
			Todos.bind('reset',   this.addAll);
			Todos.bind('all',     this.render);

			Todos.fetch({reset: true});
		},

		// Re-rendering the App just means refreshing the statistics -- the rest of the app doesn't change.
		// 更改当前任务列表的状态
		render: function() {
			var done = Todos.done().length;
			var remaining = Todos.remaining().length;

			console.log(done,remaining);

			$(this.el).find('#todo-stats').html($.tmpl(this.template,{
				total:      Todos.length,
				done:       done,
				remaining:  remaining
			}));
			//根据剩余多少未完成确定标记全部完成的checkbox的显示
			this.allCheckbox.checked = !remaining;
		},

		//添加一个任务到页面id为todo-list的div/ul中
		addOne: function(todo) {
			var view = new TodoView({model: todo});
			$(this.el).find("#todo-list").append(view.render().el);
		},

		// 把Todos中的所有数据渲染到页面,页面加载的时候用到
		addAll: function() {
			Todos.each(this.addOne);
		},

		//生成一个新Todo的所有属性的字典
		newAttributes: function() {
			return {
				content: this.input.val(),
				done:    false
			};
		},

		//创建一个任务的方法，使用backbone.collection的create方法。将数据保存到localStorage,这是一个html5的js库。需要浏览器支持html5才能用。
		// persisting it to *localStorage*.
		createOnEnter: function(e) {
			if (e.keyCode != 13) return;
			Todos.create(this.newAttributes());  //创建一个对象之后会在backbone中动态调用Todos的add方法，该方法已绑定addOne。
			this.input.val('');
		},

		// 去掉所有已经完成的任务
		clearCompleted: function() {
			_.each(Todos.done(), function(todo){ todo.clear(); });
			return false;
		},

		//用户输入新任务的时候提示，延时1秒钟
		//处理逻辑是：首先获取隐藏的提示节点的引用，然后获取用户输入的值，
		//先判断是否有设置显示的延时，如果有则删除，然后再次设置，因为这个事件是按键的keyup时发生的，所以该方法会被连续调用。
		showTooltip: function(e) {
			var tooltip = $(this.el).find(".ui-tooltip-top");
			var val = this.input.val();
			tooltip.fadeOut();
			if (this.tooltipTimeout) clearTimeout(this.tooltipTimeout);
			if (val == '' || val == this.input.attr('placeholder')) return;
			var show = function(){ tooltip.show().fadeIn(); };
			this.tooltipTimeout = _.delay(show, 1000);
		},

		//处理页面点击标记全部完成按钮
		//处理逻辑：如果标记全部按钮已选，则所有都完成，如果未选，则所有的都未完成。
		toggleAllComplete: function () {
			var done = this.allCheckbox.checked;
			Todos.each(function (todo) { todo.save({'done': done}); });
		}

	});

	/*
	*	公共部分
	*/

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

	// 路由控制器
	var AdminRouter = Backbone.Router.extend({
		routes: {
			"index" 	: "index",
			"knowleage" : "knowleage",
			"category"  : "category",
			"user"		: "user",
			"work"		: "work"
		},

		initialize: function(){
			window.Menu = new MenuModel();
			window.Categorys = new CategoryList();
			window.Todos = new TodoList();

			new NavView();
			new HeadView();
			new DialogView();

			this.categoryConControl = new CategoryConView();
			this.knowledgeConControl = new KnowledgeConView();
			this.userConControl = new UserConView();
			this.workConControl = new WorkConView();
			this.dashboarControl = new DashboardView();
		},

		index: function(){
			var self = this;
			Menu.set({current: 'index'});
			self.dashboarControl.render();

			new TodoListView();
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
			
			new CategoryListView();
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