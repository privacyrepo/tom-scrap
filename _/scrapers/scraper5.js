import * as cheerio from 'cheerio';
import * as fs from 'fs';
const puppeteer = require('puppeteer')

const scrapInfo = {
    website: `https://cryptocurrencyjobs.co/web3/`,
    name: `Cryptocurrency jobs`,
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

        let html =  await page.evaluate(async () => {
            return document.body.innerHTML;  
        })

        const $ = cheerio.load(html);

        let trs = $('.ais-Hits-item')
        console.log(trs.length)

        for(let i=0;i<trs.length;i++){
          let job = {}
          job.description = '';
          job.company = {};
          job.title = $(trs[i]).find('.row-start-2 h2 a').eq(0).text().trim();
          job.applyLink = $(trs[i]).find('.row-start-2 h2 a').eq(0).attr('href');
          job.date = $(trs[i]).find('.col-start-3  span').eq(0).text().trim();
          job.company.name = $(trs[i]).find('.row-start-2 h2 a').eq(0).text();
          job.company.slug = '';
          job.company.logo = {};
          job.tags = $(trs[i]).find('.col-end-2 ul').eq(2).text().split('  ').filter(i=>i.trim()!=='').map(i=>i.trim());
          job.remote = $(trs[i]).find('.col-end-2 ul').eq(0).text() == 'Remote'
          job.role = $(trs[i]).find('.col-end-2 h4').eq(1).text().trim()
          job.jobType = $(trs[i]).find('.col-end-2 ul').eq(1).text().trim()
          job.compensation = $(trs[i]).find('.col-end-2 ul').eq(1).next().next().text().trim().split('–').map(i=>i.trim())
          entities.jobs.push(job)
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
      let resData = {
        name: scrapInfo.name,
        website: scrapInfo.website,
        entities: data,
      };
      fs.writeFile('./results/5.json', JSON.stringify(resData, null, 2), 'utf8', () => {
        console.log('Saved json file')
      });
    })
    .catch();
};

export const scraperModule = {
  processFetch
};
