const express = require('express');
const multer = require('multer');
const models = require('./models');
const bcrypt= require('bcryptjs');
const passport = require('passport');
const { Pool } = require('pg');
const session = require('express-session');
const flash = require('connect-flash')
const LocalStrategy = require('passport-local').Strategy;

class Application {
    constructor(pg, session_secret) {
        this.app = express();
        this.pool = new Pool({
            user: pg.user,
            host: pg.host,
            database: pg.database,
            password: pg.password,
            port: pg.port,
        });
        this.schema = pg.schema;
        this.session_secret = session_secret;
        this.manager = new models.ProductManager();

        this.app.api = (request, handler, next) => {
            const url = '/api/'+request;
            next ? this.app.post(url, handler, next) : this.app.post(url, handler);
            this.app.get(url, (req, res) => {
                res.status(403).type('text/json');
                res.send('Access denied.');
            });
        };

        this.appConfig();
        this.attachRoutes();
    }

    attachRoutes() {
        let app = this.app;

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

        app.get('/register', this.getRegisterHandler.bind(this));
        app.post('/register', this.postRegisterHandler.bind(this), passport.authenticate('register', {
            successRedirect : '/profile',
            failureRedirect : '/register'
        }));

        app.get('/login', this.getLoginHandler.bind(this));
        app.post('/login', this.postLoginHandler.bind(this), passport.authenticate('login', {
            successRedirect : '/profile',
            failureRedirect : '/login'
        }));

        app.get('/profile', this.getProfileHandler.bind(this));
        app.get('/logout', this.getLogoutHandler.bind(this));
        app.get('/admin', this.getAdminHandler.bind(this));

        app.get('/admin/addproduct', this.getAdminAddProductHandler.bind(this));
        app.post('/admin/addproduct', multer({ storage: multer.memoryStorage() }).single('img'), this.postAdminAddProductHandler.bind(this));

        app.get('/admin/editproduct/:productId', this.getAdminEditProductHandler.bind(this));
        app.post('/admin/editproduct/:productId', multer({ storage: multer.memoryStorage() }).single('img'), this.postAdminEditProductHandler.bind(this));

        this.apiConfig();

        app.get('*', function(req, res){
            res.status(404).type("text/html");
            res.render('page', {
                page: '404',
                title: 'Ошибка 404'
            });
        });
    }

    getAdminEditProductHandler(req, res) {
        if (req.isAuthenticated() && req.user.is_admin === true) {
            const productId = req.params.productId;
            this.pool.query(
                'SELECT name, price, keywords, shortdesc, description, image, count FROM ' + this.schema + '.products WHERE productId=$1',
                [productId],
                (err, result) => {
                    if (err) res.redirect('/admin');
                    else {
                        const product = result.rows[0];
                        res.render('admin/addproduct', {
                            product: {
                                id: productId,
                                name: product.name,
                                price: product.price,
                                keywords: product.keywords,
                                shortdesc: product.shortdesc,
                                description: product.description,
                                image: Buffer.from(product.image, 'binary').toString('utf8'),
                                count: product.count
                            }
                        });
                    }
                }
            );
        } else {
            res.redirect('/');
        }
    }

    postAdminEditProductHandler(req, res, next) {
        if (req.isAuthenticated() && req.user.is_admin === true) {
            this.updateProduct(req, res, req.params.productId, req.body.oldImage);
        } else {
            res.redirect('/');
        }
    }

    updateProduct(req, res, productId, oldImage) {
        const info = req.body;
        const file = req.file;

        const name = info.name;
        const price = info.price;
        const keywords = info.keywords || '';
        const shortdesc = info.shortdesc || '';
        const description = info.description || '';
        const count = info.count;
        const image = file ? this.imageFileToBase64(file) : oldImage;

        this.pool.query(
            'UPDATE ' + this.schema + '.products SET name=$1, price=$2, keywords=$3, shortdesc=$4, description=$5, image=$6, count=$7 WHERE productId=$8',
            [name, price, keywords, shortdesc, description, image, count, productId],
            (err, result) => {
                if (err) res.redirect('/admin');
                else {
                    console.log('Product ' + name + ' -> update');
                    res.render('admin/addproduct', {
                        product: {
                            id: productId,
                            name: name,
                            price: price,
                            keywords: keywords,
                            shortdesc: shortdesc,
                            description: description,
                            image: image,
                            count: count
                        }
                    });
                }
            }
        );
    }

    getAdminHandler(req, res) {
        if (req.isAuthenticated() && req.user.is_admin === true) {
            res.render('admin/admin');
        } else {
            res.redirect('/');
        }
    }

    getAdminAddProductHandler(req, res) {
        if (req.isAuthenticated() && req.user.is_admin === true) {
            res.render('admin/addproduct');
        } else {
            res.redirect('/');
        }
    }

    postAdminAddProductHandler(req, res, next) {
        if (req.isAuthenticated() && req.user.is_admin === true) {
            this.registerProduct(req, res);
        } else {
            res.redirect('/');
        }
    }

    registerProduct(req, res) {
        const info = req.body;
        const file = req.file;

        const name = info.name;
        const price = info.price;
        const keywords = info.keywords || '';
        const shortdesc = info.shortdesc || '';
        const description = info.description || '';
        const count = info.count;
        const image = this.imageFileToBase64(file);

        this.pool.query(
            'INSERT INTO '+this.schema+'.products (name, price, keywords, shortdesc, description, image, count) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [name, price, keywords, shortdesc, description, image, count],
            (err, result) => {
                err ? console.log(err) : console.log('Product `' + name + '`' + ' -> register');
                res.redirect('/admin');
            }
        );
    }

    imageFileToBase64(file) {
        return 'data:' + file.mimetype+';base64,' + file.buffer.toString("base64");
    }

    getProfileHandler(req, res) {
        if (req.isAuthenticated()) {
            res.render('page', {
                page: 'profile',
                title: 'Профиль',
                user: req.user
            });
        } else {
            res.redirect('/login');
        }
    }

    postLoginHandler(req, res, next) {
        if (req.isAuthenticated()) {
            res.redirect('/profile');
        } else {
            let user = (req.body.login).toLowerCase();
            let pass = req.body.password;
            if (user.length === 0 || pass.length === 0) {
                req.flash('message', 'Поля не должны быть пустыми.')
                res.redirect('/login');
            } else {
                next();
            }
        }
    }

    getLoginHandler(req, res) {
        if (req.isAuthenticated()) {
            res.redirect('/profile');
        } else {
            res.render('page', {
                page: 'login',
                title: 'Авторизация',
                user: req.user,
                message: res.locals.message
            });
        }
    }

    getRegisterHandler(req, res) {
        if (req.isAuthenticated()) {
            res.redirect('/');
        } else {
            res.render('page', {
                page: 'register',
                title: 'Регистрация',
                user: req.user,
                message: res.locals.message
            });
        }
    }

    postRegisterHandler(req, res, next) {
        if (req.isAuthenticated()) {
            res.redirect('/');
        } else {
            let user = (req.body.login).toLowerCase();
            let pass = req.body.password;
            let passConf = req.body.passConf;
            if (user.length === 0 || pass.length === 0 || passConf.length === 0) {
                res.redirect('/register');
            } else if (pass != passConf) {
                res.redirect('/register');
            } else {
                next();
            }
        }

    }
    getLogoutHandler(req, res) {
        if (req.isAuthenticated()) {
            console.log(req.user.login + ' -> logout');
            req.logout();
            res.redirect('/');
        } else {
            res.redirect('/');
        }
    }

    getPageHandler(req, res, page, title) {
        let config = { page: page, title: title };
        if (req.isAuthenticated()) config.user = req.user;
        res.status(200).type('text/html');
        res.render('page', config);
    }

    getProductHandler(req, res) {
        let config = { page: 'product', productId: req.params.productId };
        if (req.isAuthenticated()) config.user = req.user;
        res.status(200).type('text/html');
        res.render('page', config);
    }

    getApp() {
        return this.app;
    }

    getPool() {
        return this.pool;
    }

    appConfig() {
        let app = this.app;

        app.use(session({
            secret: this.session_secret,
            resave: false,
            saveUninitialized: true
        }));
        app.use(express.urlencoded({
            extended: true
        }));
        app.use(express.json());
        app.use(passport.initialize());
        app.use(passport.session());
        app.use(flash());
        app.use(function(req, res, next){
            res.locals.message = req.flash('message');
            next();
        });
        app.use(express.static(__dirname + '/../public'));
        app.set('views', __dirname + '/views');
        app.set('view engine', 'pug');
        this.passportConfig();
    }

    passportConfig() {
        const pool = this.pool;
        const schema = this.schema;

        async function asyncStringify(str) {
            return JSON.stringify(str);
        }

        passport.serializeUser(function(user, done) {
            done(null, user);
        });
        passport.deserializeUser(function(user, done) {
            done(null, user);
        });

        passport.use('login', new LocalStrategy({
                usernameField : 'login',
                passReqToCallback : true
            },
            function(req, login, password, done) {
                try {
                    pool.query('SELECT userId, login, password, firstName, lastName, cart, orders, is_admin FROM '+schema+'.users WHERE login=$1', [login], (err, result) => {
                        if (err) return done(err);
                        const user = result.rows[0];
                        if (user == null) {
                            return done(null, false, req.flash('message', "Неправильный логин или пароль."));
                        } else {
                            bcrypt.compare(password, user.password, (err, valid) => {
                                if (err) return done(err);
                                if (valid) {
                                    console.log(req.body.login + ' -> login');
                                    let config = { id: user.userId, login: user.login, firstName: user.firstName, lastName: user.lastName, cart: user.cart, orders: user.orders };
                                    if (user.is_admin === true) config.is_admin = true;
                                    return done(null, config);
                                } else {
                                    return done(null, false, req.flash('message', "Неправильный логин или пароль."));
                                }
                            })
                        }
                    });
                } catch(e) {
                    throw (e);
                }
            }));

        passport.use('register', new LocalStrategy({
                usernameField : 'login',
                passReqToCallback : true
            },
            function(req, login, password, done) {
                try {
                    bcrypt.hash(req.body.password, 8, (err, passHash) => {
                        if (err) {
                            console.log(err);
                        } else {
                            pool.query('SELECT userId FROM ' + schema + '.users WHERE login=($1)', [req.body.login], (err, result) => {
                                if (err) return done(err);
                                if (result.rows[0]) {
                                    return done(null, false, req.flash('message', "Пользователь с этим E-Mail уже зарегистрирован."));
                                } else {
                                    pool.query('INSERT INTO ' + schema + '.users (login, firstName, lastName, password) VALUES ($1, $2, $3, $4) RETURNING *', [req.body.login, req.body.firstName, req.body.lastName, passHash], (err, result) => {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            console.log(req.body.login + ' -> register');
                                            return done(null, {
                                                id: result.rows[0].userId,
                                                login: req.body.login,
                                                firstName: req.body.firstName,
                                                lastName: req.body.lastName
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                } catch(e) {
                    throw (e);
                }
            }));
    }

    apiConfig() {
        const app = this.app;
        const pool = this.pool;
        const schema = this.schema;

        app.api('products', (req, res) => {
            const params = req.body;
            const fields = params.fields.join(',');
            let answer = { success: false };

            res.status(200).type('text/json');
            if ((params.asc && (params.orderby == null)) || (params.page && (params.limit == null)))
                return res.send(JSON.stringify(answer));
            pool.query(
                'SELECT ' + fields + ' FROM ' + schema + '.products ' +
                    (params.where ? 'WHERE ' + params.where + ' ' : '') +
                    (params.orderby ? 'ORDER BY ' + params.orderby + ' ' + (params.asc != null ? (params.asc === true ? 'ASC ' : 'DESC ') : '') : '') +
                    ((params.limit && (params.limit > 0)) ? 'LIMIT ' + params.limit + ' ' : '') +
                    ((params.page && (params.page > 0)) ? 'OFFSET ' + (params.limit * (params.page - 1)) : ''),
                (err, result) => {
                    if (err) {
                        console.log(err);
                        res.send(JSON.stringify(answer));
                    } else {
                        answer.success = true;
                        answer.products = result.rows;
                        answer.products.forEach((product) => {
                            product.image = Buffer.from(product.image, 'binary').toString('utf8');
                        });
                        res.send(JSON.stringify(answer));
                    }
                }
            );
        });
    }
}

module.exports = Application;