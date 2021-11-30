const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const axios = require("axios");
const Logger = require('./utils/logger');


const PUPPETEER_OPTIONS = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36'
    },
    ignoreHTTPSErrors: true,
    headless: true,
};

const MAX_RETRY = 5;
const BASE_LINK = "https://www.firstpost.com/";
const sections = [{subUrl:'/',maxPagination:5}, {subUrl:'/category/sports',maxPagination:5}, {subUrl:'/category/business',maxPagination:5}];

let BROWSER;
let headLinePge;
let detailedPage;

const initializeScrapper = (async (attempt = 0) => {
    new Promise(async (resolve) => {
        Logger.info('initializing browser....')
        try {

            BROWSER = await puppeteer.launch(PUPPETEER_OPTIONS);
            headLinePge = await BROWSER.newPage();
            detailedPage = await BROWSER.newPage();

            Logger.info("browser initialized..");
            await fetchSections();
            resolve({ error: false });
        } catch (err) {
            Logger.error(err.message);
            Logger.info('Retrying in 2 seconds...');
            if (attempt > 5) {
                Logger.warn("MAX RETRY REACHED....");
                resolve({ error: false });
            }
            setTimeout(() => {
                initialize(++attempt);
            }, 2000);
        }
    })
});

const fetchSections = async(sectionIndex=0)=>{
    try{
            const section = sections[sectionIndex];
            if(!section.subUrl) fetchSections(++sectionIndex);
            Logger.info(`Fetching section : ${section.subUrl}`);
            const maxPage = section.maxPagination || 1;
            for(let page=1;page<=maxPage;page++){
                Logger.info(`Fetching Page : ${page} of section ${section.subUrl}`);
                await headLinePge.goto(BASE_LINK+section,{ timeout: 30000});
                const headLinePgeContent = await headLinePge.content();
                if(!headLinePgeContent) continue;
                await parseHeadLinePage(headLinePgeContent);
            }
            sectionIndex++;
            if(sectionIndex>=sections.length){
                return Logger.log('Fetched all sections');
            }
            fetchSections(sectionIndex);
        
    }catch(err){
        Logger.error(err.message);
        fetchSections(++sectionIndex);
    }
}

const parseHeadLinePage = async (pageContent)=>{
    return new Promise((resolve)=>{
        Logger.info('parsing content');
        $ = cheerio.default.load(pageContent);
        resolve({error:false});
    })
}

module.exports = { initializeScrapper };