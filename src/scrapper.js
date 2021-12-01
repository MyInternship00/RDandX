const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const axios = require("axios");
const Logger = require('./utils/logger');
const { child } = require('./utils/logger');
const { find } = require('domutils');
const { children } = require('cheerio/lib/api/traversing');
const { Logform } = require('winston');

const { saveSection } = require('./utils/fileManagement');
const { data } = require('cheerio/lib/api/attributes');

const PAGE_NAVIGATION_TIMEOUT = 30000; 

const PUPPETEER_OPTIONS = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36'
    },
    ignoreHTTPSErrors: true,
    headless: true,
};

const MAX_RETRY = 5;
const BASE_LINK = "https://www.firstpost.com/";
const sections = [{ subUrl: '/', maxPagination: 1 }, { subUrl: '/category/sports', maxPagination: 1 }, { subUrl: '/category/business', maxPagination: 5 }];

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

const fetchSections = async (sectionIndex = 0) => {
    try {
        if (sectionIndex > sections.length - 1) {
             Logger.info('Fetched all sections');
             return process.exit(0);
        }
        const section = sections[sectionIndex];
        if (!section.subUrl) fetchSections(++sectionIndex);
        Logger.info(`Fetching section : ${section.subUrl}`);
        const maxPage = section.maxPagination || 1;
        for (let page = 1; page <= maxPage; page++) {
            Logger.info(`Fetching Page : ${page} of section ${section.subUrl}`);
            await headLinePge.goto(BASE_LINK + section.subUrl, { timeout: PAGE_NAVIGATION_TIMEOUT });
            const headLinePgeContent = await headLinePge.content();
            if (!headLinePgeContent) continue;
            console.log(section);
            await parseHeadLinePage(headLinePgeContent, section.subUrl);
        }
        fetchSections(++sectionIndex);

    } catch (err) {
        Logger.error(err.message);
        fetchSections(++sectionIndex);
    }
}

const parseHeadLinePage = async (pageContent, url) => {
    return new Promise( async (resolve) => {
        $ = cheerio.load(pageContent);

        let sectionData = {};

        if(url == '/'){
            sectionData['category'] = 'mainPage'; 
            sectionData['posts'] = [];
        }

        $('#home-wrapper .container .main-container .main-content').children((i, el) => {
            if($(el).attr('class') == 'big-thumb'){
                temp = {}
                $(el).children((j, data) => {
                    if($(data).attr('class') == 'thumb-img'){
                        temp['link'] = $(data).attr('href');
                        temp['img'] = $(data).find('img').attr("src");
                    } else if ($(data).attr('class') == 'title-wrap'){
                        temp['title'] = $(data).find('.main-title a').text().trim();
                        temp['desc'] = $(data).find('.copy').text().trim();
                    }
                })

                sectionData.posts.push(temp);
            }   
        });

        await saveSection(sectionData);
        
        resolve({ error: false });
    })
}

const fetchDetaildPage = async()=>{
    Logger.info("fetching detail page...");
}

module.exports = { initializeScrapper };