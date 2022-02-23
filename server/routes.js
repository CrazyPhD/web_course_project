const passport = require("./passport");
const multer = require("multer");
const api = require("./api");
const bl = require("./bl");

class Routes {
    constructor(app, pool, schema) {
        this.app = app;
        this.pool = pool;
        this.schema = schema;
    }

    attachRoutes() {
        const app = this.app;
        const pool = this.pool;
        const schema = this.schema;

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
        app.get('/confirm/:verification', this.getConfirmHandler.bind(this));
        app.get('/admin', this.getAdminHandler.bind(this));

        app.get('/admin/addproduct', this.getAdminAddProductHandler.bind(this));
        app.post('/admin/addproduct', multer({ storage: multer.memoryStorage() }).single('img'), this.postAdminAddProductHandler.bind(this));

        app.get('/admin/editproduct/:productId', this.getAdminEditProductHandler.bind(this));
        app.post('/admin/editproduct/:productId', multer({ storage: multer.memoryStorage() }).single('img'), this.postAdminEditProductHandler.bind(this));

        api.apiConfig(app, pool, schema);

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
            bl.updateProduct(this.pool, req, res, req.params.productId, req.body.oldImage);
        } else {
            res.redirect('/');
        }
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
            bl.registerProduct(this.pool, req, res);
        } else {
            res.redirect('/');
        }
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
            } else if (pass !== passConf) {
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

    getConfirmHandler(req, res) {
        const pool = this.pool;
        const schema = this.schema;

        pool.query('SELECT login, confirmed FROM '+schema+'.users WHERE verification=($1)', [req.params.verification], (err, result) => {
            if (err || result.rowCount === 0) {
                console.log(err || "DB error.");
                res.redirect("/");
            }
            let config = { page: 'confirm', verification: req.params.verification };
            if (req.isAuthenticated()) config.user = req.user;
            res.status(200).type('text/html');
            res.render('page', config);
        });
    }
}

module.exports = Routes;