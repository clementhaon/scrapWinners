const puppeteer = require('puppeteer');

const getPickWithUrl = async (url) => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0); 

  await page.goto(url);
  
  const textContent = await page.evaluate(() => document.querySelector('div.pick').textContent);
  const rating = await page.evaluate(() => document.querySelector('div.rating'));
  const ratingTwo = await page.evaluate(() => document.querySelector('#full-game-total > .rating'));
  const overUnder = await page.evaluate(() => document.querySelector('#full-game-total > .pick').textContent);
  await browser.close();
  return {rating, textContent, ratingTwo, overUnder};

};

module.exports = { getPickWithUrl };