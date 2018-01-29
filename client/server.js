const express = require('express')
const next = require('next')
const path = require('path')

const port = parseInt(process.env.PORT, 10) || 8083
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev, dir: './client/', conf: {
  useFileSystemPublicRoutes: false
}})
const handle = app.getRequestHandler()
var compression = require('compression')


app.prepare()
.then(() => {
  const server = express();

  server.use(compression({filter: shouldCompress}))

  function shouldCompress (req, res) {
    return true;
    if (req.headers['x-no-compression']) {
      // don't compress responses with this request header
      return false
    }

    // fallback to standard filter function
    return compression.filter(req, res)
  }

  server.get('/', (req, res) => {
    app.render(req, res, '/index', {});
  });

  server.get('/package/:id', (req, res) => {
    const actualPage = '/package';
    const queryParams = { "package": req.params["id"] };
    console.log(req.params);
    req.query = queryParams;
    app.render(req, res, actualPage, queryParams)
  });

  server.get('/package/:id/', (req, res) => {
    const actualPage = '/package';
    const queryParams = { "package": req.params["id"] };
    console.log(req.params);
    req.query = queryParams;
    app.render(req, res, actualPage, queryParams)
  });

  // server.get('/package', (req, res) => {
  //   console.log('REQ P: ' + req.params);
  //   console.log('REQ Q: ' + req.query);
  //   const actualPage = '/package';
  //   const queryParams = { "package": req.params["id"] || req.query['id'] };
  //   console.log(req.params);
  //   req.query = queryParams;
  //   app.render(req, res, actualPage, queryParams)
  // });

  server.get('/packages/:id', (req, res) => {
    const actualPage = '/package';
    const queryParams = { "package": req.params["id"] };
    console.log(req.params);
    req.query = queryParams;
    app.render(req, res, actualPage, queryParams)
  });

  server.get('/packages/:id/', (req, res) => {
    const actualPage = '/package';
    const queryParams = { "package": req.params["id"] };
    console.log(req.params);
    req.query = queryParams;
    app.render(req, res, actualPage, queryParams)
  });

  server.get('/package/:id/changes', (req, res) => {
    const actualPage = '/changes';
    const queryParams = { "package": req.params["id"] };
    console.log(req.params);
    req.query = queryParams;
    app.render(req, res, actualPage, queryParams)
  });

  server.get('/packages/:id/changes', (req, res) => {
    const actualPage = '/changes';
    const queryParams = { "package": req.params["id"] };
    console.log(req.params);
    req.query = queryParams;
    app.render(req, res, actualPage, queryParams)
  });

  server.get('/package/:id/screenshots', (req, res) => {
    const actualPage = '/screenshots';
    const queryParams = { "package": req.params["id"] };
    console.log(req.params);
    req.query = queryParams;
    app.render(req, res, actualPage, queryParams)
  });

  server.get('/packages/:id/screenshots', (req, res) => {
    const actualPage = '/screenshots';
    const queryParams = { "package": req.params["id"] };
    console.log(req.params);
    req.query = queryParams;
    app.render(req, res, actualPage, queryParams)
  });

  server.get('/package/:id/review', (req, res) => {
    const actualPage = '/write-review';
    const queryParams = { "package": req.params["id"] };
    console.log(req.params);
    req.query = queryParams;
    app.render(req, res, actualPage, queryParams)
  });

  server.get('/packages/:id/review', (req, res) => {
    const actualPage = '/write-review';
    const queryParams = { "package": req.params["id"] };
    console.log(req.params);
    req.query = queryParams;
    app.render(req, res, actualPage, queryParams)
  });

  server.get('/package/:id/reviews', (req, res) => {
    const actualPage = '/reviews';
    const queryParams = { "package": req.params["id"] };
    console.log(req.params);
    req.query = queryParams;
    app.render(req, res, actualPage, queryParams)
  });

  server.get('/packages/:id/reviews', (req, res) => {
    const actualPage = '/reviews';
    const queryParams = { "package": req.params["id"] };
    console.log(req.params);
    req.query = queryParams;
    app.render(req, res, actualPage, queryParams)
  });

  // server.get('/package/:id/', (req, res) => {
  //   const actualPage = '/package';
  //   const queryParams = { "package": req.params["id"] };
  //   console.log(req.params);
  //   req.query = queryParams;
  //   app.render(req, res, actualPage, queryParams)
  // });
  //
  // server.get('/packages/:id/', (req, res) => {
  //   const actualPage = '/package';
  //   const queryParams = { "package": req.params["id"] };
  //   console.log(req.params);
  //   req.query = queryParams;
  //   app.render(req, res, actualPage, queryParams)
  // });


  // server.get('/package/:id', (req, res) => {
  //   return app.render(req, res, '/b', req.query)
  // })

  server.get('/b', (req, res) => {
    return app.render(req, res, '/a', req.query)
  })

  // server.get('*', (req, res) => {
  //   return handle(req, res)
  // })

  // app.use(compression({filter: shouldCompress}))
  //
  // function shouldCompress (req, res) {
  //   if (req.headers['x-no-compression']) {
  //     // don't compress responses with this request header
  //     return false
  //   }
  //
  //   // fallback to standard filter function
  //   return compression.filter(req, res)
  // }

  // server.get('/_next/e431c299-2b80-4632-b1a9-66b6153014ce/page/package/:id', (req, res) => {
  //  // console.log(req.params);
  //  // console.log('step 1');
  //   const actualPage = '/package';
  //   let param = req.params.id;
  //   param = param.substring(0, param.length-3);
  //   console.log('param');
  //   //const queryParams = { "package": param };
  //   //console.log(req.params);
  //   //req.query = queryParams;
  //   //console.log('step 1');
  //   res.redirect('package/' + param);
  //  // app.render(req, res, actualPage, queryParams)
  // });

  server.use('/', express.static(path.resolve(__dirname, 'static')));

  server.get('*', (req, res) => {
    return handle(req, res)
  });


  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
