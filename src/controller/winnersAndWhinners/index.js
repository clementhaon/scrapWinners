const Router = require("express").Router;
const app = Router();
const vgmUrl = 'https://winnersandwhiners.com/';
const puppeteer = require('puppeteer');
const { getPickWithUrl } = require('./getPickOfUrl');

const prediction = async (req, res) => {
    try {
        const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(0);
        await page.goto(vgmUrl);
    
        //const textContent = await page.evaluate(() => document.querySelector('div.pick').textContent);
        //console.log(textContent)
        const selector = 'div.game-index-article-buttons > a'
        await page.waitForSelector(selector)
        const links = await page.$$eval(selector, am => am.filter(e => e.href).map(e => e.href))
        const stringRef = "https://winnersandwhiners.com/games";
        let arrayLinkFinal = [];
        
        if (links != undefined && links != null && links.length > 0) {
            for (let i = 0; i < links.length; i++) {
                if (links[i].includes(stringRef)) {
                    arrayLinkFinal.push(links[i]);
                }
            }
        }
        return res.status(200).json(arrayLinkFinal);
    
    
        await browser.close();
    
        for (let i = 0; i < arrayLinkFinal.length; i++) {
    
            await getPickWithUrl(arrayLinkFinal[i]);
    
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
};
app.get("/", prediction);
module.exports = app;