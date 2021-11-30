const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const axios = require("axios");
const Logger = require('./utils/logger');
const {connectDatabase} = require('./databases/index');
const PUPPETEER_OPTIONS = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36'
    },
    ignoreHTTPSErrors: true,
    headless: true,
};

const MAX_RETRY = 5;
const BASE_LINK = "https://www.firstpost.com/";
const sections = ['/', '/category/sports', '/category/business'];

let BROWSER;
let headLinePge;
let detailedPage;
const initialize = (async (attempt = 0) => {
    await connectDatabase();
    Logger.info('initializing browser....')
    try {

        BROWSER = await puppeteer.launch(PUPPETEER_OPTIONS);
        headLinePge = await BROWSER.newPage();
        detailedPage = await BROWSER.newPage();

        await headLinePge.goto(BASE_LINK, { waitUntil: 'load', timeout: 0 });
        Logger.info("browser initialized..");
    } catch (err) {
        Logger.error(err.message);
        Logger.info('Retrying in 2 seconds...');
        if (attempt > 5) return Logger.warn("MAX RETRY REACHED....");
        setTimeout(() => {
            initialize(++attempt);
        }, 2000);
    }
});



initialize();