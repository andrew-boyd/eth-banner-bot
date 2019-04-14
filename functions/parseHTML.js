const rp = require('request-promise');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

/**
* @param {string} url The URL you wish to parse
* @returns {any}
*/
module.exports = (url, context, callback) => {
  return parsedContent = new Promise((resolve, reject) => {
    rp(url).then(function(dom) {
      let regex = /(?<=--newCommunityTheme-banner-backgroundImage: )(.*?)(;)/g;
      let url = dom.match(regex)
      callback(null, url[0].slice(0, -1))
    });
  })
};
