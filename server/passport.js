const {Strategy: LocalStrategy} = require("passport-local");
const bcrypt = require("bcryptjs");
const passport = require('passport');

function passportConfig(pool, schema) {
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
                pool.query('SELECT userid, login, password, firstname, lastname, cart, orders, confirmed, is_admin FROM '+schema+'.users WHERE login=$1', [login], (err, result) => {
                    if (err) return done(err);
                    const user = result.rows[0];
                    if (user == null) {
                        return done(null, false, req.flash('message', "Неправильный логин или пароль."));
                    } else {
                        bcrypt.compare(password, user.password, (err, valid) => {
                            if (err) return done(err);
                            if (valid) {
                                console.log(req.body.login + ' -> login');
                                let config = { id: user.userid, login: user.login, firstName: user.firstname, lastName: user.lastname, confirmed: user.confirmed, cart: user.cart, orders: user.orders };
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
                if (!/[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(login))
                    return done(null, false, req.flash('message', "Неверно введен E-Mail."));
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
                                            lastName: req.body.lastName,
                                            confirmed: result.rows[0].confirmed
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

function initialize() {
    return passport.initialize();
}

function session() {
    return passport.session();
}

function authenticate(...args) {
    return passport.authenticate(...args);
}

module.exports = { initialize, session, authenticate, passportConfig };