'use strict';

const productName = DOM.get('.product__name');
const container = DOM.get('.body__content');
const currency = 'руб.';
function getPriceLabel(price) {
	return price + " " + currency;
}

function renderProduct(product) {
	const image = {tag: 'img', cls: 'product__image', attr: [['src', product.getImage()], ['alt', product.getName()]]};
	const imageContainer = {tag: 'div', cls: 'product__image_container', cn: [image]};
	const title = {tag: 'h3', cls: 'product__title header_text', innerHTML: product.getName()};
	const desc = {tag: 'div', cls: 'product__desc', innerHTML: product.getDescription()};
	const info = {tag: 'div', cls: 'product__info', cn: [title, desc]}; 
	const header = {tag: 'div', cls: 'product__header', cn: [imageContainer, info]};
	const price = {tag: 'span', cls: 'product__price', innerHTML: (cart.checkProduct(product.getID()) ? 'В корзине' : getPriceLabel(product.getPrice()))};
	const buy = {tag: 'div', cls: 'product__buy' + (cart.checkProduct(product.getID()) ? ' in_cart' : ''), cn: [price]};
	const link = {tag: 'div', cls: 'product__share_button', cn: [{tag: 'i', cls: 'fas fa-link'}]};
	const vk = {tag: 'div', cls: 'product__share_button', cn: [{tag: 'i', cls: 'fab fa-vk'}]};
	const facebook = {tag: 'div', cls: 'product__share_button', cn: [{tag: 'i', cls: 'fab fa-facebook-square'}]};
	const linkedin = {tag: 'div', cls: 'product__share_button', cn: [{tag: 'i', cls: 'fab fa-linkedin'}]};
	const telegram = {tag: 'div', cls: 'product__share_button', cn: [{tag: 'i', cls: 'fab fa-telegram-plane'}]};
	
	const share = {tag: 'div', cls: 'product__share', cn: [link, telegram, vk, facebook, linkedin]}
	const row = {tag: 'div', cls: 'product__row', cn: [buy, share]};
	const body = {tag: 'div', cls: 'product__body', cn: [row]};
	const card = {tag: 'div', cls: 'product__card', cn: [header, body]};
	DOM.create(card, container, true);
	productName.setInnerHTML(product.getName());
	DOM.setTitle('Магазин софта - ' + product.getName());
	
	const button = DOM.get('.product__buy');
	const priceLabel = DOM.get('.product__price');
	button.on('click', function() {
		if (!cart.checkProduct(product.getID())) {
			cart.addProduct(product);
			button.addClass('in_cart');
			priceLabel.setInnerHTML('В корзине');
		} else {
			cart.removeProduct(product.getID());
			button.removeClass('in_cart');
			priceLabel.setInnerHTML(getPriceLabel(product.getPrice()));
		}
	});
}

db.getProduct(PRODUCT_ID).then(product => renderProduct(product));