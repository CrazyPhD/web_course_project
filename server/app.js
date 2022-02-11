const express = require('express');
const bodyParser = require('body-parser');
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
            res.redirect('/');
        } else {
            let user = (req.body.username).toLowerCase();
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
            let user = (req.body.username).toLowerCase();
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
            console.log(req.user.username + ' -> logout');
            req.logout();
            res.redirect('/');
        } else {
            res.redirect('/');
        }
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

    appConfig() {
        let app = this.app;

        app.use(session({
            secret: this.session_secret,
            resave: false,
            saveUninitialized: true
        }));
        app.use(bodyParser.urlencoded({
            extended: true
        }));
        app.use(bodyParser.json());
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
                passReqToCallback : true
            },
            function(req, username, password, done) {
                loginUser();
                async function loginUser() {
                    const client = await pool.connect();
                    try {
                        await client.query('BEGIN');
                        await asyncStringify(client.query('SELECT userId, login, password FROM '+schema+'.users WHERE login=$1', [username], (err, result) => {
                            if (err) return done(err);
                            const user = result.rows[0];
                            if (user == null) {
                                return done(null, false, req.flash('message', "Неправильный логин или пароль."));
                            } else {
                                bcrypt.compare(password, user.password, (err, valid) => {
                                    if (err) return done(err);
                                    if (valid) {
                                        console.log(req.body.username + ' -> login');
                                        return done(null, {id: user.userId, login: user.login});
                                    } else {
                                        return done(null, false, req.flash('message', "Неправильный логин или пароль."));
                                    }
                                })
                            }
                        }))
                    } catch(e) {
                        throw (e);
                    }
                }
            }));

        passport.use('register', new LocalStrategy({
                usernameField : 'username',
                passwordField : 'password',
                passReqToCallback : true
            },
            function(req, username, password, done) {
                registerUser();
                async function registerUser() {
                    const client = await pool.connect();
                    try {
                        await client.query('BEGIN');
                        let passHash = await bcrypt.hash(req.body.password, 8);
                        await asyncStringify(client.query('SELECT userId FROM '+schema+'.users WHERE login=($1)', [req.body.username], (err, result) => {
                            if (err) return done(err);
                            if (result.rows[0]) {
                                return done(null, false, req.flash('message', "Пользователь с этим E-Mail уже зарегистрирован."));
                            } else {
                                client.query('INSERT INTO '+schema+'.users (login, password) VALUES ($1, $2)', [req.body.username, passHash], (err, result) => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        client.query('COMMIT');
                                        console.log(req.body.username + ' -> register');
                                        return done(null, {login: req.body.username});
                                    }
                                });
                            }
                        }));
                    } catch(e) {
                        throw (e);
                    }
                }
            }));
    }
}

module.exports = Application;