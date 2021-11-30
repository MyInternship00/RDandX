const config = require('config');
const mongoose = require('mongoose');
const Logger = require('../utils/logger');
const { connectionString } = config.get('dbConfig');

console.log('url is ',connectionString);
const dbConnection = {
    uri: connectionString,
    options: {
        // poolSize: 5,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // useFindAndModify: true,
    },
};

const connectDatabase = async() => {
    Logger.info("connecting database...");
    try {
        await mongoose.connect(dbConnection.uri,dbConnection.options);

        const db = mongoose.connection;
        db.on("error", Logger.error.bind(console, "connection error:"));
        db.once("open", () => {
            Logger.info("Database connected");
        });
    }
    catch (err) {
        Logger.error(err.message);
        return;
    }
}

module.exports = {connectDatabase};

