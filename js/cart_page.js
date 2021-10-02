'use strict';

const cartContainer = DOM.get('.cart__content');
const currency = 'руб.';

function getPriceLabel(price) {
	return price + " " + currency;
}

function getCartSum() {
	let sum = 0;
	cart.getProducts().forEach((product) => {
		sum += db.getProduct(product.id).getPrice();
	});
	return sum;
}

function renderCart() {
	if (cart.getCount() > 0) {
		cartContainer.setInnerHTML('');
		let products = cart.getProducts();
		let productElements = [];
		products.forEach((product) => {
			product = db.getProduct(product.id);
			let image = {tag: 'img', cls: 'cart__product_image', attr: [['src', product.getImage()]]};
			let left = {tag: 'div', cls: 'cart__product_left', cn: [image]};
			let title = {tag: 'h3', cls: 'cart__product_title header_text', innerHTML: product.getName()};
			let desc = {tag: 'article', cls: 'cart__product_desc', innerHTML: product.getShortDescription()};
			let price = {tag: 'div', cls: 'cart__product_price', innerHTML: getPriceLabel(product.getPrice())};
			let remove = DOM.create({tag: 'div', cls: 'cart__product_remove', cn: [{tag: 'i', cls: 'fas fa-times cart__product_remove_icon'}]});
			let right = {tag: 'div', cls: 'cart__product_right', cn: [title, desc, price, remove]};
			let el = DOM.create({tag: 'div', cls: 'cart__product id_' + product.getID(), cn: [left, right]});
			
			remove.on('click', () => {
				cart.removeProduct(product.getID());
				renderCart();
			});
			
			el.on('click', (e) => {
				if (/cart__product_remove_icon/.test(e.target.className))
					return;
				window_.get().location = product.getLink();
			});
			
			productElements.push(el);
		});
		let productsContainer = {tag: 'div', cls: 'cart__products', cn: productElements};
		let cartSummary = {tag: 'div', cls: 'cart__summary', innerHTML: 'Итого: ' + getPriceLabel(getCartSum())};
		DOM.create(productsContainer, cartContainer);
		DOM.create(cartSummary, cartContainer);
	} else {
		cartContainer.setInnerHTML('Ваша корзина пуста. Зайдите в <a class="content__link" href="./catalog.html">каталог</a> или воспользуйтесь <a class="content__link" href="./search.html">поиском</a>, чтобы найти товары и добавить их в корзину.<div class="cart__empty"></div>');
	}
}


renderCart();