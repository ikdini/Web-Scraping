const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

const sleep = (ms = Math.random() * 2000 + 1000) =>
  new Promise((r) => setTimeout(r, ms));

(async function scrape() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
    args: ["--start-maximized"],
    ignoreHTTPSErrors: true,
  });

  const bingPage = await browser.newPage();

  const url = "https://www.bing.com/";

  // const address = "291 King George Terr, Oakville, ON L6K 3P7";
  const address = "british columbia";

  // Go to bing page
  await bingPage.goto(url, {
    timeout: 0,
    waitUntil: "domcontentloaded",
  });

  try {
    // Type search query
    console.info("searching bing");
    await bingPage.type(
      '[type="search"]',
      `${address} real estate listing zillow`,
      {
        delay: 50,
      }
    );
    await sleep();
    await bingPage.click('[type="search"]');
    await bingPage.keyboard.press("Enter");

    await bingPage.waitForNavigation({
      waitUntil: "domcontentloaded",
      timeout: 5000,
    });
  } catch (error) {
    console.info("retry searching bing");
    await bingPage.click('[type="search"]');
    await bingPage.keyboard.press("Enter");

    await bingPage.waitForNavigation({ waitUntil: "domcontentloaded" });
  }

  const realtorcaLink = await bingPage.$$eval("#b_results a", (links) => {
    const realtorLink = links.find((a) => a.href.includes("zillow"));
    return realtorLink ? realtorLink.href : null;
  });

  if (!realtorcaLink) {
    throw new Error("No link containing 'realtor.ca' found");
  }

  console.info(realtorcaLink);

  // Open realtor.ca link
  console.info("opening realtor.ca link");
  await sleep();
  const listingPage = await browser.newPage();
  await sleep();
  await listingPage.goto(realtorcaLink, {
    timeout: 0,
    waitUntil: "load",
  });
  await sleep();

  const touDismissBtn = await listingPage.$("#TOUdismissBtn");
  if (touDismissBtn) {
    await touDismissBtn.click();
    console.info("Clicked Dismiss Button");
  }
  await sleep();

  await listingPage.screenshot({ path: "realtor.png", fullPage: true });

  await bingPage.close();
  await browser.close();
})();
