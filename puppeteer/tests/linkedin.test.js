const puppeteer = require('puppeteer')
const cookies = require('../www.linkedin.com.cookies.json')

describe('Login test and scrapping "web Developer" jobs offers on Linkedin with desktop', () => {
    let browser;
    let page;

    beforeAll(async () => {
        browser = await puppeteer.launch({ headless: false })
        page = await browser.newPage()
        const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
        await page.setUserAgent(userAgent);
        await page.setViewport({ width: 1280, height: 800 });

        await page.setCookie(...cookies);
    })

    afterAll(async () => {
        await browser.close()
    })

    test('Login with cookies Linkedin before consult jobs offers', async () => {
        await page.goto('https://www.linkedin.com/search/results/content/?keywords=d%C3%A9veloppeurs%20web%20%23hiring&origin=GLOBAL_SEARCH_HEADER&sid=N0O', { waitUntil: "networkidle2" })

        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Check page
        const currentUrl = page.url();
        expect(currentUrl).toContain("linkedin.com/search/results/content");

        // Check post
        const posts = await page.$$("div.feed-shared-update-v2");
        expect(posts.length).toBeGreaterThan(0);

        for (const post of posts) {
            const textContent = await post.evaluate((el) => el.innerText);

            // Check hashtag #hiring
            expect(textContent).toMatch(/#hiring/i);

            // Check author
            const author = await post.$("span.update-components-actor__title");
            expect(author).not.toBeNull();

            // Check seniority
            const timestamp = await post.$("span.update-components-actor__sub-description");
            expect(timestamp).not.toBeNull();
        }
    }, 30000)
})

describe('Login test and scrapping "web Developer" jobs offers on Linkedin with Mobile', () => {
    let browser;
    let page;

    beforeAll(async () => {
        browser = await puppeteer.launch({ headless: false })
        page = await browser.newPage()
        const userAgent = "Mozilla/5.0 (Linux; Android 14; SM-G991U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36"
        // UserAgent S21 : https://whatmyuseragent.com/device/sa/samsung-galaxy-s21-5g
        await page.setUserAgent(userAgent)
        await page.setViewport({width: 360, height:800})
        // Taille S21 - ViewPort : https://blisk.io/devices/details/galaxy-s21

        await page.setCookie(...cookies);
    })

    afterAll(async () => {
        await browser.close()
    })

    test('Login with cookies Linkedin before consult jobs offers', async () => {
        await page.goto('https://www.linkedin.com/search/results/content/?keywords=d%C3%A9veloppeurs%20web%20%23hiring&origin=GLOBAL_SEARCH_HEADER&sid=N0O', { waitUntil: "networkidle2" })

        await new Promise((resolve) => setTimeout(resolve, 3000));
        
        // Check page
        const currentUrl = page.url();
        expect(currentUrl).toContain("linkedin.com/search/results/content");

        // Check posts
        const posts = await page.$$("div.feed-shared-update-v2");
        expect(posts.length).toBeGreaterThan(0);

        for (const post of posts) {
            const textContent = await post.evaluate((el) => el.innerText);

            // Check hashtag #hiring
            expect(textContent).toMatch(/#hiring/i);

            // Check author
            const author = await post.$("span.update-components-actor__title");
            expect(author).not.toBeNull();

            // Check seniority
            const timestamp = await post.$("span.update-components-actor__sub-description");
            expect(timestamp).not.toBeNull();
        }
    }, 30000)
})