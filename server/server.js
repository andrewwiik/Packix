'use strict';

const loopback = require('loopback');
const boot = require('loopback-boot');
const cookieDeMangle = require('cookie');
const app = module.exports = loopback();
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const fs = require('fs-extra');
const path = require('path');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

// const configureDataStore = require('./config/storage.js');
//
// configureDataStore(app);

var PassportConfigurator = require('loopback-component-passport').PassportConfigurator;
var passportConfigurator = new PassportConfigurator(app);

// var ECT = require('ect');
// var ectRenderer = ECT({ watch: true, root:__dirname + './views', ext: '.html' });

const SECRETCOOKIE = process.env['COOKIE_SECRET'];

const PACKAGES_CONTAINER_NAME = process.env['PACKAGES_CONTAINER_NAME']
const baseURL = process.env['HOST_URL'];

app.set('trust proxy', true);

app.set('cookieSecret', SECRETCOOKIE);
app.set('packages-container-name', process.env['PACKAGES_CONTAINER_NAME']);

// fs.ensureDirSync('./uploads/common');

// app.use(cookieParser(app.get('cookieSecret')));
// app.use(loopback.session({
//   secret: 'kitty',
//   saveUninitialized: true,
//   resave: true,
//   cookie: {
//     maxAge: 3600000, // 1 hour
//     secure: true
//   }
// }));

// app.middleware('auth', loopback.token({
//   model: app.models.accessToken
// }));
//
app.middleware('session:before', cookieParser(app.get('cookieSecret')));
//
// app.use(session({
//   secret: 'secret-cookie',
//   resave: true,
//   saveUninitialized: true,
//   cookie: {
//     maxAge: 3600000, // 1 hour
//     secure: true
//   }
// }));
//
// passportConfigurator.init();
//
// var store = new MongoDBStore({
//   uri: 'mongodb://10.132.131.10:27017/ioscreatix-23',
//   collection: 'loopbackSessions'
// });

// app.middleware('auth:before', cookieParser(app.get('cookieSecret')));

// app.middleware('session:before', function(req, res, next) {
//   if (req.query.next) {
//     console.log(req);
//     //req.session.next = req.query.next;
//   }
//   console.log(req.query);
//   next();
// });

const host = process.env['MONGODB_HOST'];
const port = process.env['MONGODB_PORT'];
const database = process.env['MONGODB_DATABASE'];
app.middleware('session', session({
  secret: app.get('cookieSecret'),
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    maxAge: 3600000, // 1 hour
    secure: true
  },
  store: new MongoStore({
    url: 'mongodb://' + process.env['MONGODB_HOST'] + '/' +  process.env['MONGODB_PORT']
  })
}));

app.all('*', (req, res, next) => {
 // console.log(req.session);
  console.log(req.sessionID);
  next(); // pass control to the next handler
});


// app.use(session({
//   secret: SECRETCOOKIE,
//   resave: true,
//   saveUninitialized: true,
//   cookie: {
//     maxAge: 3600000, // 1 hour
//     secure: true
//   }
// }));

// app.use(loopback.token({
//   model: app.models.accessToken
// }));

boot(app, __dirname, (err) => {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module) {
    app.middleware('auth', loopback.token({
      model: app.models.accessToken
    }));
    app.start();
  }
    //console.log(app.dataSources.db.connector.);
});

// app.middleware('auth', loopback.token({
//   model: app.models.accessToken
// }));
//
// app.middleware('session:before', cookieParser(app.get('cookieSecret')));
//
// app.use(session({
//   secret: 'secret-cookie',
//   resave: true,
//   saveUninitialized: true,
//   cookie: {
//     maxAge: 3600000, // 1 hour
//     secure: true
//   }
// }));
//
// passportConfigurator.init();

app.start = () => {
  //console.log(loopback.session);
  // app.middleware('auth', loopback.token({
  //   model: app.models.accessToken
  // }));

  // var store = new MongoDBStore({
  //   uri: 'mongodb://10.132.131.10:27017/ioscreatix-23',
  //   collection: 'loopbackSessions'
  // });
  //
  // // app.middleware('auth:before', cookieParser(SECRETCOOKIE));
  //
  // // app.middleware('session:before', function(req, res, next) {
  // //   if (req.query.next) {
  // //     console.log(req);
  // //     //req.session.next = req.query.next;
  // //   }
  // //   console.log(req.query);
  // //   next();
  // // });
  //
  // app.middleware('session:before', session({
  //   secret: SECRETCOOKIE,
  //   resave: true,
  //   saveUninitialized: true,
  //   cookie: {
  //     maxAge: 3600000, // 1 hour
  //     secure: true
  //   },
  //   store: store
  // }));
  //
  //
  // // app.use(session({
  // //   secret: SECRETCOOKIE,
  // //   resave: true,
  // //   saveUninitialized: true,
  // //   cookie: {
  // //     maxAge: 3600000, // 1 hour
  // //     secure: true
  // //   }
  // // }));
  //
  // passportConfigurator.init();
  // start the web server
  return app.listen(() => {
    app.emit('started');
    var baseUrl = baseURL;
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }

    // let autoMigrate = require('loopback-component-auto-migrate/lib/auto-migrate');
    // autoMigrate(app, {"migration": "auto-migrate"}).then(() => {
    //   console.log("I FINISHED MIGRATION");
    // })
  });
};

// app.enable('trust proxy');

app.get('/api/auth/success', function(req, res, next) {
 // console.log(req);
  //console.log(req.accessToken);
 // console.log(req.user);
  // var tokenId = req.cookies.access_token;
  // var userId = req.cookies.user_dd;
 // console.log(req.session);
  // console.log(req.session);
  // console.log(req.user);
  if (req) {
    if (req.session.authRedirect) {
      var redirectURL = req.session.authRedirect;
      delete req.session.authRedirect;
      res.redirect(redirectURL);
      // next();
    } else {
      res.redirect('https://' + baseURL + '/' + tokenId + '/' + userId);
      // next();
      res.redirect('/');
    }

  }  else {
    next();
  }
});

app.get('/api/auth/google', function(req, res, next) {
  if (req.isUnauthenticated()) {
    req.logout();
    req.session.destroy();
  }
  if (req.query.next) {
    req.session.authRedirect = req.query.next;
  //  console.log(req);
    // console.log(req.session.authRedirect);
    // console.log(req.session);
  }
  next();
});

app.use('/api/link/cydia', function(req, res, next) {
  var parsedCookies = cookieDeMangle.parse(req.headers.cookie);
  var tokenId = parsedCookies.access_token;
  var userId = parsedCookies.userId;
  var DeviceLinkNonce = app.models.DeviceLinkNonce;
  DeviceLinkNonce.create({
    'accountId': userId
  }, function(nonceError, nonceObject) {
    if (nonceError) {
      res.send(nonceError);
    } else {
      var linkURL = 'cydia://url/https://cydia.saurik.com/api/share#?source=https://' + baseURL + '/';
      linkURL += '&extra=https://' + baseURL + '/api/link/device/' + nonceObject.id;
      res.redirect(linkURL);
    }
  });
});

app.use('/api/link/device/:nonce', function(req, res, next) {
  if (req.params.nonce) {
    console.log(req.params.nonce);
    var DeviceLinkNonce = app.models.DeviceLinkNonce;
    DeviceLinkNonce.findById(req.params.nonce,  function(nonceError, nonceObject) {
      if (nonceError) {
        res.send(nonceError);
        console.log(nonceError);
      } else {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        console.log(ip);
        if (!(ip && ip.length > 0)) {
          res.send('nonce error');
        } else {
          ip = crypto.createHash('sha256').update(ip).digest('base64');
          console.log(nonceObject);
          nonceObject.updateAttribute('ip', ip, function(updateError, updatedObject) {
            if (updateError) {
              res.send(updateError);
            } else {
              console.log(updatedObject);
              app.models.UserIdentity.findOne({
                where: {
                  'userId': updatedObject.accountId
                }
              }, function(userError, userObject) {
                if (userError) {
                  res.send(userError);
                } else {
                  res.send('You have automatically been logged into Packix as' + userObject.profile.displayName);
                }
              });
            }
          });
        }
      }
    });
  } else {
    res.send('No nonce provided');
  }
});

app.use(['/Packages', '/Packages.gzip', '/Packages.gz', '/./Packages.gz', '/Packages.bz2', '/./Packages.bz2'], function(req, res, next) {
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
  console.log(udid);
  if (udid && udid.length > 0) {
    udid = crypto.createHash('sha256').update(udid).digest('base64');
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (ip && ip.length > 0) {
      ip = crypto.createHash('sha256').update(ip).digest('base64');
      app.models.DeviceLinkNonce.findOne({
        where: {
          'ip': ip
        }
      }, function(nonceError, nonceObject) {
        console.log(nonceObject);
        if (!nonceError && nonceObject) {
          app.models.DeviceLinkNonce.destroyById(nonceObject.id, function(error) {
            if (error) {
              console.log(error);
            }
          });
          // var udid = req.headers['HTTP_X_UNIQUE_ID'];
          var deviceModel = req.headers['X-Machine'];
          if (!deviceModel) deviceModel = req.headers['x-machine'];
          // if (!deviceModel) deviceModel = req.headers['X-Machine'];
          if (udid && deviceModel) {
            app.models.Device.findOrCreate({
              where: {
                'udid': udid
              }
            }, {
              'udid': udid,
              'deviceModel': deviceModel,
              'accountId': nonceObject.accountId
            }, function(error, device, wasCreated) {
              if (error) {
                console.log(error);
              } else {
                console.log(device);
              }
            });
          }
        }
      });
    }
  }
  next();
});

passportConfigurator.init();

app.use(bodyParser.json({limit: '50mb', expanded:true}));
app.use(bodyParser.urlencoded({
  extended: true,
  parameterLimit: 100000,
  limit: '50mb',
}));



// passportConfigurator.init();
// Load the provider configurations
var config = {};
try {
  const getProvidersConfig = require('./config/providers.js');
  config = getProvidersConfig(app);
} catch (err) {
  console.error(err);
  console.error('Please configure your passport strategy in `providers.json`.');
  console.error('Copy `providers.json.template` to `providers.json`' +
    ' and replace the clientID/clientSecret values with your own.');
  process.exit(1);
}
// Initialize passport
// Set up related models
passportConfigurator.setupModels({
  userModel: app.models.User,
  userIdentityModel: app.models.UserIdentity,
  userCredentialModel: app.models.UserCredential,
});
// Configure passport strategies for third party auth providers
for (var s in config) {
  var c = config[s];
  c.session = c.session !== false;
  passportConfigurator.configureProvider(s, c);
}

  // app.use('/', loopback.static(path.resolve(__dirname, '../admin'), {redirect: false}));
  // app.use('/admin/*', loopback.static(path.resolve(__dirname, '../admin/dist'), {redirect: false}));
  // app.use('/', loopback.static(path.resolve(__dirname, '../admin/dist')));
// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.

