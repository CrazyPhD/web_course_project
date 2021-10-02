'use strict';

/* Database simulation */

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
		let obj = (isProduct ? new Product(config.name, this.nextID()) : new Page(config.name, this.nextID()));
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
		if (isEmpty(q) || q.length < 2)
			return [];
		
		let found = [];
		const rx = new RegExp(q, 'i');
		
		[this.products, this.pages].forEach((records) => { 
			records.forEach((record) => {
				if (rx.test(record.getName()) ||
						rx.test(record.getDescription()) ||
						rx.test(record.getKeywords()))
					found.push(record);
			});
		});
		return found;
	}
	
	getProducts(sort) {
		let sorted = [];
		switch(sort) {
			case 'asc':
				sorted = [...this.products].sort((a, b) => {return a.getPrice() - b.getPrice()});
				return sorted;
			case 'desc':
				sorted = [...this.products].sort((a, b) => {return b.getPrice() - a.getPrice()});
				return sorted;
			default:
				return this.products;
		}
	}
	
	getProduct(id) {
		return this.products[id];
	}
}

const db = new DB();

db.add({type: 'Product', name: 'Поиск подпалиндромов', image: './img/palindrome.png', link: './products/subpalindromes.html', keywords: 'all,подпалиндромы,палиндромы,поиск,алгоритм,PHP,JavaScript', shortdesc: 'Инструмент для поиска подпалиндромов в строке, используя алгоритм Манакера.', description: 'Инструмент для поиска подпалиндромов в строке. Используется алгоритм Манакера, как наиболее эффективный из всех известных.', price: 9000});
db.add({type: 'Product', name: 'Кубик рубика (C, OpenGL)', image: './img/rubick.png', link: './products/rubick.html', keywords: 'all,игра,головоломка,кубик,рубик,C,OpenGL', shortdesc: 'Десктопное приложение, позволяющее собирать кубик рубика как самостоятельно, так и автоматически.', description: 'Десктопное приложение, позволяющее собирать кубик рубика как самостоятельно, так и автоматически с последующим выведением формулы сборки. Применяются кратчайшие ходы сборки из любого состояния.', price: 15000});
db.add({type: 'Product', name: 'Игра "Жизнь" (C)', image: './img/game.png', link: './products/conways_life_game.html', keywords: 'all,игра,жизнь,conway,C', shortdesc: 'Игра "Жизнь" Конвея на BMP.', description: 'Десктопное приложение, позволяющее генерировать из исходного черно-белого BMP-файла необходимое количество поколений игры "Жизнь".', price: 5000});
db.add({type: 'Product', name: 'Двойной маятник', image: './img/double_pendulum.png', link: './products/double_pendulum.html', keywords: 'all,физика,маятник,двойной,C,JavaScript', shortdesc: 'Десктопное приложение, представляющее собой физическую модель двойного маятника.', description: 'Десктопное приложение, представляющее собой физическую модель двойного маятника с отрисовкой траектории.', price: 8000});
db.add({type: 'Product', name: 'Баллистическое движение', image: './img/ballistic.bmp', link: './products/ballistic.html', keywords: 'all,физика,баллистика,выстрел,цель,C', shortdesc: 'Десктопное приложение, представляющее собой физическую модель баллистического движения.', description: 'Десктопное приложение, представляющее собой физическую модель баллистического движения с отрисовкой траектории движения снаряда, а также с возможностью постановки цели для выстрела. На выходе получается BMP-файл с траекторией и масштабной сеткой.', price: 9000});
db.add({type: 'Product', name: 'Нонограмма', image: './img/nonogram.png', link: './products/nonogram.html', keywords: 'all,игра,головоломка,нонограмма,nonogram,Java', shortdesc: 'Десктопное приложение, представляющее собой игру - нонограмму.', description: 'Десктопное приложение, представляющее собой игру - нонограмму. Доступные режимы 10x10, 15x15. Присутствует система рекордов (по времени решения нонограмм), ведение статистики (количество решенных нонограмм, количество ошибок и проигрышей).', price: 25000});

db.add({type: 'Page', name: 'О нас', shortdesc: 'Страница с информацией о компании Software Shop.', description: 'Страница с информацией о компании Software Shop.', link: './about.html', keywords: 'all,магазин,софта,программное,обеспечение'});
db.add({type: 'Page', name: 'Контакты', shortdesc: 'Страница с контактной информацией: телефоны и карта с офисом.', description: 'Страница с контактной информацией: телефоны и карта с офисом.', link: './contact.html', keywords: 'all,адрес,контакты,контакт'});
db.add({type: 'Page', name: 'Каталог', shortdesc: 'Страница с продуктами.', description: 'Страница с продуктами.', link: './catalog.html', keywords: 'all,магазин,программа,товар,товары'});
