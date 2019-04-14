const reddit = require('../reddit');
const lib = require('lib')({ token: process.env.STDLIB_TOKEN });

/**
* Reads the newest comments from subreddit and responds if a keyword is found
* @param {string} subreddit
* @returns {any}
*/
module.exports = (subreddit = 'ethtrader', context, callback) => {
  if (context.user && context.user.username !== context.service.path[0]) {
    return callback(new Error('Invalid library token'));
  }

  lib.utils.storage
    .get('commentsRepliedTo')
    .then(comments => {
      return comments || {};
    })
    .then(commentsRepliedTo => {
      reddit
        .getSubreddit(subreddit)
        .getNewComments()
        .then(listing => {
          let comments = listing.map(comment => {
            return {
              name: comment.name,
              body: comment.body.toLowerCase()
            };
          });

          let validComments = comments.filter(comment => {
            return KEYWORDS.some(keyword => {
              return (
                comment.body.indexOf(keyword) !== -1 && !(comment.name in commentsRepliedTo)
              );
            });
          });

          let replyPromises = validComments.map(comment => {
            let response = RESPONSES.find((response, index) => {
              return comment.body.includes(KEYWORDS[index]);
            });

            // return callback(null, [comment.name, response])

            return lib[`${context.service.identifier}.reply`]({
              'parent': comment.name,
              'text': response
            }).then(result => {
              return result;
            });
          });

          return Promise.all(replyPromises).then(results => {
            // return callback(null, results)
            results.map(result => {
              commentsRepliedTo[result.parent_id] = true;
            });
            lib.utils.storage
              .set('commentsRepliedTo', commentsRepliedTo)
              .then(_results => {
                return callback(null, results);
              });
          });
        })
        .catch(error => {
          return callback(error);
        });
    });
};

const KEYWORDS = ['!bannerbot']; //phrases or single words
const RESPONSES = [
  "successful connection made."
]; // response for the keyword with the same index
