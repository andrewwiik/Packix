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
      return process.nextTick(() => cb(null, false));
    }

    UserIdentity.findOne({
      where: {
        userId: userId
      },
      include: ['user']
    }, function(error, foundUser) {
      if (error) {
        console.log(error);
        return cb(null, false);
      }

      if (foundUser && foundUser.toJSON) {
        foundUser = foundUser.toJSON();
      }
      if (foundUser) {
        let email = '';
        if (foundUser.provider === 'patreon') {
          if (foundUser.profile) {
           // console.log(foundUser.profile.attributes);
            if (foundUser.profile.email && foundUser.profile.email.length > 0) {
              email = foundUser.profile.email;
            } else if (foundUser.profile.attributes &&
                foundUser.profile.attributes.email &&
                foundUser.profile.attributes.email.length > 0) {
              email = foundUser.profile.attributes.email;
            }
          } else {
            if (foundUser['_json'] &&
                foundUser['_json']['_attributes'] &&
                foundUser['_json']['_attributes']['email'] &&
                foundUser['_json']['_attributes']['email'].length > 0) {
              email = foundUser['_json']['_attributes']['email'];
            }
          }
        } else if (foundUser.provider === 'google') {
          let emails = foundUser.emails;
          for (let emailObj of foundUser.profile.emails) {
            if (emailObj['type'] === 'account' && emailObj['value'] && emailObj['value'].length > 0) {
              email = emailObj['value'];
              break;
            }
          }
        } else if (foundUser.provider === 'facebook') {
          let emails = foundUser.emails;
          for (let emailObj of emails) {
            if (emailObj['value'] && emailObj['value'].length > 0) {
              email = emailObj['value'];
              break;
            }
          }
        }

        console.log('user email: ' + email);
        if (email.indexOf(process.env['ADMIN_EMAIL']) !== -1) {
          console.log('admin');
          return cb(null, true);
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
