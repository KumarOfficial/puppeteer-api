import express from "express";
import puppeteer from "puppeteer";

const app = express();
const PORT = process.env.PORT || 8000;  // Use 8000 as default or env PORT

app.get("/scrape", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send("Missing ?url param");

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // You can add your scraping logic here, e.g., get page content
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

