'use strict';

const menu_button = DOM.get('.header__menu_button');
const menu_button_icon_close = DOM.get('.header__menu_button > .icon-close');
const menu_button_icon_open = DOM.get('.header__menu_button > .icon-open');
const cart_counter = DOM.get('.cart__counter');
const header_menu = DOM.get('.header__menu');
const header_title = DOM.get('.header__logo > .logo__title');
const mobileWidth = 768;

menu_button.on('click', function() {
	if (header_menu.isMinimized()) {
		header_menu.expandHeight(270);
		menu_button_icon_close.enable('inline-block');
		menu_button_icon_open.disable();
	} else {
		header_menu.minimizeHeight();
		menu_button_icon_open.enable('inline-block');
		menu_button_icon_close.disable();
	}
});

window_.on('resize', function() {
	if (window_.getInnerWidth() > mobileWidth) {
		header_menu.removeProperty('height');
		menu_button_icon_open.enable('inline-block');
		menu_button_icon_close.disable();
	}
});

DOM.get('.header__logo').on('click', function() {
	window_.get().location = './index.html';
});

setInterval(function() {
	let innerhtml = header_title.getInnerHTML();
	if (innerhtml.slice(-1) === '_') {
		header_title.setInnerHTML(innerhtml.slice(0, -1));
	} else {
		header_title.setInnerHTML(innerhtml + '_');
	}
}, 700);