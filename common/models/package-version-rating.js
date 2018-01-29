'use strict';

module.exports = function(Packageversionrating) {

  Packageversionrating.observe('access', (ctx, next) => {
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

  Packageversionrating.updateRatingForId = async (packageVersionId) => {
    let packageVersion = await Packageversionrating.app.models.PackageVersion.findById(packageVersionId);

    let ratingStats = {};
    ratingStats['ratings'] = [];
    let totalCount = 0;
    let divideWith = 0;

    let promises = [];

    for (let x = 5; x > 0; x--) {
      promises.push(Packageversionrating.count({
        packageVersionId: packageVersionId,
        value: x
      }));
    }

    let results = await Promise.all(promises);

    for (let x = 0; x < 5; x++) {
      let count = results[x];
      const star = (5 - x);
      ratingStats['ratings'].push({
        starCount: count,
        star: star
      })

      divideWith += count*star;
      totalCount += count;
    }

    ratingStats['total'] = totalCount;
    ratingStats['average'] = divideWith/totalCount;


    let updatedPackageVersion = await packageVersion.updateAttributes({
      ratingStats: ratingStats
    });

    await Packageversionrating.app.models.PackageVersionReview.updateRecentReviews(packageVersion.packageId, packageVersionId);
  };

  Packageversionrating.observe('after save', function(ctx, next) {
    Packageversionrating.updateRatingForId(ctx.instance.packageVersionId);
    next();
  });
};
