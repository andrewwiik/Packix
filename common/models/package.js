'use strict';

const ar = require('ar-async');
const fs = require('fs-extra');
const path = require('path');
const targz = require('tar.gz');
const ControlParser = require('debian-control-parser');
const hashFiles = require('hash-files');
const zlib = require('zlib');
const debParser = require('deb-ctrl-parser');
const cookieDeMangle = require('cookie');
const debian_compare = require("deb-version-compare");
const uuidV4 = require('uuid/v4');

module.exports = function(Package) {

    const PACKAGES_CONTAINER_NAME = process.env['PACKAGES_CONTAINER_NAME']
    const baseURL = process.env['HOST_URL'];

    Package.reload = () => {
    // return;
    let PackagesFile = fs.createWriteStream('../client/static/Packages', {
    });

    // PackagesFile.on('open', function(fd) {
    Package.find({include: {
      versions: 'file'
    }}, (err, packages) => {
      //console.log(packages);
      packages.forEach(function(packageObject) {
        packageObject = packageObject.toJSON();
       // console.log(packageObject.versions);
        packageObject.versions.forEach((packageVersion) => {
           // var packageJSON = packageObject.toJSON();
          if (packageVersion.visible) {
            PackagesFile.write('Package: ' + packageObject.identifier + '\n' +
              'Section: ' + 'Tweaks' + '\n' +
              'Version: ' + packageVersion.version + '\n' +
              'Maintainer: ' + packageObject.maintainer + '\n' +
              'Depends: ' + packageVersion.dependencies + '\n' +
              'Filename: ' + 'api/PackageVersions/' + packageVersion.id + '/download' + '\n' +
              'Size: ' + packageVersion.file.size + '\n' +
              'Architecture: ' + 'iphoneos-arm' + '\n' +
              'Description: ' + packageObject.shortDescription + '\n' +
              'Name: ' + packageObject.name + '\n' +
              'Author: ' + packageObject.author + '\n' +
              'Depiction: ' + 'https://' + baseURL + '/package/' + packageObject.identifier + '\n' +
              'MD5sum: ' + packageVersion.file.md5 + '\n' +
              'SHA1: ' + packageVersion.file.sha1 + '\n' +
              'SHA256: ' + packageVersion.file.sha256 + '\n' +
              'Installed-Size: ' + packageVersion.raw['Installed-Size'] + '\n' + '\n'
            );
          }
        });
      });

      PackagesFile.end();

      fs.createReadStream('../client/static/Packages').pipe(zlib.createGzip()).pipe(fs.createWriteStream('../client/static/Packages.gz'));
    });
  };
  Package.upload = (ctx, options, cb) => {
    console.log('Got Package');
    if (!options) options = {};

    ctx.req.params.container = PACKAGES_CONTAINER_NAME;

    // ctx.req.form.complete(function (err, fields, files) {
    //   console.log(files);

   // console.log(ctx);
    // });
   // ctx.res.writeHead(200, {'Content-Type': 'application/vnd.debian.binary-package'});
   // console.log(ctx.req);
    Package.app.models.Container.upload(PACKAGES_CONTAINER_NAME, ctx.req, (err, fileObj, controlData) => {
      // console.log(err);
      //console.log('upload thing');
      if (err) {
        return cb(err);
      } else {
        var fileInfo = fileObj.metadata;
        var obj = {
          size: fileObj.length,
          name: fileObj.filename,
          type: fileInfo.mimetype,
          md5: fileObj.md5,
          sha1: fileInfo.sha1,
          sha256: fileInfo.sha256,
          date: Date.now(),
          container: fileInfo.container,
          url: 'https://' + baseURL + '/api/containers/' + fileInfo.container + '/download/' + fileObj._id
        };

        var stanza = controlData;

        // if (stanza['Section'] && stanza['Section'].length) {
        Package.app.models.Section.findOrCreate({
          where: {
            name: stanza['Section'] ? stanza['Section'] : 'Tweak'
          }
        }, {
          name: stanza['Section'] ? stanza['Section'] : 'Tweak'
        }, (sectionError, sectionObject, sectionCreated) => {
          if (sectionError) {
            console.log(sectionError);
            cb(sectionError);
            return;
          } else {
            Package.findOrCreate({
              where: {
                identifier: stanza.Package
              }
            }, {
              name: stanza.Name,
              identifier: stanza.Package,
              author: stanza['Author'],
              maintainer: stanza['Maintainer'],
              stage: stanza['Stage'] ? stanza['Stage'] : 'Stable',
              accountId: ctx.req.accessToken.userId,
              sectionId: sectionObject.id

            }, (packageError, packageObject, packageCreated) => {
              if (packageError) {
                console.log(packageError);
                cb(packageError);
                return;
              } else {
                if (!packageCreated) {
                  // if (stanza['Version']) {
                  //   packageObject.latest = stanza['Version'];
                  //   packageObject.save();
                  // }
                }
                Package.app.models.PackageVersion.create({
                  version: stanza['Version'] ? stanza['Version'] : '0.0.1',
                  packageId: packageObject.id,
                  dependencies: stanza['Depends'],
                  raw: stanza
                }, (packageVersionError, packageVersionObject) => {
                  if (packageVersionError) {
                    console.log(packageVersionError);
                    cb(packageVersionError);
                    return;
                  } else {
                    obj['packageVersionId'] = packageVersionObject.id;
                    Package.app.models.PackageFile.create(obj, (packageFileError, packageFileObject) => {
                      if (packageFileError) {
                        console.log(packageFileError);
                        cb(packageFileError);
                        return;
                      } else {
                        packageObject.updateLatestVersion();
                        cb(null, packageObject);
                        Package.reload();
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  Package.prototype.purchase = (ctx, cb) => {
    if (this.isPaid) {
      var parsedCookies = cookieDeMangle.parse(ctx.req.headers.cookie);
      var tokenId = parsedCookies.access_token;
      var userId = parsedCookies.userId;
      var packageName = this.name;
      var packageId = this.id;
      var packageAuthor = this.author;

      console.log(packageName);
      console.log(packageId);
      console.log(packageAuthor);

      console.log(userId);
      console.log(tokenId);
      console.log(this.id);

      if (userId && tokenId && this.id) {
        Package.app.models.PackagePurchase.create({
          accountId: userId,
          packageId: packageId
        }, (packageError, packagePurchase) => {
          if (packageError) {
            cb(packageError.status, packageError.message);
          } else {
            const paymentInfo = {
              'intent': 'sale',
              'payer': {
                'payment_method': 'paypal',
              },
              'redirect_urls': {
                'return_url': 'https://' + baseURL + '/purchases/' + packagePurchase.id + '/success',
                'cancel_url': 'https://' + baseURL + '/purchases/' + packagePurchase.id + '/cancelled',
              },
              'transactions': [{
                'item_list': {
                  'items': [{
                    'name': packageName,
                    'sku': packageId,
                    'price': '1.00',
                    'currency': 'USD',
                    'quantity': 1,
                  }],
                },
                'amount': {
                  'currency': 'USD',
                  'total': '1.00',
                },
                'description': 'Payment for ' + packageName + ' by ' + packageAuthor,
                'invoice_number': packagePurchase.id,
              }],
            };

            Package.app.models.PayPal.payment.create(paymentInfo, (err, payment) => {
              if (err) {
                console.log(err);
                cb(err.status, err.message);
              } else {
                if (payment && payment.id) {
                  packagePurchase.updateAttributes({
                    'purchaseId': payment.id,
                    '_json': payment
                  }, (updateError, updatedObject) => {
                    if (updateError) {
                      cb(updateError.status, updateError.message);
                    } else {
                      for (var i = 0; i < payment.links.length; i++) {
                        var link = payment.links[i];
                        if (link.method === 'REDIRECT') {
                          // ctx.res.redirect(link.href);
                          cb(null, link.href);
                          return;
                        }
                      }
                      cb(500, 'An unknown error occurred');
                    }
                  });
                } else {
                  cb(500, 'An error occurred');
                }
              }
              // console.log(response);
            });
          }
        });
      } else {
        cb(500, 'An error occurred');
      }
    } else {
      cb(404, 'You cannot purchase a free package');
    }
  };

  Package.getLatestVersion = (packageObject) => {
    var versionsPromise = new Promise((resolve, reject)=> {
      // resolve(x);
      Package.app.models.PackageVersion.find({
        where: {
          packageId: packageObject.id
        },
        fields: {
          downloadCount: false
        }
      }, (err, packageVersions) => {
        if (err) {
          console.log(err);
          resolve(null);
        } else {
          let latestVersion = null;
          if (packageVersions && packageVersions.length > 1) {
            packageVersions.sort((a, b) => {
              return debian_compare(b['version'], a['version']);
            });
          }
           // console.log(packageVersions[0]);
            // latestVersion = packageVersions[0];
            // return packageVersions[0];
          if (packageVersions && packageVersions.length > 0) {
          //  console.log(packageVersions[0]);
            latestVersion = packageVersions[0];

            if (latestVersion) {
              Package.app.models.PackageVersion.findById(latestVersion.id, (vError, pVersionFull) => {
                if (vError) {
                  console.log(vError);
                  resolve(null);
                } else {
                  resolve(pVersionFull);
                }
              })
            } else {
              resolve(null);
            }
            //    return packageVersions[0];
          }
        }
      });
    });

    return versionsPromise;
  };


  Package.prototype.updateLatestVersion = async () => {
    let latestVersion = await Package.getLatestVersion(this.toJSON());
    this.updateAttribute("latestVersionId", latestVersion.id,(err, updatedInstance) => {
      if (err) {
        console.log(err);
      } else {
        console.log(updatedInstance);
      }
    })
  };

  Package.computeIsPaid = async (packageObject) => {
    if (packageObject) {
      if (packageObject['price']) {
        if (packageObject['price'] > 0) {
          return true;
        }
      }
    }
    return false;
  };
  //
  // Package.computeLatestVersion = async function(packageObject){
  //   // return null;
  //  var latestVersion = await Package.getLatestVersion(packageObject);
  //  return latestVersion;
  // };

  Package.remoteMethod(
    'purchase', {
      isStatic: false,
      description: 'Redirects the user to purchase the package',
      accepts: [{
        arg: 'ctx',
        type: 'object',
        http: {
          source: 'context'
        }
      }],
      returns: {
        type: 'string', root: true
      },
      http: {
        verb: 'get'
      }
    }
  );

  Package.remoteMethod(
        'upload', {
          description: 'Uploads a Debian Package to the Repository',
          accepts: [{
            arg: 'ctx',
            type: 'object',
            http: {
              source: 'context'
            }
          }, {
            arg: 'options',
            type: 'object',
            http: {
              source: 'query'
            }
          }],
          returns: {
            arg: 'fileObject',
            type: 'object',
            root: true
          },
          http: {
            verb: 'post'
          }
        }
    );
};
