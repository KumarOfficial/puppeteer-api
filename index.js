import express from 'express';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

const app = express();
const port = process.env.PORT || 8000;

app.get('/', (req, res) => {
  res.send('Puppeteer API running! Use /scrape or /scrape-posts with ?url=...');
});

// Endpoint 1: Full HTML + page metadata
app.get('/scrape', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing url parameter' });

  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    const pageTitle = await page.title();

    const pageDescription = await page.$eval(
      'head > meta[name="description"]',
      el => el.content
    ).catch(() => null);

    const pageUrl = page.url();

    const fullHTML = await page.content();

    res.json({
      pageUrl,
      pageTitle,
      pageDescription,
      fullHTML,
    });
  } catch (err) {
    console.error('Error scraping URL:', err);
    res.status(500).json({ error: 'Failed to scrape URL', details: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

// Endpoint 2: List of all posts on the page
app.get('/scrape-posts', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing url parameter' });

  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Change '.post' selector to match posts on your target website
    const posts = await page.$$eval('.post', (posts) =>
      posts.map(post => {
        const titleEl = post.querySelector('a, h2, h3');
        const descEl = post.querySelector('.description, p, span');
        return {
          title: titleEl ? titleEl.innerText.trim() : null,
          url: titleEl ? titleEl.href || titleEl.parentElement?.href || null : null,
          description: descEl ? descEl.innerText.trim() : null,
        };
      })
    );

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

