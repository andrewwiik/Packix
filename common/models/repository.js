'use strict';

const patreonAPI = require('patreon').patreon;
const jsonApiURL = require('patreon').jsonApiURL;
const crypto = require('crypto');

module.exports = function(Repository) {

  Repository.getPatreonInfoAsync = async () => {
    console.log("run");
    try {
      const patreonAPIClient = patreonAPI(process.env['PATREON_CREATOR_ACCESS_TOKEN']);
      const url = jsonApiURL('/current_user/campaigns?include=rewards,creator');

      let results = await patreonAPIClient(url);
      let store = results['store'];
      let camps = store.findAll('campaign');

      let finalCamps = [];
      for (let camp of camps) {
        let campS = camp.serialize();
        let campInfo = {
          id: campS['data']['id'],
          name: campS['data']['attributes']['creation_name'],
          rewards: []
        };

        let rewardsInfo = [];
        let rewardsA = camp.rewards;
        for (let reward of rewardsA) {
          let rewardS = reward.serialize();
          let rewardId = rewardS['data']['id'];
          if (rewardId !== '-1' && rewardId !== '0') {
            campInfo.rewards.push({
              id: rewardS['data']['id'],
              description: rewardS['data']['attributes']['description']
            })
          }
        }
        finalCamps.push(campInfo);
      }

      return {
        'data': finalCamps
      };
    } catch (err) {
      return Promise.reject(err);
    }
  };

  Repository.getPatreonInfo = function(req, cb) {
    if (process.env['USE_PATREON_LOGIN'] === 'YES') {
        Repository.getPatreonInfoAsync().then((data) => {
          return cb(null,data);
        }, (err) => {
          console.log(data);
          return cb(err);
        });
    } else {
      console.log('does not use patreon');
      return cb({});
    }
  }

  Repository.remoteMethod(
    'getPatreonInfo', {
      description: 'Gets Review Posting Information for Package',
      accepts: [
        {arg: 'req', type: 'object', http: {source: 'req'}}
      ],
      returns: {
        type: 'object', root: true
      },
      http: {path:'/patreonInfo', verb: 'get'}
    }
  );
};
