import * as cheerio from 'cheerio';
import * as fs from 'fs';
const puppeteer = require('puppeteer')

const scrapInfo = {
    website: `https://crypto.jobs/`,
    name: `Crypto Jobs`,
  };

const fetchSource = () => {
    return new Promise( async (resolve,reject) => {
    try {
      const browserURL = 'http://127.0.0.1:21222';
        const browser = await puppeteer.connect({browserURL});

        // const browser = await puppeteer.launch({
        //     headless: false
        // })
        const page = await browser.newPage()
        await page.goto(scrapInfo.website,{
            waitUntil: 'load',
            timeout: 0
        })
        let entities = {
          jobs:[
              // {
              //   title: "",
              //   slug: "",
              //   jobType: "",
              //   role: "",
              //   tags: [],
              //   compensation: ["", ""],
              //   location: "",
              //   applyLink: "",
              //   sticky: true,
              //   highlight: true,
              //   remote: false,
              //   description: "",
              //   company: {
              //     name: "",
              //     slug: "",
              //     logo: {},
              //   }
              // }
          ]    
        }


        const html =  await page.evaluate(async () => {
            return document.body.innerHTML;  
        })

        const $ = cheerio.load(html);

        let trs = $('tbody>tr')

        for(let i=3;i<trs.length;i++){
          let job = {}
          job.title = $(trs[i]).find('.job-title').eq(0).text().trim();
          job.company = {};
          job.slug = ''
          job.logo = {};
          job.tags = [];
          job.highlight = false;
          job.compensation = [];
          job.company.name = $(trs[i]).find('.job-url span').eq(0).text().trim();
          job.jobType = $(trs[i]).find('small span').eq(0).text().trim();
          job.role = $(trs[i]).find('small span').eq(1).text().trim();
          job.location = $(trs[i]).find('small span').eq(2).text().trim();
          if(job.location === 'Remote')
            job.remote = true;
          job.sticky = $(trs[i]).find('small span').eq(3)!==null;
          job.date = $(trs[i]).find('span[itemprop="datePosted"]').eq(0).text().trim();
          let link = $(trs[i]).find('.job-url').eq(0).attr('href');
          job.applyLink = link;
          job.description = '';
          console.log(job)
        }
        // browser.close()
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
      console.log(data);
      let resData = {
        name: scrapInfo.name,
        website: scrapInfo.website,
        entities: data,
      };
      fs.writeFile('./results/2.json', JSON.stringify(resData, null, 2), 'utf8', () => {
        console.log('Saved json file')
      });
    })
    .catch();
};

export const scraperModule = {
  processFetch
};
