'use strict';

const sharp = require('sharp');
const multiparty = require('multiparty');
const util = require('util');


module.exports = function(Packagescreenshot) {
  Packagescreenshot.upload = async (ctx, options, packageId, cb) => {
    let req = ctx.req;
    let res = ctx.res;
    if (!options) options = {};

    var form = new multiparty.Form();

    form.on('error', (err) => {
      console.log('Error parsing form: ' + err.stack);
    });

    form.on('part', (part) => {
      // You *must* act on the part by reading it
      // NOTE: if you want to ignore it, just call "part.resume()"

      if (!part.filename) {
        // filename is not defined when this is a field and not a file
        //console.log('got field named: ' + part.name + ' with the value: ' + part.value);
        // ignore field's content
        part.resume();
      }

      if (part.filename) {
        // filename is defined when this is a file
        console.log('got file named ' + part.name);
        // ignore file's content here
        part.resume();
      }

      part.on('error', (err) => {
        // decide what to do
      });
    });


    form.on('close', () => {
      console.log('Upload completed!');
      // res.setHeader('text/plain');
      // res.end('Received ' + count + ' files');
    });

// Parse req
    form.parse(req);
  };


  Packagescreenshot.remoteMethod(
    'upload', {
      description: 'Uploads s screenshot for a package',
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
