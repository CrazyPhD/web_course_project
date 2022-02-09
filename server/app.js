const express = require('express');
const bodyParser = require('body-parser');
const models = require('./models');
const { Pool } = require('pg');


class Application {
    constructor(pg) {
        this.app = express();
        this.pool = new Pool({
            user: pg.user,
            host: pg.host,
            database: pg.database,
            password: pg.password,
            port: pg.port,
        })
        this.manager = new models.ProductManager();
        this.attachRoutes();
    }

    attachRoutes() {
        let app = this.app;
        let jsonParser = bodyParser.json();

        app.use(express.static(__dirname + '/../public'));
        app.set('views', __dirname + '/views');
        app.set('view engine', 'pug');

        app.get('/', (req, res) => {
            this.getPageHandler(req, res, 'index', 'Главная');
        });
        app.get('/catalog', (req, res) => {
            this.getPageHandler(req, res, 'catalog', 'Каталог');
        });
        app.get('/about', (req, res) => {
            this.getPageHandler(req, res, 'about', 'О нас');
        });
        app.get('/contact', (req, res) => {
            this.getPageHandler(req, res, 'contact', 'Контакты');
        });
        app.get('/search', (req, res) => {
            this.getPageHandler(req, res, 'search', 'Поиск');
        });
        app.get('/cart', (req, res) => {
            this.getPageHandler(req, res, 'cart', 'Корзина');
        });
        app.get('/product/:productId', this.getProductHandler.bind(this));
    }

    getPageHandler(req, res, page, title) {
        res.status(200).type('text/html');
        res.render('page', { page: page, title: title });
    }

    getProductHandler(req, res) {
        res.status(200).type('text/html');
        res.render('page', {page: 'product', productId: req.params.productId});
    }

    getApp() {
        return this.app;
    }

    getPool() {
        return this.pool;
    }
}

module.exports = Application;