module.exports = function enableAuthentication(app) {
  // enable authentication
  app.enableAuth({ datasource: 'db' });
  // app.middleware('session:before',


  // console.log(app.models.UserProfile.acls)

  console.log(app.models.UserIdentity.settings.acls);

};
