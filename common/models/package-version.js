'use strict';

var crypto = require('crypto');

const ipCountry = require('ip-country');

// Initiate the module with custom options.
ipCountry.init({
  // You can specify the path to a custom MMDb file if you want
  // more details about IP addresses (like, city, zipcode, population).
  // Note: For most cases the default MMDb file should be enough.
  // Note: You can find free Dbs here: http://dev.maxmind.com/geoip/geoip2/geolite2/
  // Note: Big MMDb files will use more memory and lookups will be slower.
  mmdb: 'server/assets/geoip.mmdb',

  // Return a default country when the country can not be detected from the IP.
  fallbackCountry: 'US',

  // Expose full IP lookup info in the request (`res.locals.IPInfo`).
  exposeInfo: false
});

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
    const countryCode = ipCountry.country(ip);
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
      "country": countryCode,
      "udid": clientResults[2]

    };
  } catch (err) {
    return Promise.reject(err);
  }
};


const sanitizeString = (value) => {
  return value
    .replace(/&/, "&amp;")
    .replace(/</, "&lt;")
    .replace(/>/, "&gt;")
    .replace(/"/, "&quot;")
    .replace(/'/, "&apos;");
}




module.exports = function(Packageversion) {

  const PACKAGES_CONTAINER_NAME = process.env['PACKAGES_CONTAINER_NAME']
  const baseURL = process.env['HOST_URL'];
  const path = require('path');

  Packageversion.downloadPackage = (packageVersion, clientInfo, res, cb) => {
    Packageversion.app.models.Container.download(PACKAGES_CONTAINER_NAME, packageVersion.file.fileDownloadId, res, cb);

    var downloadInfo = {};
    downloadInfo['packageId'] = packageVersion['packageId'];
    downloadInfo['packageVersionId'] = packageVersion.id;
    downloadInfo['clientIp'] = clientInfo['ip'];
    downloadInfo['clientUDID'] = clientInfo['udid'];
    downloadInfo['clientType'] = clientInfo['type'];
    downloadInfo['clientVersion'] = clientInfo['version'];
    downloadInfo['clientCountry'] =  clientInfo['country'];

    let findInfo = {};
    findInfo['clientUDID'] = clientInfo['udid'];
    findInfo['packageId'] = packageVersion['packageId'];
    findInfo['packageVersionId'] = packageVersion.id;

    Packageversion.app.models.PackageDownload.findOrCreate({
      where: findInfo
    },downloadInfo, function (downloadStatErr, downloadStat, created) {
      if (downloadStatErr) {
        console.log(downloadStatErr);
      }
    });
  };

  Packageversion.handleCanDownloadPackage = async (req,packageVersionId) => {
    let reqObj = req;
    return new Promise(async (resolve, reject) => {
      try {
        let packageVersionObj = await Packageversion.findById(packageVersionId, {
          include: [{
            relation: 'file'
          }, {
            relation: 'package',
            scope: {
              include: ['downloadRestrictions']
            }
          }]
        });

        if (packageVersionObj.toJSON) {
          packageVersionObj = packageVersionObj.toJSON();
        }

        if (packageVersionObj.package.downloadRestrictions && packageVersionObj.package.downloadRestrictions.length > 0) {

          const clientInfo = await clientInfoForRequest(req,true, true, true);
          let restrictions = packageVersionObj.package.downloadRestrictions;
          let canDownload = await Packageversion.app.models.PackageDownloadRestriction.processRestrictions(restrictions, reqObj, packageVersionObj.package.id);
          console.log('can download: '+ canDownload);
          if (canDownload === "true") {
            resolve({
              canDownload: true,
              clientInfo: clientInfo,
              packageVersionObj: packageVersionObj
            });
          } else {
            resolve({
              canDownload: false,
              clientInfo: clientInfo,
              packageVersionObj: packageVersionObj
            });
          }
        } else {
          const clientInfo = await clientInfoForRequest(req,false, false,false);
          resolve({
            canDownload: true,
            clientInfo: clientInfo,
            packageVersionObj: packageVersionObj
          });
          //return Packageversion.downloadPackage(packageVersionObj, clientInfo, res,cb);
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  Packageversion.prototype.download = function(req,res, cb) {

    // cb = function(arg1, arg2) {
    //   console.log('callback called');
    // };
    // return cb({
    //   name: 'Unauthorized',
    //   status: 401,
    //   message: 'You are not authorized to download this package, if it is paid you need to either purchase it or link' +
    //   ' your device to the account you bought the package with.'
    // });


    const versionObjId = this.id;

    Packageversion.handleCanDownloadPackage(req, versionObjId).then((result) => {
      if (result.canDownload === true) {
        return Packageversion.downloadPackage(result.packageVersionObj, result.clientInfo, res, cb);
      } else {
        return cb({
          name: 'Unauthorized',
          status: 402,
          message: 'You are not authorized to download this package, if it is paid you need to either purchase it or link' +
          ' your device to the account you bought the package with.'
        });
      }
    }, (err) => {
      console.log(err);
      return cb({
        name: 'Server Error',
        status: 400,
        message: 'A server error occured'
      });
      // return cb({ error: {
      //   name: 'Server Error',
      //   statusCode: 400,
      //   message: 'An error occured on the server, please contact the repo maintainer'
      // }});
    });
  };

  Packageversion.getDownloadCount = async (packageVersionObj) => {
    try {
      let downloadCount = Packageversion.app.models.PackageDownload.count({
        packageVersionId: packageVersionObj.id
      });

      console.log(packageVersionObj.id);

      return downloadCount;
    } catch (err) {
     return Promise.reject(err);
    }
  };

  Packageversion.computeDownloadCount = async function(packageVersionObj) {
    return await Packageversion.getDownloadCount(packageVersionObj);
  };

  Packageversion.remoteMethod(
    'download',
    {
      isStatic: false,
      accepts: [
        {arg: 'req', type: 'object', http: {source: 'req'}},
        {arg: 'res', type: 'object', 'http': {source: 'res'}}
      ],
      http: {path:'/download', verb: 'get'},
      returns: {}
    }
  );

  Packageversion.handleRate = async (packageVersionObj, req, rating) => {
    return new Promise(async (resolve, reject) => {
      try {
        const clientInfo = await clientInfoForRequest(req, false, false, true);
        const data = {
          packageId: packageVersionObj.packageId,
          packageVersionId: packageVersionObj.id,
          clientIp: clientInfo['ip'],
          clientType: clientInfo['type']
        };

        let createData = Object.assign({}, data);
        createData['value'] = rating;

        let previousRatingResult = await Packageversion.app.models.PackageVersionRating.findOrCreate({
          where: data
        }, createData);

        let previousRating = previousRatingResult[0];
        if (previousRatingResult[1] === false) {
          previousRating = await previousRating.updateAttribute('value', rating);
        }
        resolve(previousRating);
      } catch (err) {
        reject(err);
      }
    });
  };


  Packageversion.prototype.rate = function(req, rating, cb) {
    if (rating >= 1 && rating <= 5 && (rating % 1 === 0)) {
      const packageVersionObj = this;
      Packageversion.handleRate(packageVersionObj, req, rating).then((result) => {
        return cb(null,result);
      }, (err) => {
        return cb(err);
      });
    } else {
     return cb(400,'Not a valid Rating');
    }
  };

  Packageversion.remoteMethod(
    'rate',
    {
      isStatic: false,
      accepts: [
        {arg: 'req', type: 'object', http: {source: 'req'}},
        {arg: 'rating', type: 'string', http: { source: 'query' } },
      ],
      http: {path:'/rate', verb: 'get'},
      returns: {type: 'any', root: true}
    }
  );

  Packageversion.handleReview = async (packageVersionObj, req, title, description) => {
    return new Promise(async (resolve, reject) => {
      try {
        const clientInfo = await clientInfoForRequest(req, false, false, true);
        const data = {
          packageId: packageVersionObj.packageId,
          packageVersionId: packageVersionObj.id,
          clientIp: clientInfo['ip'],
          clientType: clientInfo['type'],
          versionName: packageVersionObj.version
        };

        let createData = Object.assign({}, data);
        createData['title'] = title;
        createData['description'] = description;

        let previousReviewResult = await Packageversion.app.models.PackageVersionReview.findOrCreate({
          where: data
        }, createData);

        let previousReview = previousReviewResult[0];
        if (previousReviewResult[1] === false) {
          previousReview = await previousReview.updateAttributes({
            title: title,
            description: description
          });
        }
        resolve(previousReview);
      } catch (err) {
        reject(err);
      }
    });
  };


  Packageversion.prototype.review = function(req, title, description, cb) {
    if (title && description) {
      title = sanitizeString(title);
      description = sanitizeString(description);
      const packageVersionObj = this;
      Packageversion.handleReview(packageVersionObj, req, title, description).then((result) => {
        return cb(null,result);
      }, (err) => {
        return cb(err);
      });

    } else {
      cb(400, 'Invalid');
    }
  };

  Packageversion.remoteMethod(
    'review',
    {
      isStatic: false,
      accepts: [
        {arg: 'req', type: 'object', http: {source: 'req'}},
        {arg: 'title', type: 'string'},
        {arg: 'description', type: 'string'}
      ],
      http: {path:'/review', verb: 'post'},
      returns: {type: 'any', root: true}
    }
  );
};
