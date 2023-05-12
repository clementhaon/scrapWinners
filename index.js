const http = require("http");
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config()
const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 5000;
//express
const app = express();
//Cors
app.use("*", cors());
// express configuration here
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use((req, res, next) => {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    //res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});
app.use("/public", express.static(path.join(__dirname, "/public")));

const httpServer = http.createServer(app);
httpServer.listen(PORT, () => {
    console.log(`http server listening on port ${PORT}`)
});

const puppeteer = require('puppeteer');
const {getPickWithUrl} = require('./getPickOfUrl');
 
const vgmUrl = 'https://winnersandwhiners.com/';
const oddsUrl = 'https://www.unibet.fr';

 app.get('/pick-usa', async (req, res) => {
     console.log('dans le pick')
     try {
         const browser = await puppeteer.launch();
         const page = await browser.newPage();
         await page.setDefaultNavigationTimeout(0);
         await page.goto(vgmUrl);

         //const textContent = await page.evaluate(() => document.querySelector('div.pick').textContent);
         //console.log(textContent)
         const selector = 'div.game-index-article-buttons > a'
         await page.waitForSelector(selector)
         const links = await page.$$eval(selector, am => am.filter(e => e.href).map(e => e.href))
         const stringRef = "https://winnersandwhiners.com/nba";
         let arrayLinkFinal = [];

         if (links != undefined && links != null && links.length > 0) {
             for (let i = 0; i < links.length; i++) {
                 if (links[i].includes(stringRef)) {
                     arrayLinkFinal.push(links[i]);
                 }
             }
         }
         console.log(arrayLinkFinal)

         await browser.close();

         for (let i = 0; i < arrayLinkFinal.length; i++) {

             await getPickWithUrl(arrayLinkFinal[i]);
         }
     }
     catch
         (e)
         {
             console.log(e)
         }
     }
 )

 app.get('/all-odds', async (req, res) => {
     console.log('dans le odds')
     try {
         const browser = await puppeteer.launch();
         const page = await browser.newPage();
         await page.setDefaultNavigationTimeout(0);
         await page.goto(oddsUrl);

         const selector = 'div.game-index-article-buttons > a'
         await page.waitForSelector(selector)
         const links = await page.$$eval(selector, am => am.filter(e => e.href).map(e => e.href))
         const stringRef = "https://unibet.fr/";
         let arrayLinkFinalOdd = [];

         if (links != undefined && links != null && links.length > 0) {
             for (let i = 0; i < links.length; i++) {
                 if (links[i].includes(stringRef)) {
                     arrayLinkFinalOdd.push(links[i]);
                 }
             }
         }
         console.log(arrayLinkFinalOdd)

         await browser.close();

         for (let i = 0; i < arrayLinkFinalOdd.length; i++) {

             await getPickWithUrl(arrayLinkFinalOdd[i]);
         }
     }
     catch
         (e)
         {
             console.log(e)
         }
     }
 )

