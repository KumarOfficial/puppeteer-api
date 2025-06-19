const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

const app = express();
const port = process.env.PORT || 8000;

app.get('/', (req, res) => {
  res.send('Puppeteer API is running! Try /scrape?url=... or /scrape-posts?url=...');
});

app.get('/scrape', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing url parameter');

  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    const title = await page.title();
    const description = await page.$eval('meta[name="description"]', el => el.content).catch(() => null);
    const html = await page.content();

    res.json({ title, description, url: page.url(), html });
  } catch (err) {
    console.error('Error scraping URL:', err);
    res.status(500).json({ error: 'Failed to scrape URL', details: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.get('/scrape-posts', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing url parameter');

  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    await page.waitForSelector('a');

    const posts = await page.$$eval('a', links => {
      return links
        .map(link => {
          const title = link.innerText.trim();
          const href = link.href;
          if (title && href && href.startsWith('http')) {
            return { title, url: href };
          }
          return null;
        })
        .filter(Boolean);
    });

    res.json({ posts });
  } catch (err) {
    console.error('Error scraping posts:', err);
    res.status(500).json({ error: 'Failed to scrape posts', details: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

