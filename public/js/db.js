'use strict';

class Record {
	constructor(name, id) {
		this.name = name;
		this.id = id;
		this.keywords = '';
		this.description = '';
		this.shortdesc = '';
		this.link = '';
	}
	
	getID() {
		return this.id;
	}
	
	getName() {
		return this.name;
	}
	
	setLink(link) {
		this.link = link;
		return this;
	}
	
	getLink() {
		return this.link;
	}
	
	setKeywords(keywords) {
		this.keywords = keywords;
		return this;
	}
	
	getKeywords() {
		return this.keywords;
	}
	
	setDescription(desc) {
		this.description = desc;
		return this;
	}
	
	getDescription() {
		return this.description;
	}
	
	setShortDescription(desc) {
		this.shortdesc = desc;
		return this;
	}
	
	getShortDescription() {
		return this.shortdesc;
	}
}

class Product extends Record {
	constructor(name, id) {
		super(name, id);
		this.price = 0;
		this.image = '';
	}
	
	setPrice(price) {
		this.price = price;
		return this;
	}
	
	getPrice(price) {
		return this.price;
	}
	
	setImage(url) {
		this.image = url;
		return this;
	}
	
	getImage(url) {
		return this.image;
	}

	getLink() {
		return '/product/' + this.getID();
	}
}

class Page extends Record {
	constructor(name, id) {
		super(name, id);
	}
}

class DB {
	constructor() {
		this.products = [];
		this.pages = [];
		this.id = 0;
	}
	
	add(config) {
		if (config.type === 'Product')
			this.addProduct(config);
		if (config.type === 'Page')
			this.addPage(config);
	}
	
	nextID() {
		return ++this.id;
	}
	
	formRecord(config) {
		const isProduct = config.type === 'Product';
		let obj = (isProduct ? new Product(config.name, config.id) : new Page(config.name, this.nextID()));
		if (!isEmpty(config.keywords)) obj.setKeywords(config.keywords);
		if (!isEmpty(config.price) && isProduct) obj.setPrice(config.price);
		if (!isEmpty(config.image) && isProduct) obj.setImage(config.image);
		if (!isEmpty(config.description)) obj.setDescription(config.description);
		if (!isEmpty(config.link)) obj.setLink(config.link);
		if (!isEmpty(config.shortdesc)) obj.setShortDescription(config.shortdesc);
		return obj;
	}

	addProduct(config) {
		if (config.type !== 'Product')
			return;
		this.products[this.id + 1] = this.formRecord(config);
	}
	
	addPage(config) {
		if (config.type !== 'Page')
			return;
		this.pages[this.id + 1] = this.formRecord(config);
	}
	
	find(q) {
		return fetch('/api/products', {
			method: "POST",
			body: JSON.stringify({
				fields: ['*'],
				where: 'name ILIKE \'%'+q+'%\' OR description ILIKE \'%'+q+'%\' OR keywords ILIKE \'%'+q+'%\''
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(
			response => response.json()
		).then(response => {
			if (!response.success)
				return null;
			const rx = new RegExp(q, 'i');
			let found = response.products.map(product =>
				this.formRecord({
					type: 'Product',
					name: product.name,
					image: product.image,
					id: product.productid,
					keywords: product.keywords,
					shortdesc: product.shortdesc,
					description: product.description,
					price: product.price
				})
			);
			[this.pages].forEach((records) => {
				records.forEach((record) => {
					if (rx.test(record.getName()) ||
						rx.test(record.getDescription()) ||
						rx.test(record.getKeywords()))
						found.push(record);
				});
			});
			return found;
		});
	}
	
	getProducts(sort) {
		return fetch('/api/products', {
			method: "POST",
			body: JSON.stringify({
				fields: ['*'],
				orderby: 'price',
				asc: sort == 'asc'
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(
			response => response.json()
		).then(response => {
			if (!response.success)
				return null;
			return response.products.map(product =>
				this.formRecord({
					type: 'Product',
					name: product.name,
					image: product.image,
					id: product.productid,
					keywords: product.keywords,
					shortdesc: product.shortdesc,
					description: product.description,
					price: product.price
				})
			);
		});
	}
	
	getProduct(id) {
		return fetch('/api/products', {
			method: "POST",
			body: JSON.stringify({
				fields: ['*'],
				where: Array.isArray(id) ? id.map(i => 'productId=\''+i+'\'').join(' OR ') : 'productId=\''+id+'\''
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(
			response => response.json()
		).then(response => {
			let answer = null;
			if (!response.success)
				return answer;
			if (Array.isArray(id)) {
				const infos = response.products;
				answer = infos.map(i =>
					this.formRecord({
						type: 'Product',
						name: i.name,
						image: i.image,
						id: i.productid,
						keywords: i.keywords,
						shortdesc: i.shortdesc,
						description: i.description,
						price: i.price
					})
				);
			} else {
				const info = response.products[0];
				const record = this.formRecord({
					type: 'Product',
					name: info.name,
					image: info.image,
					id: info.productid,
					keywords: info.keywords,
					shortdesc: info.shortdesc,
					description: info.description,
					price: info.price
				});
				answer = record;
			}
			return answer;
		});
	}
}

const db = new DB();

db.add({type: 'Page', name: 'О нас', shortdesc: 'Страница с информацией о компании Software Shop.', description: 'Страница с информацией о компании Software Shop.', link: './about.html', keywords: 'all,магазин,софта,программное,обеспечение'});
db.add({type: 'Page', name: 'Контакты', shortdesc: 'Страница с контактной информацией: телефоны и карта с офисом.', description: 'Страница с контактной информацией: телефоны и карта с офисом.', link: './contact.html', keywords: 'all,адрес,контакты,контакт'});
db.add({type: 'Page', name: 'Каталог', shortdesc: 'Страница с продуктами.', description: 'Страница с продуктами.', link: './catalog.html', keywords: 'all,магазин,программа,товар,товары'});
