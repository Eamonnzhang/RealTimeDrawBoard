/*!
 * Bootstrap Context Menu
 * Author: @sydcanem
 * https://github.com/sydcanem/bootstrap-contextmenu
 *
 * Inspired by Bootstrap's dropdown plugin.
 * Bootstrap (http://getbootstrap.com).
 *
 * Licensed under MIT
 * ========================================================= */


//基于bootstrap的data-toggle制作的上下文菜单
(function($) {

	'use strict';

	/* CONTEXTMENU CLASS DEFINITION
	 * ============================ */
	var toggle = '[data-toggle="context"]';

	//定义构造函数
	var ContextMenu = function (element, options) {
		this.$element = $(element);

		this.before = options.before || this.before;
		this.onItem = options.onItem || this.onItem;
		this.scopes = options.scopes || null;

		if (options.target) {
			this.$element.data('target', options.target);
		}

		this.listen();
	};

	ContextMenu.prototype = {

        //函数的prototype的constructor本身不就是指向自己也就是 ContextMenu 为什么要重新赋值一遍？
		constructor: ContextMenu,
        //以下为prototype赋值方法 等同于平常写的 ContextMenu.prototype.show = func()。。。。
        //show
        show: function(e) {
			var $menu, evt, tp, items, relatedTarget = { relatedTarget: this, target: e.currentTarget };

			if (this.isDisabled()) return;

			this.closemenu();

			if (this.before.call(this,e,$(e.currentTarget)) === false) return;

			$menu = this.getMenu();
			$menu.trigger(evt = $.Event('show.bs.context', relatedTarget));

			tp = this.getPosition(e, $menu);
			items = 'li:not(.divider)';
			$menu.attr('style', '')
				.css(tp)
				.addClass('open')
				.on('click.context.data-api', items, $.proxy(this.onItem, this, $(e.currentTarget)))
				.trigger('shown.bs.context', relatedTarget);

			// Delegating the `closemenu` only on the currently opened menu.
			// This prevents other opened menus from closing.
			$('html')
				.on('click.context.data-api', $menu.selector, $.proxy(this.closemenu, this));

			return false;
		},
        closemenu: function(e) {
			var $menu, evt, items, relatedTarget;

			$menu = this.getMenu();

			if(!$menu.hasClass('open')) return;

			relatedTarget = { relatedTarget: this };
			$menu.trigger(evt = $.Event('hide.bs.context', relatedTarget));

			items = 'li:not(.divider)';
			$menu.removeClass('open')
				.off('click.context.data-api', items)
				.trigger('hidden.bs.context', relatedTarget);

			$('html')
				.off('click.context.data-api', $menu.selector);
			// Don't propagate click event so other currently
			// opened menus won't close.
			e.stopPropagation();
		},

        keydown: function(e) {
			if (e.which == 27) this.closemenu(e);
		},

        before: function(e) {
			return true;
		},

        onItem: function(e) {
			return true;
		},

        listen: function () {
			this.$element.on('contextmenu.context.data-api', this.scopes, $.proxy(this.show, this));
			$('html').on('click.context.data-api', $.proxy(this.closemenu, this));
			$('html').on('keydown.context.data-api', $.proxy(this.keydown, this));
		},

        destroy: function() {
			this.$element.off('.context.data-api').removeData('context');
			$('html').off('.context.data-api');
		},

        isDisabled: function() {
			return this.$element.hasClass('disabled') || 
					this.$element.attr('disabled');
		},

        getMenu: function () {
			var selector = this.$element.data('target'), $menu;

			if (!selector) {
				selector = this.$element.attr('href');
				selector = selector && selector.replace(/.*(?=#[^\s]*$)/, ''); //strip for ie7
			}

			$menu = $(selector);

			return $menu && $menu.length ? $menu : this.$element.find(selector);
		},

        getPosition: function(e, $menu) {
			var mouseX = e.clientX,
                mouseY = e.clientY,
                boundsX = $(window).width(),
                boundsY = $(window).height(),
                menuWidth = $menu.find('.dropdown-menu').outerWidth(),
                menuHeight = $menu.find('.dropdown-menu').outerHeight(),
                tp = {"position":"absolute","z-index":9999},
                Y, X, parentOffset;

			if (mouseY + menuHeight > boundsY) {
				Y = {"top": mouseY - menuHeight + $(window).scrollTop()};
			} else {
				Y = {"top": mouseY + $(window).scrollTop()};
			}

			if ((mouseX + menuWidth > boundsX) && ((mouseX - menuWidth) > 0)) {
				X = {"left": mouseX - menuWidth + $(window).scrollLeft()};
			} else {
				X = {"left": mouseX + $(window).scrollLeft()};
			}

			// If context-menu's parent is positioned using absolute or relative positioning,
			// the calculated mouse position will be incorrect.
			// Adjust the position of the menu by its offset parent position.
			parentOffset = $menu.offsetParent().offset();
			X.left = X.left - parentOffset.left;
			Y.top = Y.top - parentOffset.top;
 
			return $.extend(tp, Y, X);
		}

	};

	/* CONTEXT MENU PLUGIN DEFINITION
	 * ========================== */

    //为每个jquery封装的元素增加 contextmenu 方法
	$.fn.contextmenu = function (option,e) {
		return this.each(function () {
			var $this = $(this),
                data = $this.data('context'),
                options = (typeof option == 'object') && option;

			if (!data) $this.data('context', (data = new ContextMenu($this, options)));
			if (typeof option == 'string') data[option].call(data, e);
		});
	};

	$.fn.contextmenu.Constructor = ContextMenu;

	/* APPLY TO STANDARD CONTEXT MENU ELEMENTS
	 * =================================== */

    //为document绑定右键菜单事件绑定,
	$(document)
	   .on('contextmenu.context.data-api', function() {
			$(toggle).each(function () {//给每一个属性含有 data-toggle = 'context'的结点执行此函数
				var data = $(this).data('context');
				if (!data) return;
				data.closemenu();
			});
		})
		.on('contextmenu.context.data-api', toggle, function(e) {
			$(this).contextmenu('show', e);  //toggle结点执行contextmenu函数，即show方法

			e.preventDefault();
			e.stopPropagation();
		});
		
}(jQuery));