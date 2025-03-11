const puppeteer = require('puppeteer')
const cookies = require('./www.linkedin.com.cookies.json')

const autoScroll = async page => {
    let previousHeight
    while(true){
        previousHeight = await page.evaluate('document.body.scrollHeight')
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
        await new Promise(resolve => setTimeout(resolve,2000))
        let newHeight = await page.evaluate('document.body.scrollHeight')
        console.log("Comparing : ", newHeight, " And : ",previousHeight)
        //if(newHeight === previousHeight) break
        if(newHeight > 10000) break // Limit newHeight scroll to 10000 pexels
    }
}

const scrapLinkedin = async (deviceType, url) => {
    try {
        const browser = await puppeteer.launch({
            headless: false,
        })
        const page = await browser.newPage()
        
        // Device configuration (Desktop ou Mobile)
        if (deviceType === "Desktop") {
            await page.setUserAgent(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            );
            await page.setViewport({ width: 1280, height: 800 });
        } else {
            await page.setUserAgent(
            "Mozilla/5.0 (Linux; Android 14; SM-G991U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36"
            );
            await page.setViewport({ width: 360, height: 800 });
        }

        await page.setCookie(...cookies);

        console.log("Page Set")

        await page.goto(url, { waitUntil: "networkidle2" })
        console.log("Url loaded")

        await new Promise((resolve) => setTimeout(resolve, 3000));

        // check page
        const currentUrl = page.url();
        if (!currentUrl.includes("linkedin.com/search/results/content")) {
            throw new Error("Problem connecting to Linkedin !");
        }
        console.log("Success connexion with Linkedin");

        // Auto-scroll to load more results
        console.log("Automatic scrolling to load more posts");
        await autoScroll(page);
        console.log("End of scrolling");

        const posts = await page.$$("div.feed-shared-update-v2");
        if (posts.length === 0) {
            throw new Error("No post found !");
        }
        console.log(`${posts.length} posts found.`);

        let postsData = [];

        for (const post of posts) {
            const textContent = await post.evaluate((el) => el.innerText);
            const hasHiringTag = textContent.includes("#hiring") ? "OUI" : "NON";
      
            // Post author recovery
            const authorElement = await post.$("span.update-components-actor__title");
            const author = authorElement
              ? await authorElement.evaluate((el) => el.innerText.trim())
              : "Author unknown";
      
            // Post seniority recovery
            const timestampElement = await post.$(
              "span.update-components-actor__sub-description"
            );
            const timestamp = timestampElement
              ? await timestampElement.evaluate((el) => el.innerText.trim())
              : "No specified";
      
            // Add information to the table
            postsData.push({
              Auteur: author,
              "Post text": textContent.substring(0, 100) + "...", // Cut text if it overlong
              "#Hiring": hasHiringTag,
              "Seniority": timestamp,
            });
        }
      
        // Table display in the console
        if (postsData.length > 0) {
            console.table(postsData);
        } else {
            console.log("No valid post found.");
        }
    }
    catch(e){
        console.error(e)
        return
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

scrapLinkedin("Desktop", "https://www.linkedin.com/search/results/content/?keywords=d%C3%A9veloppeurs%20web%20%23hiring&origin=GLOBAL_SEARCH_HEADER&sid=N0O")
