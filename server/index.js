const Application = require('./app');
const config = require('./config.json');


let app = new Application(config.pg);

app.getApp().listen(config.port, config.host);