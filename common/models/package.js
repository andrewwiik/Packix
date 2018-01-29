'use strict';

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
const ar = require('ar');
const crypto = require('crypto');
const tar = require('tar-stream');
const gunzip = require('gunzip-maybe');
const sbuff = require('simple-bufferstream');
const FormData = require('form-data');
const multiparty = require('multiparty');
const concat = require('concat-stream');
const stream_node = require('stream');
const httpMocks = require('node-mocks-http');
const sharp = require('sharp');

const getHashForBuffer = async (hashType, bufferData) => {
  let promiseObj = new Promise((resolve, reject) => {
    let bufferStream = new stream_node.PassThrough();
    bufferStream.end(bufferData);
    bufferStream.pipe(crypto.createHash(hashType).setEncoding('hex')).on('finish', function () {
      let finalHash = this.read();
      resolve(finalHash);
    });
  });

  return promiseObj;
};

const getControlDataForBuffer = async (bufferData) => {
  let promiseObj = new Promise((resolve, reject) => {
    let archive = new ar.Archive(bufferData);
    let files = archive.getFiles();
    console.log('Files: ' + files);
    for (let i = 0; i < files.length; i++) {
      let fileObj = files[i];
      if (fileObj.name() === 'control.tar.gz') {
        console.log('File Obj: ' + fileObj);
        let controlExtract = tar.extract();

        controlExtract.on('entry', function (header, stream, next) {
          if (header.name.indexOf('control') !== -1) {
            let controlObj = ControlParser(stream);
            console.log('Control Obj' + controlObj);
            controlObj.on('stanza', (stanza) => {
              console.log('Stanza: ' + stanza['Name']);
              resolve(stanza);
            })
          } else {
            next();
          }
        });

        sbuff(fileObj.fileData()).pipe(gunzip()).pipe(controlExtract);
      }
    }
  });

  return promiseObj;
};

// const bufferToRequest = async (bufferData, fileName, fileType) => {
//   let promiseObj = new Promise((resolve, reject) => {
//     let form = new FormData();
//     form.append('file', bufferData, {
//       filename: fileName, // ... or:
//       contentType: fileType
//     });
//
//     console.log('Form: ' + form);
//
//     let requestObj = httpMocks.createRequest({
//       method: 'POST',
//       url: '/',
//       headers: form.getHeaders()
//     });
//
//     form.pipe(requestObj);
//
//     //let requestObj = form.submit();
//     console.log('Request Obj', requestObj);
//     resolve(requestObj);
//   });
//
//   return promiseObj;
// };

const bufferToStream = async (bufferData) => {
  let promiseObj = new Promise((resolve, reject) => {
    let bufferStream = new stream_node.PassThrough();
    bufferStream.end(bufferData);
    resolve(bufferStream);
  });

  return promiseObj;
};

const clientTypeHeaderNames = ['X-Machine','x-machine', 'HTTP_X_MACHINE'];

const clientTypeForHeaders = async (headers) => {
  for (let headerName of clientTypeHeaderNames) {
    if (headers[headerName] && headers[headerName].length > 0) {
      return headers[headerName].toLowerCase();
    }
  }
  return Promise.reject(new Error('Client Type Not Defined in Request Headers'));
};

const clientVersionHeaderNames = ['X-Firmware','x-firmware', 'HTTP_X_FIRMWARE'];

const clientVersionForHeaders = async (headers, needsVersion) => {
  if (!needsVersion === false) return "UNKNOWN";
  for (let headerName of  clientVersionHeaderNames) {
    if (headers[headerName] && headers[headerName].length > 0) {
      return headers[headerName].toLowerCase();
    }
  }

  return 'UNKNOWN';
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
    return "";
  }
};

const clientInfoForRequest = async (req, needsUDID, needsVersion) => {
  try {
    const headers = req.headers;
    console.log(headers);
    let ip = headers['x-forced-ip'] || headers['x-forwarded-for'] || req.connection.remoteAddress;
    ip = crypto.createHash('sha256').update(ip).digest('base64');

    let headerPromises = [
      clientTypeForHeaders(headers),
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
      "country": '',
      "udid": clientResults[2]

    };
  } catch (err) {
    return Promise.reject(err);
  }
};

module.exports = function (Package) {

  const PACKAGES_CONTAINER_NAME = process.env['PACKAGES_CONTAINER_NAME'] || 'packages';
  const SCREENSHOTS_CONTAINER_NAME = process.env['SCREENSHOTS_CONTAINER_NAME'] || 'screenshots';
  const baseURL = process.env['HOST_URL'];



  Package.observe('access', (ctx, next) => {
    // console.log(ctx.options);
    console.log(ctx.query);
    console.log(ctx.options);
    // if (ctx.options && ctx.options.skipPropertyFilter) return next();
    // if (ctx.instance) {
    //   FILTERED_PROPERTIES.forEach(function(p) {
    //     ctx.instance.unsetAttribute(p);
    //   });
    // } else {
    //   FILTERED_PROPERTIES.forEach(function(p) {
    //     delete ctx.data[p];
    //   });
    // }
    next();
  });

  Package.reload = () => {
    // return;
    let PackagesFile = fs.createWriteStream(path.resolve(__dirname + '../../../client/static/Packages'), {});

    // PackagesFile.on('open', function(fd) {
    Package.find({
      include: {
        versions: 'file'
      }
    }, (err, packages) => {
      //console.log(packages);
      packages.forEach(function (packageObject) {
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

      fs.createReadStream(path.resolve(__dirname + '../../../client/static/Packages')).pipe(zlib.createGzip()).pipe(fs.createWriteStream(path.resolve(__dirname + '../../../client/static/Packages.gz')));
    });
  };
  Package.upload = function (ctx, options, cbF) {

    let cb = (var1, var2) => {
      console.log(var1 + var2);
    }

    console.log('Got Package');
    if (!options) options = {};

    let self = this;
    let formObj = new multiparty.Form();

    formObj.on('error', (err) => {
      console.log('Error parsing form: ' + err.stack);
    });

    formObj.on('part', (part) => {
      if (part.filename) {
        part.pipe(concat(async (bufferData) => {
          let bufferDataObj = bufferData;
          let md5Hash = await getHashForBuffer('md5', bufferData);
          let sha1Hash = await getHashForBuffer('sha1', bufferData);
          let sha256Hash = await getHashForBuffer('sha256', bufferData);

          console.log('MD5: ' + md5Hash);
          console.log('SHA1: ' + sha1Hash);
          console.log('SHA256: ' + sha256Hash);

          let controlData = await getControlDataForBuffer(bufferData);

          console.log('Control Data: ' + controlData.toString());

          // let fileStream = await bufferToStream(bufferData);
          //  let newReq = await bufferToRequest(bufferData, part.filename, 'application/vnd.debian.binary-package');
          //  console.log('New Request: ' + newReq);

          let uploadOptions = {
            'filename': part.filename,
            'mimetype': 'application/vnd.debian.binary-package'
          };

          let uploadStreamObj = await bufferToStream(bufferData);
          Package.app.models.Container.uploadStream(PACKAGES_CONTAINER_NAME, uploadStreamObj, uploadOptions, (err, fileObj) => {
            if (err) {
              cb(err);
              console.log(err);
            } else {
              console.log(fileObj);
              let fileInfo = fileObj.metadata;
              let obj = {
                size: fileObj.length,
                name: fileObj.filename,
                type: fileInfo.mimetype,
                md5: md5Hash,
                sha1: sha1Hash,
                sha256: sha256Hash,
                date: Date.now(),
                container: fileInfo.container,
                url: 'https://' + baseURL + '/api/containers/' + fileInfo.container + '/download/' + fileObj._id,
                fileDownloadId: fileObj._id
              };

              let stanza = controlData;

              // if (stanza['Section'] && stanza['Section'].length) {
              Package.app.models.Section.findOrCreate({
                where: {
                  name: stanza['Section'] ? stanza['Section'] : 'Tweak'
                }
              }, {
                name: stanza['Section'] ? stanza['Section'] : 'Tweak'
              }, (sectionError, sectionObject, sectionCreated) => {
                if (sectionError) {
                  console.log('Section Error');
                  console.log(sectionError);
                  cb(sectionError);
                  return;
                } else {
                  console.log(sectionObject);
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
                      console.log('Package Error');
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
                          console.log('Package Version Error');
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
                              console.log(packageFileObject);
                              if (cbF != null) {
                                cbF(null, packageObject);
                              }
                              Package.updateLatestVersion(packageObject);
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
        }));
      } else {
        part.resume();
      }
    });
    formObj.parse(ctx.req);
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
    var versionsPromise = new Promise((resolve, reject) => {
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


  Package.updateLatestVersion = async (packageObj) => {
    let latestVersion = await Package.getLatestVersion(packageObj.toJSON());
    packageObj.updateAttribute("latestVersionId", latestVersion.id, (err, updatedInstance) => {
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

  Package.rotateImageToPortraitWithBuffer = (bufferData) => {
    let promiseObj = new Promise((resolve, reject) => {
      const image = sharp(bufferData);
      image.metadata().then((metadata) => {
        return image.rotate(
          metadata.width > metadata.height  ? 90 : 0
        ).toFormat('jpeg').toBuffer();
      }).then((data) => {
        resolve(data);
        // data contains a WebP image half the width and height of the original JPEG
      });
    });

    return promiseObj;
  };

  Package.resizeImageToWidthWithBuffer = (maxWidth, bufferData) => {
    let promiseObj = new Promise((resolve, reject) => {
      const image = sharp(bufferData);
      image.resize(maxWidth, 1)
        .min()
        .toFormat('jpeg')
        .toBuffer()
        .then((data) => {
          resolve(data);
          // outputBuffer contains JPEG image data no wider than 200 pixels and no higher
          // than 200 pixels regardless of the inputBuffer image dimensions
        });
    });

    return promiseObj;
  };


  Package.imageDataForBuffer = (bufferData, sizeKey) => {
    let promiseObj = new Promise((resolve, reject) => {
      const image = sharp(bufferData);
      image.metadata().then((metadata) => {
        resolve({
          width: metadata.width,
          height: metadata.height,
          data: bufferData,
          sizeKey: sizeKey
        })
      })
    });
    return promiseObj;
  };

  Package.uploadImageBufferToContainer = async (bufferData) => {
    let promiseObj = new Promise(async (resolve, reject) => {
      let imageStream = await bufferToStream(bufferData);
      let uploadOptions = {
        'filename': uuidV4() + '.jpg',
        'mimetype': 'image/jpeg'
      };

      Package.app.models.Container.uploadStream(
        SCREENSHOTS_CONTAINER_NAME,
        imageStream,
        uploadOptions,async (err, fileObj) => {
          if (err) {
            console.log(err);
            reject();
          } else {
            resolve(fileObj);
          }
        });
    });
    return promiseObj;
  };

  Package.uploadImageDataScreenshot = async (imageData, screenshotId) => {
    let promiseObj = new Promise(async (resolve, reject) => {
      let uploadFileInfo = await Package.uploadImageBufferToContainer(imageData['data']);
      console.log(imageData);
      Package.app.models.PackageScreenshotFile.create({
        width: imageData['width'],
        height: imageData['height'],
        fileId: uploadFileInfo._id,
        screenshotId: screenshotId,
        sizeKey: imageData['sizeKey']
      }, async (err, screenshotFile) => {
        if (err) {
          console.log(err);
          reject();
        } else {
          resolve(screenshotFile);
        }
      });
    });
    return promiseObj;
  };

  Package.createScreenshot = async (packageId) => {
    let promiseObj = new Promise(async (resolve, reject) => {
      Package.app.models.PackageScreenshot.create({
        packageId: packageId
      }, async (err, packageScreenshot) => {
        if (err) {
          console.log(err);
          reject();
        } else {
          resolve(packageScreenshot);
        }
      });
    });

    return promiseObj;
  };

  Package.uploadScreenshotSizes = async (screenshots, packageId) => {
    let promiseObj = new Promise(async (resolve, reject) => {
      let packageScreenshot = await Package.createScreenshot(packageId);
      let screenshotId = packageScreenshot.id;
      console.log('Screenshot ID: ' + screenshotId);

      let screenshotFiles = [];
      for (let screenshotData of screenshots) {
        screenshotFiles.push(await Package.uploadImageDataScreenshot(screenshotData, screenshotId));
      }

      let sizesObj = {};

      for (let screenshotFile of screenshotFiles) {
        sizesObj[screenshotFile['sizeKey']] = screenshotFile.toJSON();
        delete sizesObj[screenshotFile['sizeKey']]['sizeKey'];
        delete sizesObj[screenshotFile['sizeKey']]['screenshotId'];
        delete sizesObj[screenshotFile['sizeKey']]['id'];
        delete sizesObj[screenshotFile['sizeKey']]['createdOn'];
        delete sizesObj[screenshotFile['sizeKey']]['updatedOn'];
      }

      console.log('sizes obj: ' + sizesObj);

      packageScreenshot.updateAttribute('sizes', sizesObj, (err, updatedScreenshot) => {
        if (err) {
          console.log(err);
          reject();
        } else {
          console.log('Updated Screen Sizes Object: ' + updatedScreenshot);
          resolve(updatedScreenshot);
        }
      });
    });

    return promiseObj;
  };

  Package.updateScreenshotsProp = async (packageIdValue) => {
    let promiseObj = new Promise(async (resolve, reject) => {
      // console.log("UPDATE PROP PACKAGE ID: " + packageIdValue);
      // let filter = {
      //   where: {
      //     id: '5a593f09f9a6f02c8e0df54c'
      //   }
      // };
      //
      // let numofCount = await Package.app.models.PackageScreenshot.count({
      //     packageId: "'" + packageIdValue + "'"
      // });
      //
      // console.log('COUNT OF: ' + numofCount);
      //
      // console.log('FILTER: ' + JSON.stringify(filter));

      let screenshots = await Package.app.models.PackageScreenshot.find({
          where: {
            packageId: '' + packageIdValue
          },
          fields: {
            id: true,
            sizes: true
          }
      });

      // let cleanedScreenshots = [];
      //
      // for (let screenshot of screenshots) {
      //   delete screenshot['packageId'];
      //   delete screenshot['createdOn'];
      //   delete screenshot['updatedOn'];
      //
      //   for (let sizeKey in screenshot['sizes']) {
      //     if (screenshot['sizes'].hasOwnProperty(sizeKey)) {
      //       delete screenshot['sizes'][sizeKey]['createdOn'];
      //       delete screenshot['sizes'][sizeKey]['updatedOn'];
      //       delete screenshot['sizes'][sizeKey]['id'];
      //       delete screenshot['sizes'][sizeKey]['screenshotId'];
      //     }
      //   }
      //
      //   cleanedScreenshots.push(screenshot);
      // }

      let packageObj = await Package.findById(packageIdValue);
      packageObj = await packageObj.updateAttribute('screenshots', screenshots);
      if (packageObj) resolve(packageObj);
      else reject();
    });

    return promiseObj;
  };

  Package.prototype.uploadScreenshot = function(ctx, options, cb) {
    let packageObj = this;
    let packageObjJSON = packageObj.toJSON();
    let packageId = packageObjJSON.id;

    let formObj = new multiparty.Form();

    // const cb = (op1, op2) => {
    //   console.log('called callback');
    //   cbF(op1, op2);
    // };
   // let screenshot = null;

    formObj.on('error', (err) => {
      console.log('Error parsing form: ' + err.stack);
    });

    formObj.on('part', (part) => {
      if (part.filename) {
        part.pipe(concat(async (bufferData) => {
          let imageSizes = [];

          const rotatedImageBuffer = await Package.rotateImageToPortraitWithBuffer(bufferData);
          imageSizes.push(await Package.imageDataForBuffer(rotatedImageBuffer, 'full'));
          imageSizes.push(await Package.imageDataForBuffer(await Package.resizeImageToWidthWithBuffer(132, rotatedImageBuffer), 'thumbnail'));
          imageSizes.push(await Package.imageDataForBuffer(await Package.resizeImageToWidthWithBuffer(250, rotatedImageBuffer), 'medium'));
          imageSizes.push(await Package.imageDataForBuffer(await Package.resizeImageToWidthWithBuffer(414, rotatedImageBuffer), 'large'));

          let screenshot = await Package.uploadScreenshotSizes(imageSizes, packageId);
          console.log('screenshot finished parsing');
          console.log(screenshot.toJSON());
          console.log(screenshot);

          let updatedPackage = await Package.updateScreenshotsProp(packageId);
          if (updatedPackage) {
            console.log('calling callback')
            cb(null, updatedPackage);
          }
          console.log(updatedPackage.toJSON());
          // cb(null, updatedPackage);
        }));
      } else {
        part.resume();
      }
    });

    formObj.on('close', async () => {
      console.log('form finished parsing');
    });

    formObj.parse(ctx.req);
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

  Package.getReviewInfo = async (packageId, req) => {
    return new Promise(async (resolve, reject) => {
      try {
        const clientInfo = await clientInfoForRequest(req,false,false);

        let packageObj = await Package.findOne({
          where: {
            identifier: packageId
          },
          include: ['latestVersion']
        });

        // let packageData = packageObj;
        // if (packageData.toJSON) {
        //   packageData = packageObj.toJSON();
        // }

        const data = {
          packageId: packageObj.id,
          packageVersionId: packageObj['latestVersionId'],
          clientIp: clientInfo['ip'],
          clientType: clientInfo['type'],
        };

        let oObj = await Package.app.models.PackageVersionRating.find({
          where: {
            packageId: packageObj.id,
            packageVersionId: packageObj['latestVersionId'],
          }
        });

        console.log('O Object');
        console.log(oObj);

        console.log(data);

        const promises = [
          Package.app.models.PackageVersionReview.findOne({
            where: data
          }),
          Package.app.models.PackageVersionRating.findOne({
            where: data
          })
        ];

        let promiseResults = await Promise.all(promises);

        console.log(promiseResults);

        let packageData = packageObj;
        if (packageData.toJSON) {
          packageData = packageObj.toJSON();
        }

        let reviewObj = promiseResults[0];
        let ratingObj = promiseResults[1];

        let reviewData = reviewObj;
        if (reviewData && reviewData.toJSON) {
          reviewData = reviewData.toJSON();
        }

        if (reviewData) {
          delete reviewData['clientIp'];
        }

        let ratingData = ratingObj;
        if (ratingData && ratingData.toJSON) {
          ratingData = ratingData.toJSON();
        }

        if (ratingData) {
          delete ratingData['clientIp'];
        }

        console.log(ratingData);
        console.log(reviewData);

        resolve({
          reviewData: reviewData,
          packageData: packageData,
          ratingData: ratingData
        })
      } catch (err) {
        reject(err);
      }
    });
  };


  Package.writeReview = function(req, id, cb) {
    console.log("PACKAGE ID: " + id);
    Package.getReviewInfo(id, req).then((result) => {
      return cb(null,result);
    }, (err) => {
      return cb(err);
    });
  };

  Package.remoteMethod(
    'writeReview', {
      description: 'Gets Review Posting Information for Package',
      accepts: [
        {arg: 'req', type: 'object', http: {source: 'req'}},
        {arg: 'id', type: 'string', http: { source: 'query' } }
        ],
      returns: {
        type: 'object', root: true
      },
      http: {path:'/writeReview', verb: 'get'}
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

  Package.remoteMethod(
    'uploadScreenshot', {
      isStatic: false,
      description: 'Uploads a Screen Shot for the Package',
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
        verb: 'post',
        path: '/screenshots/upload'
      }
    }
  );
};
