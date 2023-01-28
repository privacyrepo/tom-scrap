import * as cheerio from 'cheerio';
import * as fs from 'fs';
const puppeteer = require('puppeteer')

const scrapInfo = {
    website: `https://jobs3.io/jobs/`,
    name: `Jobs3.io`,
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

        let trs = $('.wp-jobsearch-dev-job-content li.jobsearch-column-12')
        console.log(trs.length)

        for(let i=0;i<trs.length;i++){
          let job = {}
          job.company = {};
          job.title = $(trs[i]).find('.jobsearch-pst-title a').eq(0).text().trim();
          job.date = $(trs[i]).find('.jobsearch-calendar').eq(0).parent().text().trim();
          let t = ($(trs[i]).find('.jobsearch-salary').eq(0).parent().text().trim().split(' '))
          if(t.length==2){
            let _salarys = (t)[1].split('-');
            job.compensation = [];
            job.compensation.push(_salarys[0]+'k')
            job.compensation.push('$'+_salarys[1])
          }
          job.company.name = $(trs[i]).find('.job-company-name').eq(0).text();
          job.company.slug = job.company.name + '' + job.title;
          job.logo = {};
          // let link = $(trs[i]).find('.job-company-name a').eq(0).attr('href');
          job.tags = $(trs[i]).find('.jobsearch-filter-tool-black-shape').eq(0).parent().text().trim().split(',').map(t=>t.trim());
          job.applyLink = $(trs[i]).find('a.applynowbtn').eq(0).attr('href');
          job.remote = $(trs[i]).find('a.applynowbtn').eq(1).text() == 'Remote'
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
      fs.writeFile('./results/3.json', JSON.stringify(resData, null, 2), 'utf8', () => {
        console.log('Saved json file')
      });
    })
    .catch();
};

export const scraperModule = {
  processFetch
};
