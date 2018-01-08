module.exports = function enableAuthentication(app) {
  // enable authentication
  app.enableAuth({ datasource: 'db' });
  // app.middleware('session:before',

};
