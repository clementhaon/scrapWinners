const puppeteer = require('puppeteer');
const {getPickWithUrl} = require('./getPickOfUrl');
 
const vgmUrl = 'https://winnersandwhiners.com/';
 
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0); 
  await page.goto(vgmUrl);
 
  //const textContent = await page.evaluate(() => document.querySelector('div.pick').textContent);
    //console.log(textContent)
    const selector = 'div.game-index-article-buttons > a'
    await page.waitForSelector(selector)
    const links = await page.$$eval(selector, am => am.filter(e => e.href).map(e => e.href))
    const stringRef = "https://winnersandwhiners.com/";
    let arrayLinkFinal = [];

    if (links != undefined && links != null && links.length > 0) {
        for(let i = 0; i < links.length; i++) {
            if(links[i].includes(stringRef)) {
                arrayLinkFinal.push(links[i]);
            }
        }
    }
    console.log(arrayLinkFinal)

  await browser.close();

  for(let i = 0; i < arrayLinkFinal.length; i++) {

    await getPickWithUrl(arrayLinkFinal[i]);
    
}
})();
