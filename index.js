import express from "express";
import puppeteer from "puppeteer";

const app = express();
const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.send("🎉 Puppeteer API is live! Use /scrape?url=YOUR_URL");
});

app.get("/scrape", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send("Missing ?url param");

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const content = await page.content();

    await browser.close();

    res.send(content);
  } catch (error) {
    res.status(500).send(`Error scraping URL: ${error.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

