const { Client } = require('pg');
const pg = require('./config.json').pg;
const schema = pg.schema;

const client = new Client({
    user: pg.user,
    host: pg.host,
    database: pg.database,
    password: pg.password,
    port: pg.port,
});

client.connect(err => {
   if (err)
       console.log(err);
   else setup();
});

function consoleGreen(text) {
    return "\u001b[32m " + text + " \u001b[0m";
}

function consoleRed(text) {
    return "\u001b[31m " + text + " \u001b[0m";
}

function query(query, successMessage, callback) {
    client.query(query, (err, res) => {
        if (!err) {
            if (successMessage) console.log(successMessage + "\n");
            if (callback) callback();
        } else {
            console.log(consoleRed("An error occurred while initializing database!"))
            console.log(err);
            client.end();
        }
    });
}

function setup() {
    let productsInitialized = false;
    let usersInitialized = false;
    let ordersInitialized = false;

    const queryUuidOssp = 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";';
    const productsQuery = "CREATE TABLE IF NOT EXISTS "+schema+".products (productId uuid DEFAULT uuid_generate_v4 (), name VARCHAR(64) NOT NULL, description TEXT NOT NULL, shortdesc TEXT NOT NULL, keywords TEXT, price INTEGER NOT NULL, PRIMARY KEY (productId));";
    const usersQuery = "CREATE TABLE IF NOT EXISTS "+schema+".users (userId uuid DEFAULT uuid_generate_v4 (), login VARCHAR(32) NOT NULL, password VARCHAR(32) NOT NULL, firstName VARCHAR(32), lastName VARCHAR(32), cart JSON, orders JSON, sessionId uuid, PRIMARY KEY (userId), UNIQUE (login), UNIQUE (sessionId));";
    const ordersQuery = "CREATE TABLE IF NOT EXISTS "+schema+".orders (orderId uuid DEFAULT uuid_generate_v4 (), customerId uuid NOT NULL, orderList JSON, PRIMARY KEY (orderId))";

    function installationCheck() {
        if (productsInitialized && usersInitialized && ordersInitialized) {
            console.log(consoleGreen("The database has been successfully initialized!"));
            client.end();
        }
    }

    query(queryUuidOssp, consoleGreen("uuid-ossp extension") + "has been installed!", () => {
        query(productsQuery, consoleGreen("Products") + "table has been initialized!", () => {
            productsInitialized = true;
            installationCheck();
        });
        query(usersQuery, consoleGreen("Users") + "table has been initialized!", () => {
            usersInitialized = true;
            installationCheck();
        });
        query(ordersQuery, consoleGreen("Orders") + "table has been initialized!", () => {
            ordersInitialized = true;
            installationCheck();
        });
    });
}