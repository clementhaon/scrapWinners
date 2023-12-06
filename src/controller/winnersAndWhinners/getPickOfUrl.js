const puppeteer = require('puppeteer');

const getPickWithUrl = async (url) => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0); 

  await page.goto(url);
  
  const textContent = await page.evaluate(() => document.querySelector('div.pick').textContent);
  const rating = await page.evaluate(() => document.querySelector('div.rating'));
  console.log(rating);
    console.log(textContent);
    const ratingTwo = await page.evaluate(() => document.querySelector('#full-game-total > .rating'));
    console.log(ratingTwo);
    const overUnder = await page.evaluate(() => document.querySelector('#full-game-total > .pick').textContent);
    console.log(overUnder);
    await browser.close();

};

module.exports = { getPickWithUrl };