'use strict';
/* 
	Framework for manipulating on DOM elements.
*/

function isEmpty(val) {
	return val === null || val === undefined ||
			val == 0 || val === 'none' ||
			val === '' || val === '0px' || val === [];
}

class CDElement {
	constructor(el) {
		this.element = el;
	}
	
	get() {
		return this.element;
	}
	
	copy() {
		return new CDElement(this.get().cloneNode(true));
	}
	
	getChild(selector) {
		if (isEmpty(selector))
			throw "Element.getChild() invalid selector.";
		return new CDElement(this.element.querySelector(selector));
	}
	
	append(element) {
		this.element.append(element.get());
	}
	
	prepend(element) {
		this.element.prepend(element.get());
	}
	
	remove() {
		this.element.remove();
	}
	
	disable() {
		this.removeProperty('display');
		this.addClass('disabled');
		return this;
	}
	
	enable(type) {
		this.removeClass('disabled');
		this.element.style.display = isEmpty(type) ? 'block' : type;
		return this;
	}
	
	minimizeHeight() {
		this.element.style.height = '0px';
		return this;
	}
	
	minimizeWidth() {
		this.element.style.width = '0px';
		return this;
	}
	
	expandHeight(size) {
		if (isEmpty(size))
			return this;
		this.element.style.height = size + 'px';
		return this;
	}
	
	expandWidth(size){
		if (isEmpty(size))
			return this;
		this.element.style.width = size + 'px';
		return this;
	}

	isMinimized(el) {
		return isEmpty(this.element.style.height);
	}

	isDisabled(el) {
		return isEmpty(this.element.style.display);
	}
	
	addClass(cls) {
		if (isEmpty(cls))
			return this;
		cls.split(' ').forEach((c) => {
			this.element.classList.add(c);
		});
		return this;
	}
	
	getClass() {
		if (isEmpty(this.element.classList))
			return '';
		let classList = '';
		this.element.classList.forEach((cls) => {
			classList += cls + " ";
		});
		return classList.trim();
	}
	
	removeClass(cls) {
		if (isEmpty(cls))
			return this;
		this.element.classList.remove(cls);
		return this;
	}

	hasClass(cls) {
		if (isEmpty(this.element.classList))
			return false;
		let has = false;
		this.element.classList.forEach((c) => {
			if (c === cls) has = true;
		});
		return has;
	}

	removeClass(cls) {
		if (isEmpty(cls))
			return this;
		this.element.classList.remove(cls);
		return this;
	}

	switchClass(cls) {
		return this.hasClass(cls) ? this.removeClass(cls) : this.addClass(cls);
	}

	setProperty(prop, val, priority) {
		if (isEmpty(prop))
			return this;
		this.element.style.setProperty(prop, val, priority);
		return this;
	}

	removeProperty(prop) {
		if (isEmpty(prop))
			return this;
		this.element.style.setProperty(prop, '');
		return this;
	}
	
	setAttr(attr, value) {
		this.element.setAttribute(attr, isEmpty(value) ? '' : value);
		return this;
	}
	
	setInnerHTML(value) {
		this.element.innerHTML = isEmpty(value) ? '' : value;
		return this;
	}
	
	getInnerHTML() {
		return this.element.innerHTML;
	}
	
	getInnerWidth() {
		return this.element.innerWidth;
	}
	
	getInnerHeight() {
		return this.element.innerHeight;
	}
	
	on(event, callback) {
		if (isEmpty(event) || isEmpty(callback))
			return this;
		this.element.addEventListener(event, callback);
		return this;
	}
	
	un(el, event) {
		if (isEmpty(event))
			return this;
		this.element.removeEventListener(event);
		return this;
	}
}

class Dom {
	get(selector) {
		if (isEmpty(selector))
			throw "Dom.get() invalid selector.";
		let element = document.querySelector(selector);
		if (isEmpty(element))
			throw "Dom.get() nothing is found for '" + selector + "'";
		return new CDElement(document.querySelector(selector));
	}
	
	create(config, container, prepend) {
		if (isEmpty(config) || isEmpty(config.tag))
			return;
		let element = new CDElement(document.createElement(config.tag));
		
		if (!isEmpty(config.attr)) {
			config.attr.forEach((attr) => {
				element.setAttr(attr[0], attr[1]);
			});
		}
		if (!isEmpty(config.innerHTML)) element.setInnerHTML(config.innerHTML);
		if (!isEmpty(config.cls)) element.addClass(config.cls);
		
		if (!isEmpty(config.cn)) {
			config.cn.forEach((el) => {
				if (el instanceof Element) {
					element.append(new CDElement(el));
				} else if (el instanceof CDElement) {
					element.append(el);
				} else this.create(el, element);
			});
		}
		
		if (!isEmpty(container))
			(prepend === true ? container.prepend(element) : container.append(element));
		return element;
	}
	
	append(container, element) {
		if (isEmpty(element) || isEmpty(container) ||
				(!(element instanceof Element) && !(element instanceof CDElement)) ||
				(!(container instanceof Element) && !(container instanceof CDElement)))
			return;
		(container instanceof CDElement ? container.get() : container).append((element instanceof CDElement ? element.get() : element));
	}
	
	setTitle(title) {
		document.title = title;
	}
	
	setCookie(name, value, hours) {
		document.cookie = name + "=" + JSON.stringify(value) + "; path=/; expires=" + (new Date(Date.now() + hours * 3600000).toGMTString());
	}
	
	getCookie(name) {
		let cookie = {};
		document.cookie.split(';').forEach(function(el) {
			let [key,value] = el.split('=');
			cookie[key.trim()] = value;
		})
		return JSON.parse(isEmpty(cookie[name]) ? '[]' : cookie[name]);
	}
}

const DOM = new Dom();
const window_ = new CDElement(window);