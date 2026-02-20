#!/usr/bin/env node
/**
 * 將 32 個 IG Story HTML 匯出成 PNG 圖檔，存到 dev-previews/output/
 * 需先安裝: npm install -D puppeteer
 * 執行: node dev-previews/export-story-images.cjs
 */

const fs = require('fs');
const path = require('path');

const TYPES = ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP'];
const VARIANTS = ['A', 'T'];
const DIR = __dirname;
const OUT_DIR = path.join(DIR, 'output');

async function main() {
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch (e) {
    console.error('請先安裝 Puppeteer: npm install -D puppeteer');
    process.exit(1);
  }

  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    console.log('已建立資料夾:', OUT_DIR);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  await page.setViewport({ width: 480, height: 720, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);

  for (const type of TYPES) {
    for (const variant of VARIANTS) {
      const filename = `ig-story-${type}-${variant}.html`;
      const filePath = path.join(DIR, filename);
      if (!fs.existsSync(filePath)) {
        console.log('跳過（找不到）:', filename);
        continue;
      }
      const abs = path.resolve(filePath).replace(/\\/g, '/');
      const fileUrl = (process.platform === 'win32' ? 'file:///' : 'file://') + abs;
      await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 15000 });
      await page.evaluate(() => new Promise(r => setTimeout(r, 500)));

      const el = await page.$('.story-container');
      if (!el) {
        console.log('跳過（無 .story-container）:', filename);
        continue;
      }
      const outPath = path.join(OUT_DIR, `ig-story-${type}-${variant}.png`);
      await el.screenshot({ path: outPath, type: 'png' });
      console.log('已輸出:', path.relative(DIR, outPath));
    }
  }

  await browser.close();
  console.log('\n完成。共', TYPES.length * VARIANTS.length, '張圖，位置:', OUT_DIR);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
