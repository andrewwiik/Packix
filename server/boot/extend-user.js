'use strict';

module.exports = function(app) {
  app.models.User.hasMany(app.models.Device, {as: 'devices', foreignKey: 'accountId'});
  app.models.User.hasMany(app.models.Package, {as: 'packages', foreignKey: 'accountId'});
  app.models.User.hasMany(app.models.PackagePurchase, {as: 'purchases', foreignKey: 'accountId'});
  app.models.User.hasOne(app.models.UserIdentity, {as: 'profile', foreignKey: 'userId'});

  //app.registry.createModel('PayPal', {dataSource: 'paypal', public: true});

  // const paymentTransaction = {
  //   'intent': 'sale',
  //   'payer': {
  //     'payment_method': 'paypal',
  //   },
  //   'redirect_urls': {
  //     'return_url': 'http://return.url',
  //     'cancel_url': 'http://cancel.url',
  //   },
  //   'transactions': [{
  //     'item_list': {
  //       'items': [{
  //         'name': 'item',
  //         'sku': 'item',
  //         'price': '1.00',
  //         'currency': 'USD',
  //         'quantity': 1,
  //       }],
  //     },
  //     'amount': {
  //       'currency': 'USD',
  //       'total': '1.00',
  //     },
  //     'description': 'This is the payment description.',
  //   }],
  // };
  //
  // app.models.PayPal.payment.create(paymentTransaction, function(err, response)  {
  //   console.log(err);
  //   console.log(response);
  // });
  // console.log('extended user model successfully');
};
