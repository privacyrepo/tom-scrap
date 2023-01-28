import * as cheerio from 'cheerio';
import * as fs from 'fs';
const puppeteer = require('puppeteer')

const scrapInfo = {
    website: `https://www.w3.careers/`,
    name: `Web3 Careers`,
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

        let $ = cheerio.load(html);

        let pageCount = Number($('.pagination .next').eq(0).prev().text().trim());

        for(let i=1;i<=pageCount;i++){
          let link = scrapInfo.website+'?page='+i
          await page.goto(link);
          html = await page.evaluate(async () => {
            return document.body.innerHTML;  
          })
          $ = cheerio.load(html)
          
          let trs = $('.col-sm-8 .card')
          for(let j=0;j<trs.length;j++){
            let job={}
            job.sticky = false;
            job.highlight = true;
            job.description = ''
            job.company={}
            job.company.logo={}
            job.company.slug=''
            job.company.name = $(trs[j]).find('.row .col-md-8 span').eq(0).text().trim();
            job.role = $(trs[j]).find('.row .col-md-8 span').eq(1).text().trim();
            job.location = $(trs[j]).find('.row .col-md-10 span').eq(0).text().trim();
            job.date = $(trs[j]).find('.row .col-md-10 span').eq(1).text().trim();
            job.remote = job.role==='Remote';
            job.title = $(trs[j]).find('.row .col-md-8 .h5 a').eq(0).text().trim();
            job.applyLink = scrapInfo.website+$(trs[j]).find('.row .col-md-8 .h5 a').eq(0).attr('href');
            job.tags = $(trs[j]).find('.row .col-md-8 > div').eq(1).text().trim().split('\n').map(i=>i.trim());
            entities.jobs.push(job)
            console.log(job)
          }
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
      fs.writeFile('./results/4.json', JSON.stringify(resData, null, 2), 'utf8', () => {
        console.log('Saved json file')
      });
    })
    .catch();
};

export const scraperModule = {
  processFetch
};
