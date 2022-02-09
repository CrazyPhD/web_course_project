'use strict';

class Cart {
	constructor() {
		this.products = DOM.getCookie('softwareshop777cart') || [];
		this.count = this.products.length;
	}
	
	addProduct(product) {
		if (!(product instanceof Product) || this.checkProduct(product.getID()))
			return;
		const cartCounter = DOM.get('.cart__counter');
		this.count++;
		cartCounter.removeClass('disabled');
		cartCounter.setInnerHTML(this.count);
		const id = product.getID();
		this.products.push({'id': id});
		DOM.setCookie('softwareshop777cart', this.products, 24);
	}
	
	getProducts() {
		return this.products;
	}
	
	checkProduct(id) {
		let found = false;
		this.products.forEach((product) => {
			if (product.id === id)
				found = true;
		});
		return found;
	}
	
	getCount() {
		return this.count;
	}
	
	removeProduct(id) {
		const cartCounter = DOM.get('.cart__counter');
		this.products.forEach((product) => {
			if (product.id === id) {
				this.products.splice(this.products.indexOf(product), 1);
			}
		});
		this.count--;
		cartCounter.setInnerHTML(this.count);
		if (this.count < 1)
			cartCounter.addClass('disabled');
		DOM.setCookie('softwareshop777cart', this.products, 24);
	}
}

const cart = new Cart();