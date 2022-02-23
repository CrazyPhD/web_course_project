const express = require('express');
const { Pool } = require('pg');
const session = require('express-session');
const flash = require('connect-flash')
const mailer = require('nodemailer');
const passport = require('./passport');
const Routes = require('./routes');

class Application {
    constructor(pg, mail, session_secret) {
        let app = this.app = express();
        let pool = this.pool = new Pool({
            user: pg.user,
            host: pg.host,
            database: pg.database,
            password: pg.password,
            port: pg.port,
        });
        let schema = this.schema = pg.schema;
        this.session_secret = session_secret;
        this.mailUser = mail.user;
        this.mailTransporter = mailer.createTransport({
            service: mail.service,
            auth: {
                user: mail.user,
                pass: mail.pass
            }
        });

        this.appConfig();
        this.routes = new Routes(app).initRoutes();
    }

    getApp() {
        return this.app;
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

        app.api = (request, handler, next) => {
            const url = '/api/'+request;
            next ? app.post(url, handler, next) : app.post(url, handler);
            app.get(url, (req, res) => {
                res.status(403).type('text/json');
                res.send('Access denied.');
            });
        };

        app.log = (message) => {
            const time = new Date().toISOString();
            console.log("[" + time + "]", message);
        };

        app.getPool = () => {
            return this.pool;
        };

        app.getSchema = () => {
            return this.schema;
        }

        passport.passportConfig(this.app);
    }
}

module.exports = Application;