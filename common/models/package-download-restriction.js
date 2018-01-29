'use strict';

const patreonAPI = require('patreon').patreon;
const jsonApiURL = require('patreon').jsonApiURL;
const crypto = require('crypto');

const clientTypeHeaderNames = ['X-Machine','x-machine', 'HTTP_X_MACHINE'];

const clientTypeForHeaders = async (headers, needsType) => {
  for (let headerName of clientTypeHeaderNames) {
    if (headers[headerName] && headers[headerName].length > 0) {
      return headers[headerName].toLowerCase();
    }
  }
  if (needsType) {
    return Promise.reject(new Error('Client Type Not Defined in Request Headers'));
  } else {
    return "UNKNOWN";
  }
};

const clientVersionHeaderNames = ['X-Firmware','x-firmware', 'HTTP_X_FIRMWARE'];

const clientVersionForHeaders = async (headers, needsVersion) => {
  for (let headerName of  clientVersionHeaderNames) {
    if (headers[headerName] && headers[headerName].length > 0) {
      return headers[headerName].toLowerCase();
    }
  }
  if (needsVersion) {
    return Promise.reject(new Error('Client Version Not Defined in Request Headers'));
  } else {
    return 'UNKNOWN';
  }
  // return Promise.reject(new Error('Client Version Not Defined in Request Headers'));
};

const clientUDIDHeaderNames = ['X-Unique-ID','x-unique-id', 'HTTP_X_UNIQUE_ID'];

const clientUDIDForHeaders = async (headers, needsResult) => {
  for (let headerName of clientUDIDHeaderNames) {
    if (headers[headerName] && headers[headerName].length > 0) {
      return crypto.createHash('sha256').update(headers[headerName].toLowerCase()).digest('base64');
    }
  }
  if (needsResult) {
    return Promise.reject(new Error('Client UDID Not Defined in Request Headers'));
  } else {
    return "UNKNOWN";
  }
};

const clientInfoForRequest = async (req, needsUDID, needsVersion, needsType) => {
  try {
    const headers = req.headers;
    let ip = headers['x-forwarded-for'] || req.connection.remoteAddress;
    ip = crypto.createHash('sha256').update(ip).digest('base64');

    let headerPromises = [
      clientTypeForHeaders(headers, needsType),
      clientVersionForHeaders(headers, needsVersion),
      clientUDIDForHeaders(headers, needsUDID)
    ];

    if (needsUDID) {
      headerPromises.push(clientUDIDForHeaders(headers));
    }

    const clientResults = await Promise.all(headerPromises);

    return {
      "type": clientResults[0],
      "version": clientResults[1],
      "ip": ip,
      "udid": clientResults[2]

    };
  } catch (err) {
    return Promise.reject(err);
  }
};

module.exports = function(Packagedownloadrestriction) {

  const rTypesToMethodN = {
    'patreon-teir': 'patreonTierSatisfied',
    'paypal-payment': 'paypalPaymentSatisfied',
    'device-specific': 'deviceRequirementsSatisfied',
    'udid-group': 'udidGroupRequirementSatisfied'
  };

  Packagedownloadrestriction.satisfied = async (restriction, packageId, clientInfo) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('Restriction: ');
        console.log(restriction);
        if (restriction['type'] === 'patreon-tier') {
          let satisfied = await Packagedownloadrestriction.patreonTierSatisfied(restriction, packageId, clientInfo);
          return resolve(satisfied);
        } else {
          return resolve("false");
        }
      } catch (err) {
        return reject(err);
      }
    });
  };

  Packagedownloadrestriction.processRestrictions = async function(restrictions, req, packageId) {
    try {
      console.log('Restrictions: ');
      console.log(restrictions);
      let restrictionPromises = [];

      const clientInfo = await clientInfoForRequest(req, true, true, true);

      for (let restriction of restrictions) {
        restrictionPromises.push(Packagedownloadrestriction.satisfied(restriction, packageId, clientInfo));
      }

      let results = await Promise.all(restrictionPromises);
      console.log('Results');
      console.log(results);

      for (let result of results) {
        if (result === "true") {
          console.log('We did it');
          return "true";
        }
      }

      return "false";
    } catch (err) {
      return Promise.reject(err);
    }
  };

  Packagedownloadrestriction.patreonTierSatisfied = async (restriction, packageId, clientInfo) => {
    console.log('GOT TO PATREON TEST');

    try {
      let tierIdObjs = restriction['data']['tierIds'];
      let tierIds = [];
      for (let tier of tierIdObjs) {
        tierIds.push(tier['id']);
      }
      let campaignId = restriction['data']['campaignId'];

      console.log('Client Info: ');
      console.log(clientInfo);
      let devices = await Packagedownloadrestriction.app.models.Device.find({
        where: {
          udid: clientInfo['udid']
        },
        include: {
          relation: 'account',
          scope: {
            inlclude: ['profile']
          }
        }
      });

      for (let device of devices) {
        console.log('Device: ');
        console.log(device);
        if (device['account']) {

          let identity = await Packagedownloadrestriction.app.models.UserIdentity.findOne({
            where: {
              userId: device.accountId
            }
          });

          if (identity) {
            if (identity.toJSON) {
              identity = identity.toJSON();
            }

            if (identity['credentials'] && identity['credentials']['accessToken']) {
              const accessToken = identity['credentials']['accessToken'];
              console.log('Access Token: ' + accessToken);
              const patreonAPIClient = patreonAPI(accessToken);
              const url = jsonApiURL('/current_user?include=pledges');

              let results = await patreonAPIClient(url);
              let store = results['store'];
              let pledges = store.findAll('pledge');

              for (let pledge of pledges) {
                if (pledge.reward) {
                  const campId = pledge.reward.campaign.serialize().data.id;
                  const rewardId = pledge.reward.serialize().data.id;
                  if (campId === campaignId && tierIds.includes(rewardId)) {
                    return "true";
                  }
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.log(err);
      return Promise.reject(err);
    }
  };

  Packagedownloadrestriction.paypalPaymentSatisfied = async (restriction, packageId, clientInfo) => {
    return false;
  };

  Packagedownloadrestriction.deviceRequirementsSatisfied = async (restriction, packageId, clientInfo) => {
    return false;
  };

  Packagedownloadrestriction.udidGroupRequirementSatisfied = async (restriction, packageId, clientInfo) => {
    return false;
  };
};
