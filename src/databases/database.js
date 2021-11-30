const config = require('config');
const mongoose = require('mongoose');
const Logger = require('../utils/logger');
const { connectionString } = config.get('dbConfig');

const dbConnection = {
    uri: connectionString,
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
};

const connectDatabase = async () => {
    new Promise((resolve) => {
        Logger.info("connecting database...");
        try {
            const db = mongoose.createConnection(dbConnection.uri, dbConnection.options);
            db.on("error", dbErrorHandler);
            db.once("open", () => {
                Logger.info("Database connected");
                resolve({ error: false });
            });
        }
        catch (err) {
            Logger.error(err.message);
            resolve({ error: true });
        }
    })
}

const dbErrorHandler = (error) => {
    Logger.error("Db connection error");
    Logger.error(error.message);
    process.exit(1);
}

module.exports = { connectDatabase };

