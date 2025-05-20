import express, { json } from 'express';
import cors from 'cors'; // Import CORS
import { launch } from 'puppeteer';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(json());

// Enable CORS for all requests
app.use(cors({ origin: '*' }));

app.get('/scrape', async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const browser = await launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    const profileImage = await page.$eval('img.css-9pa8cd', img => img.src)
      .catch(() => "Profile image selector not found");

      const titleName = await page.$eval(
        'div.css-146c3p1.r-bcqeeo.r-1ttztb7.r-qvutc0.r-37j5jr.r-a023e6.r-rjixqe.r-b88u0q.r-1awozwy.r-6koalj.r-1udh08x.r-3s2u2q span.css-1jxf684.r-bcqeeo.r-1ttztb7.r-qvutc0.r-poiln3',
        span => span.textContent.trim()
      )
      .catch(error => {
        console.error("Error finding title name selector:", error);
        return "Title name selector not found";
      });
      

    // Selector for the user name
    const posterName = await page.$eval('div.css-146c3p1.r-dnmrzs.r-1udh08x.r-1udbk01.r-3s2u2q.r-bcqeeo.r-1ttztb7.r-qvutc0.r-37j5jr.r-a023e6.r-rjixqe.r-16dba41.r-18u37iz.r-1wvb978', div => div.textContent.trim())
      .catch(error => {
        console.error("Error finding poster name selector:", error);
        return "Poster name selector not found";
      });



    const postContent = await page.$eval('article div[data-testid="tweetText"] span', span => span.innerText.trim())
      .catch(() => "Post content selector not found");

    const postImage = await page.$eval('article div[data-testid="tweetPhoto"] img', img => img.src)
      .catch(() => "Profile image selector not found");

    const date = await page.$eval('article time', time => time.textContent.trim())
      .catch(() => "Date selector not found");

    await browser.close();

    res.json({
      profileImage,
      posterName,
      titleName,
      postContent,
      postImage,
      date
    });
  } catch (error) {
    console.error("Scraping error:", error);
    res.status(500).json({ error: 'Error scraping the page' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
