'use strict';

const catalog = DOM.get('.products__list');
const filter = DOM.get('.products__filter');
const filterIcon = filter.getChild('.products__filter_icon');
const currency = 'руб.';
let currentSort = 'asc';
let filterIconCls = 'fa-sort-amount-down-alt';
let prevIconCls = filterIconCls;

function getPriceLabel(price) {
	return price + " " + currency;
}

function switchSort() {
	currentSort = currentSort === 'asc' ? 'desc' : 'asc';
	prevIconCls = filterIconCls;
	filterIconCls = currentSort === 'asc' ? 'fa-sort-amount-down-alt' : 'fa-sort-amount-down';
}

filter.on('click', function() {
	switchSort();
	filterIcon.removeClass(prevIconCls);
	filterIcon.addClass(filterIconCls);
	printProducts(currentSort);
});

function printProducts(sort) {
	catalog.setInnerHTML('');
	let products = db.getProducts(sort);
	products.forEach((product) => {
		if (!isEmpty(product)) {
			let image = {tag: 'img', cls: 'product_image', attr: [['src', product.getImage()], ['alt', product.getName()]]};
			let title = {tag: 'h4', cls: 'header_text product_name', innerHTML: product.getName()};
			let header = {tag: 'div', cls: 'product_header', cn: [image, title]};
			let body = {tag: 'div', cls: 'product_body', innerHTML: product.getShortDescription()};
			let price = {tag: 'span', cls: 'product_price', innerHTML: (cart.checkProduct(product.getID()) ? 'В корзине' : getPriceLabel(product.getPrice()))};
			let button = {tag: 'div', cls: 'product_add' + (cart.checkProduct(product.getID()) ? ' in_cart' : ''), cn: [price]}
			let footer = {tag: 'div', cls: 'product_footer', cn: [button]};
			let card = {tag: 'div', cls: 'products__list_product', cn: [header, body, footer]};
			card = DOM.create(card, catalog);
			button = card.getChild('.product_add');
			price = button.getChild('.product_price');
			card.on('click', function(e) {
				if (e.target.className === button.getClass() ||
						e.target.className === price.getClass())
					return;
				window_.get().location = product.getLink();
			});
			button.on('click', function(e) {
				if (!cart.checkProduct(product.getID())) {
					cart.addProduct(product);
					button.addClass('in_cart');
					price.setInnerHTML('В корзине');
				} else {
					cart.removeProduct(product.getID());
					button.removeClass('in_cart');
					price.setInnerHTML(getPriceLabel(product.getPrice()));
				}
			});
		}
	});
}

printProducts(currentSort);