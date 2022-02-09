const Application = require('./app');
const config = require('./config.json');


let app = new Application();

app.getApp().listen(config.port, config.host);