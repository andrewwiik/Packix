/**
 * Created by awiik on 6/11/2017.
 */
// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-example-access-control
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

module.exports = function(app) {
  var User = app.models.user;
  var UserIdentity = app.models.UserIdentity;
  var Role = app.models.Role;
  var RoleMapping = app.models.RoleMapping;

    // the admin role

  Role.findOrCreate({
    where: {
      name: 'user'
    }
  }, {
    name: 'user',
    description: 'Regular User Role'
  }, function(error, role, created) {
    if (error) throw error;
    if (created) {
      console.log('Created role:', role);
    }
  });

  Role.findOrCreate({
    where: {
      name: 'press'
    }
  }, {
    name: 'press',
    description: 'Press Account Role'
  }, function(error, role, created) {
    if (error) throw error;
    if (created) {
      console.log('Created role:', role);
    }
  });

  Role.registerResolver('admin', function(role, context, cb) {
    // Q: Is the current request accessing a Project?
    //console.log(context);
    // Q: Is the user logged in? (there will be an accessToken with an ID if so)
    var userId = context.accessToken.userId;
    if (!userId) {
      // A: No, user is NOT logged in: callback with FALSE
      return cb(null, false);
    }

    UserIdentity.findOne({
      where: {
        userId: userId
      }
    }, function(error, foundUser) {
      if (error) {
        return cb(null, false);
      }

      if (foundUser) {
        //console.log(foundUser);
        var emails = foundUser.profile.emails;
        for (var x = 0; x < emails.length; x++) {
          if (emails[x].value.indexOf(process.env['ADMIN_EMAIL']) !== -1) {
            return cb(null, true);
          }
        }
      }

      return cb(null, false);
    });

    // Q: Is the current logged-in user associated with this Project?
    // Step 1: lookup the requested project
  });

  // Role.create({
  //   name: 'admin'
  // }, function(err, role) {
  //   if (err) throw err;
  //
  //   console.log('Created role:', role);
  //
  //     // make bob an admin
  //     // role.principals.create({
  //     //   principalType: RoleMapping.USER,
  //     //   principalId: users[2].id
  //     // }, function(err, principal) {
  //     //   if (err) throw err;
  //     //
  //     //   console.log('Created principal:', principal);
  //     // });
  // });
};
