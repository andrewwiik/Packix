'use strict';

module.exports = function(Packagescreenshot) {
  const SCREENSHOTS_CONTAINER_NAME = process.env['SCREENSHOTS_CONTAINER_NAME'] || 'screenshots';

  let lastDeletedPackageId = "";

  Packagescreenshot.prototype.download = function(size, req, res, cb) {
    if (!size || size.length < 1) {
      size = 'full';
    }

    if (!this.sizes[size]) {
      size = 'full';
    }
    let fileId = this.sizes[size]['fileId'];
    let Container = Packagescreenshot.app.models.Container;

    Container.downloadInline(SCREENSHOTS_CONTAINER_NAME, fileId, res, cb);
  };


  Packagescreenshot.updateScreenshotsForPackageId = async (packageIdValue) => {
    try {
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
      let screenshots = await Packagescreenshot.find({
        where: {
          packageId: packageIdValue
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

      let packageObj = await Packagescreenshot.app.models.Package.findById(packageIdValue);
      packageObj = await packageObj.updateAttribute('screenshots', screenshots);
      return Promise.resolve();
    } catch (err) {
      console.log(err);
      return Promise.reject();
    }
  };

  Packagescreenshot.observe('before delete', function(ctx, next) {
    Packagescreenshot.findById(ctx.where.id, function(err, sObj) {
      ctx.hookState.packageId = sObj.packageId;
      lastDeletedPackageId = sObj.packageId;
      next();
    })
  });

  Packagescreenshot.observe('after delete', function(ctx, next) {
    Packagescreenshot.updateScreenshotsForPackageId(lastDeletedPackageId).then(() => {
      next();
    });
  });

  Packagescreenshot.remoteMethod(
    'download',
    {
      isStatic: false,
      accepts: [
        {arg: 'size', type: 'string'},
        {arg: 'req', type: 'object', http: {source: 'req'}},
        {arg: 'res', type: 'object', 'http': {source: 'res'}}
      ],
      http: {path: '/download.jpg', verb: 'get'},
      returns: {}
    }
  );
};
