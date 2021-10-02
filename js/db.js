'use strict';

/* Database simulation */

class Record {
	constructor(name, id) {
		this.name = name;
		this.id = id;
		this.keywords = '';
		this.description = '';
	}
	
	getID() {
		return this.id;
	}
	
	getName() {
		return this.name;
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
		return obj;
	}
	
	addProduct(config) {
		if (config.type !== 'Product')
			return;
		this.products.push(this.formRecord(config));
	}
	
	addPage(config) {
		if (config.type !== 'Page')
			return;
		this.pages.push(this.formRecord(config));
	}
	
	find(q) {
		if (isEmpty(q) || q.length < 3)
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
}

const db = new DB();

db.add({type: 'Product', name: 'Поиск подпалиндромов', keywords: 'подпалиндромы,палиндромы,поиск,алгоритм,PHP,JavaScript', description: 'Инструмент для поиска подпалиндромов в строке. Используется алгоритм Манакера, как наиболее эффективный из всех известных.', price: 9000});
db.add({type: 'Product', name: 'Кубик рубика (C, OpenGL)', keywords: 'головоломка,кубик,рубик,C,OpenGL', description: 'Десктопное приложение, позволяющее собирать кубик рубика как самостоятельно, так и автоматически с последующим выведением формулы сборки. Применяются кратчайшие ходы сборки из любого состояния.', price: 15000});
db.add({type: 'Product', name: 'Игра "Жизнь" (C)', keywords: 'игра,жизнь,conway,C', description: 'Десктопное приложение, позволяющее генерировать из исходного черно-белого BMP-файла необходимое количество поколений игры "Жизнь".', price: 5000});
db.add({type: 'Product', name: 'Двойной маятник', keywords: 'физика,маятник,двойной,C,JavaScript', description: 'Десктопное приложение, представляющее собой физическую модель двойного маятника с отрисовкой траектории.', price: 8000});
db.add({type: 'Product', name: 'Баллистическое движение', keywords: 'физика,баллистика,выстрел,цель,C', description: 'Десктопное приложение, представляющее собой физическую модель баллистического движения с отрисовкой траектории движения снаряда, а также с возможностью постановки цели для выстрела. На выходе получается BMP-файл с траекторией и масштабной сеткой.', price: 9000});
db.add({type: 'Product', name: 'Нонограмма', keywords: 'игра,нонограмма,nonogram,Java', description: 'Десктопное приложение, представляющее собой игру - нонограмму. Доступные режимы 10x10, 15x15. Присутствует система рекордов (по времени решения нонограмм), ведение статистики (количество решенных нонограмм, количество ошибок и проигрышей).', price: 25000});

db.add({type: 'Page', name: 'О нас', keywords: 'магазин,софта,программное,обеспечение'});
db.add({type: 'Page', name: 'Контакты', keywords: 'адрес,контакты,контакт'});
db.add({type: 'Page', name: 'Каталог', keywords: 'магазин,программа,товар,товары'});
