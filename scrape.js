import { launch, Puppeteer } from 'puppeteer';

export async function scrapeTrendingNews() {
    const url = "https://x.com/megynkelly/status/1893692907665686539";

    const browser = await launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    // Wait for the elements to be present
    await page.waitForSelector('article div[data-testid="UserAvatar-Container"] img', { timeout: 10000 })
        .catch(() => console.log('Profile image selector not found'));

    await page.waitForSelector('article div[data-testid="User-Name"]', { timeout: 10000 })
        .catch(() => console.log('Poster name selector not found'));

    await page.waitForSelector('article div[data-testid="tweetText"] span', { timeout: 10000 })
        .catch(() => console.log('Post content selector not found'));

    await page.waitForSelector('article div[data-testid="tweetPhoto"] img', { timeout: 10000 })
        .catch(() => console.log('Post image selector not found'));

    await page.waitForSelector('article time', { timeout: 10000 })
        .catch(() => console.log('Date selector not found'));

    // Extract the data
    const profileImage = await page.$eval('article div[data-testid="UserAvatar-Container"] img', img => img.src);
    const posterName = await page.$eval('article div[data-testid="User-Name"]', div => div.textContent.trim());
    const postContent = await page.$eval('article div[data-testid="tweetText"] span', span => span.innerText.trim());
    const postImage = await page.$eval('article div[data-testid="tweetPhoto"] img', img => img.src);
    const date = await page.$eval('article time', time => time.textContent.trim());

    await browser.close();
    return { profileImage, posterName, postContent, postImage, date };
}

// Call the function and log the result
(async () => {
    const result = await scrapeTrendingNews();
    console.log(result);
})();
