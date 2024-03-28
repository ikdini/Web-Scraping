const fs = require("fs");
const puppeteer = require("puppeteer");
const j2cp = require("json2csv").Parser;

(async function scrape() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
  });
  const page = await browser.newPage();
  // await page.goto(
  //   "https://books.toscrape.com/catalogue/category/books/mystery_3/index.html"
  // );
  await page.goto(
    "https://www.jumia.com.ng/mlp-official-stores/computing/#catalog-listing"
  );

  // await page.screenshot({ path: "example.png", fullPage: true });
  // await page.pdf({ path: "example.pdf", format: "A4" });
  // const html = await page.content();
  // const title = await page.evaluate(() => document.title);
  // const text = await page.evaluate(() => {
  //   document.body.textContent;
  // });
  // const links = await page.evaluate(() =>
  //   Array.from(document.querySelectorAll("a")).map((a) => a.href)
  // );

  // const data = await page.evaluate(() =>
  //   Array.from(document.querySelectorAll("article"), (item) => ({
  //     title: item.querySelector("h3 a").getAttribute("title"),
  //     price: item.querySelector(".product_price .price_color").textContent,
  //   }))
  // );

  // const data = await page.$$eval("article", (articles) =>
  //   articles.map((article) => ({
  //     title: article.querySelector("h3 a").getAttribute("title"),
  //     price: article.querySelector(".product_price .price_color").textContent,
  //   }))
  // );
  // console.log(data);
  // fs.writeFile("data.json", JSON.stringify(data, null, 2), "utf-8", (err) => {
  //   if (err) throw err;
  //   console.log("Data has been written to data.json");
  // });

  // const data = await page.$$eval(
  //   "div.-paxs.row._no-g._4cl-3cm-shs > article > a.core > div.info",
  //   (products) =>
  //     products.map((product) => ({
  //       name: product.querySelector("h3.name").textContent,
  //       price: product.querySelector("div.prc").textContent,
  //     }))
  // );

  let hasNextPage = true;
  let data = [];

  while (hasNextPage) {
    const newData = await page.$$eval(
      "div.-paxs.row._no-g._4cl-3cm-shs > article > a.core > div.info",
      (products) =>
        products.map((product) => ({
          name: product.querySelector("h3.name").textContent,
          price: product.querySelector("div.prc").textContent,
        }))
    );

    // Push each product object directly to the data array
    data.push(...newData);

    // Check if the next button is present
    await page.waitForSelector("a.pg");
    const nextButton = await page.$('a.pg[aria-label="Next Page"]');

    if (nextButton) {
      // Click the next button and wait for navigation
      await Promise.all([
        nextButton.click(),
        page.waitForNavigation({ waitUntil: "networkidle0" }),
      ]);
    } else {
      hasNextPage = false;
    }
  }

  console.log(data.length);
  const parser = new j2cp();
  const csv = parser.parse(data);

  fs.writeFile("data2.json", JSON.stringify(data, null, 2), "utf-8", (err) => {
    if (err) throw err;
    console.log("Data has been written to data.json");
  });
  fs.writeFileSync("data2.csv", csv, "utf-8");

  await browser.close();
})();
