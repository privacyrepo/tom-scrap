import * as cheerio from 'cheerio';
import * as fs from 'fs';
const puppeteer = require('puppeteer');
import axios from 'axios';

const scrapInfo = {
    website: `https://web3.career/`,
    name: `Web3 Jobs`,
  };

const fetchSource = () => {
    return new Promise( async (resolve,reject) => {
    try {
        const browserURL = 'http://127.0.0.1:21222';
        const browser = await puppeteer.connect({browserURL});

        const page = await browser.newPage()
        await page.goto(scrapInfo.website,{
            waitUntil: 'load',
            timeout: 0
        })
        var html = await page.evaluate(() => {
            return document.body.innerHTML
        })
        const $ = cheerio.load(html);
      
        
        var body = $("table").find("tbody").find("tr");
        var first_descriptions = $("table").find("tbody").find("script");

        var post_date = [];
        var tags = [];
        var title = [];
        var name = [];
        var compensation = [];
        var location = [];
        var description = [];

        $(body).each((_idx, el) => {
           post_date.push($(el).find("time").text().trim());

         var first_tags =  $(el).find("span").find("a");
         var cash_tags = [];
         $(first_tags).each((_idx, el) => {
          cash_tags.push($(el).text().trim());
         })
          tags.push(cash_tags);

        title.push($(el).find("td").first().find("h2").text().trim());
        name.push($(el).find("td:nth-child(2)").find("h3").text().trim());
        compensation.push($(el).find("td:nth-child(5)").find("p").text().trim());
        location.push($(el).find("td:nth-child(4)").text().trim());

        })

        $(first_descriptions).each((_idx, el) => {
           if(_idx % 2 != 1)
           {
           var description_step1 = $(el).text().trim().split(",");

            for(var k=0; k<description_step1.length; k++)
            {
              if(description_step1[k].includes('"description":')){
                var description_step2 = description_step1[k].split(":");
                description.push(description_step2[1]);
              }
            }
           }
        })
        //  browser.close()

         let entities = [];

         for(var i=0; i<title.length ; i++ )   
       {  entities.push({
          "title" : title[i],
          "name(company)"  : name[i],
          "compensation" : compensation[i],
          "location" : location[i],
          "tags" : tags[i],
          "postDate" : post_date[i],
          "description" : description[i]
         })}
         
        resolve(entities)
    } catch (error) {
     reject(error)
      throw error;
    }
});
};

const processFetch = () => {
    fetchSource()
    .then((data) => {
      let resData = {
        type: 'Scrape',
        name: scrapInfo.name,
        website: scrapInfo.website,
        entities: data,
      };
      fs.writeFile('./results/1.json', JSON.stringify(resData, null, 2), 'utf8', () => {
        console.log('Saved json file')
      });
    })
    .catch();
};

export const scraperModule = {
  processFetch
};
