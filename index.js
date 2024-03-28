// const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const j2cp = require("json2csv").Parser;
const fs = require("fs");

// const app = express();
// app.use(express.json());

const url =
  "https://books.toscrape.com/catalogue/category/books/mystery_3/index.html";
const baseUrl =
  "https://books.toscrape.com/catalogue/category/books/mystery_3/";
const data = [];

const JumiaScrape = async (url) => {
  try {
    const htmlData = await axios.get(url);
    // const htmlData = await axios.get(url, {
    //   headers: {
    //     "User-Agent":
    //       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537",
    //   },
    // });

    const $ = cheerio.load(htmlData.data);

    $("article").each(function () {
      const item = {
        title: $(this).find("h3 > a").attr("title"),
        price: $(this).find(".product_price > .price_color").text(),
      };
      data.push(item);
    });

    if ($("li.next > a").length > 0) {
      const nextPage = baseUrl + $("li.next > a").attr("href");
      JumiaScrape(nextPage);
    } else {
      const parser = new j2cp();
      const csv = parser.parse(data);
      fs.writeFileSync("./data.csv", csv, "utf-8");

      console.log(data);
      console.log("End of scraping");
      // server.close(); // Stop the Express server
    }
  } catch (err) {
    console.error(err);
  }
};

JumiaScrape(baseUrl);

// const server = app.listen(process.env.PORT || 4000, () => {
//   console.log("Hello Weby Scrapy");
// });
