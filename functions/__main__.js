const reddit = require('../reddit');
const lib = require('lib')({ token: process.env.STDLIB_TOKEN });

/**
* Reads the newest comments from subreddit and responds if a keyword is found
* @param {string} subreddit
* @returns {any}
*/
module.exports = (subreddit = 'ethtrader', context, callback) => {
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

          let banner_url = '';
          if (validComments.length > 0) {
             return lib[`${context.service.identifier}.parseHTML`]({
              url: 'https://www.reddit.com/r/ethtrader/'
            }).then(banner_url => {
              let replyPromises = validComments.map(comment => {
                let response = `r/ethtrader community banner image link: [${banner_url}](${banner_url})`

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
          } else {
            return callback(null, 'no matching comments');
          }
        })
        .catch(error => {
          return callback(error);
        });
    });
};

const KEYWORDS = ['!bannerbot'];