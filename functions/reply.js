const reddit = require('../reddit');

/**
* Reply to a top level post or comment
* @param {string} parent What to reply to
* @param {string} text Message to post (markdown)
* @returns {any}
*/
module.exports = (parent, text, context, callback) => {
  if (parent.startsWith('t1_')) {
    reddit
      .getComment(parent)
      .reply(text)
      .then(result => {
        return callback(null, result);
      })
      .catch(error => {
        return callback(error);
      });
  } else {
    reddit
      .getSubmission(parent)
      .reply(text)
      .then(result => {
        return callback(null, result);
      })
      .catch(error => {
        return callback(error);
      });
  }
};
