
const Logger = require('./src/utils/logger');
const {connectDatabase} = require('./src/databases/database');
const {initializeScrapper} = require('./src/scrapper');

const initialize = async()=>{
    await connectDatabase();
    await initializeScrapper();
}

process.on("uncaughtException", (err) => {
    console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
    console.log(err.name, err.message);
    process.exit(1);
  });

initialize();