const Application = require('./app');
const config = require('./config.json');


let app = new Application(config.pg, config.mail, config.session_secret);

app.getApp().listen(config.port, config.host);