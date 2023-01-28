const main = () => {
  const parameterArgs = process.argv.slice(2);
  console.log('envs: ', parameterArgs);
  const filePath = `./scrapers/scraper${parameterArgs[0]}.js`;
  console.log('file path: ', filePath);
  delete require.cache[filePath];
  // Load function from file.
  let scraperModule = require(filePath)['scraperModule'];
  scraperModule.processFetch();
};

main();
