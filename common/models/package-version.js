'use strict';

var crypto = require('crypto');

const ipCountry = require('ip-country')

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
})

module.exports = function(Packageversion) {
  const PACKAGES_CONTAINER_NAME = process.env['PACKAGES_CONTAINER_NAME']
  const baseURL = process.env['HOST_URL'];
  const path = require('path');

  Packageversion.downloadPackage = (packageVersion, udid, req, res, cb) => {
    Packageversion.app.models.Container.download(PACKAGES_CONTAINER_NAME, packageVersion.file['url'].substr(packageVersion.file['url'].lastIndexOf('/') + 1), res, cb);

    var downloadInfo = {};
    downloadInfo['packageId'] = packageVersion['packageId'];
    downloadInfo['versionId'] = packageVersion.id;

    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var countryCode = ipCountry.country(ip);
    downloadInfo['device-ip'] = crypto.createHash('sha256').update(ip).digest('base64');

    if (udid && udid.length > 0) {
      downloadInfo['device-udid'] = udid;
    }

    var deviceType = req.headers['HTTP_X_MACHINE'];
    if (!deviceType || deviceType.length < 1) {
      deviceType = req.headers['x-machine'];
    }

    if (!deviceType || deviceType.length < 1) {
      deviceType = req.headers['X-Machine'];
    }

    if (deviceType && deviceType.length > 0) {
      deviceType = deviceType.toLowerCase();
      downloadInfo['device-model'] = deviceType;
    }

    var deviceVersion = req.headers['HTTP_X_FIRMWARE'];
    if (!deviceVersion || deviceVersion.length < 1) {
      deviceVersion = req.headers['x-firmware'];
    }

    if (!deviceVersion || deviceVersion.length < 1) {
      deviceVersion = req.headers['X-Firmware'];
    }

    if (deviceVersion && deviceVersion.length > 0) {
      deviceVersion = deviceVersion.toLowerCase();
      downloadInfo['device-firmware'] = deviceVersion;
    }

    if (countryCode && countryCode.length > 0) {
      downloadInfo['country-code'] = countryCode;
    }

    Packageversion.app.models.PackageDownload.findOrCreate(downloadInfo, function (downloadStatErr, downloadStat, created) {
      if (downloadStatErr) {
        console.log(downloadStatErr);
      }
    });
  };

  Packageversion.prototype.download = function(req,res, cb) {
    Packageversion.findById(this.id, {
      include: ['file', 'package']
    }, function (err, packageVersion) {
      if (err) {
        cb(err, nil);
      } else {
        packageVersion = packageVersion.toJSON();
        console.log(packageVersion.file['url']);

        var udid = req.headers['HTTP_X_UNIQUE_ID'];
        if (!udid || udid.length < 1) {
          udid = req.headers['x-unique-id'];
        }

        if (!udid || udid.length < 1) {
          udid = req.headers['X-Unique-ID'];
        }

        if (!udid || udid.length < 1) {
          udid = req.headers['X-Unique-Id'];
        }

        if (udid && udid.length > 0) {
          udid = udid.toLowerCase();
          udid = crypto.createHash('sha256').update(udid).digest('base64');
        }

        if (packageVersion.package.isPaid) {
          // if (req.)
          if (udid && udid.length > 0) {
            Packageversion.app.models.Device.findOne({
              where: {
                udid: udid
              },
              include: ['account']
            }, (deviceErr, deviceObject) => {
              if (deviceErr) {
                cb(403, 'could not find a device registered with the provided udid');
              } else {
                deviceObject = deviceObject.toJSON();
                if (deviceObject['account']) {
                  Packageversion.app.models.PackagePurchase.findOne({
                    where: {
                      packageId: packageVersion.package.id,
                      accountId: deviceObject.account.id
                    }
                  }, (purchaseErr, purchaseObject) => {
                    if (purchaseErr) {
                      cb(403,'According to our records you have not purchased this package');
                    } else {
                      if (purchaseObject.isComplete) {
                        Packageversion.downloadPackage(packageVersion, udid, req,res,cb);
                      } else {
                        cb(403, 'According to our records you have not purchased this package.')
                      }
                    }
                  })
                } else {
                  cb(403, 'could not find a account linked to this device');
                }
              }
            })
          } else {
            cb(403, 'Must Provide UDID in Headers to verifier as a purchaser');
          }
        } else {

          Packageversion.downloadPackage(packageVersion, udid, req,res,cb);
        }
      }
    });
    // var packageVersion = this;
    // Packageversion.include(packageVersion, 'file', function() {
    //   console.log(packageVersion.file['url']);
    //   Packageversion.app.models.Container.download('packages', packageVersion.file['url'].substr(url.lastIndexOf('/') + 1), res,cb);
    // });
   // Packageversion.app.models.Container.download('packages', this.file.url.substr(url.lastIndexOf('/') + 1), res,cb);
  };

  Packageversion.getDownloadCount = (packageVersionObj) => {
    var promiseGetCount = new Promise((resolve, reject) => {
      Packageversion.app.models.PackageDownload.count({
        versionId: packageVersionObj.id
      }, (err, downloadCount) => {
        if (err) console.log(err);
        resolve(downloadCount);
      });
    });

    return promiseGetCount;
  };

  Packageversion.computeDownloadCount = async (packageVersionObj) => {
    var count = await Packageversion.getDownloadCount(packageVersionObj);
    return count;
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
};
