const fs = require("fs");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async function scrape() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
    args: ["--start-maximized"],
    ignoreHTTPSErrors: true,
    // executablePath: "/opt/google/chrome/google-chrome",
    // userDataDir: "/home/dini/.config/google-chrome/Default",
  });

  const page = await browser.newPage();

  // const url = "https://bot.sannysoft.com/";
  const url = "https://www.zillow.com/";

  // Go to page
  await page.goto(url, {
    timeout: 0,
    waitUntil: "domcontentloaded",
  });

  // Type search query
  console.log("type search query");
  const searchSelector = "[aria-label=Search]";
  await page.type(searchSelector, "vancouver", { delay: 300 });

  // Simulate some mouse movement
  await page.mouse.move(100, 100);
  await page.mouse.move(200, 200);
  await new Promise((r) => setTimeout(r, Math.random() * 4000 + 1000)); // Random delay between 1-5 seconds

  await page.keyboard.press("Enter");

  // Simulate some mouse movement
  await page.mouse.move(100, 100);
  await page.mouse.move(200, 200);
  await new Promise((r) => setTimeout(r, Math.random() * 4000 + 1000)); // Random delay between 1-5 seconds

  // role="dialog"

  // /html/body/div[3]/section/div/h3
  // /html/body/div[4]/section/div/h3
  // /html/body/div[4]/section/div/h3
  // What type of listings would you like to see?
  const listingTypeSelector = "section > div > div > div > button:nth-child(3)";
  const listingTypeElement = await page.$(listingTypeSelector);
  if (listingTypeElement) {
    const text = await page.evaluate(
      (el) => el.textContent,
      listingTypeElement
    );
    console.log("Element text:", text);
    listingTypeElement.click();
    // Perform actions on the element if needed
  } else {
    console.log("Element not found");
  }

  page.waitForNavigation({ waitUntil: "domcontentloaded" });

  // /html/body/div[3]/section/div/div/div/button[3]
  // /html/body/div[4]/section/div/div/div/button[3]
  // /html/body/div[4]/section/div/div/div/button[3]
  // #__c11n_oex5m > div > div > button.StyledTextButton-c11n-8-104-2__sc-1nwmfqo-0.gHUboh
  // section > div > div > div > button:nth-child(3)
  // Skip this question
  // Use XPath to find the element
  // const xp = "::-p-xpath(/html/body/div[3]/section/div/div/div/button[3])";
  // // const text = await page.$eval(xp, (element) => element.textContent);
  // const element = await page.$(xp);
  // if (element) {
  //   const text = await page.evaluate((el) => el.textContent, element);
  //   console.log("Element text:", text);
  //   await element.click();
  // } else {
  //   console.log("Element not found using XPath");
  // }

  // await page.click(
  //   "html > body > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div > div:nth-child(2) > div > div > div > div > form > div > div > label > button:nth-child(1)"
  // );

  // const [response] = await Promise.all([
  //   page.waitForNavigation(), // The promise resolves after navigation has finished
  //   page.click('a.my-link'), // Clicking the link will indirectly cause a navigation
  // ]);
  // await page.waitForNavigation({ waitUntil: "domcontentloaded" });
  await page.pdf({ path: "realtor.pdf", format: "A4" });

  // await page.screenshot({ path: "realtor.png" });

  // const body = await page.$eval("body", (body) => body.innerText);

  // fs.writeFile("realtor-body.txt", body, "utf-8", (err) => {
  //   if (err) throw err;
  //   console.log("File Saved");
  // });

  await browser.close();
})();
