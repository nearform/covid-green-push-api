const path = require('path')
const autoLoad = require('fastify-autoload')
const formbody = require('fastify-formbody')
const fp = require('fastify-plugin')
const cors = require('fastify-cors')
const swagger = require('fastify-swagger')

/**
 * Configure and starts Fastify server with all required plugins and routes
 * @async
 * @param {Object} config - optional configuration options (default to ./config module)
 *                          May contain a key per plugin (key is plugin name), and an extra
 *                          'fastify' key containing the server configuration object
 * @returns {Fastify.Server} started Fastify server instance
 */

async function plugin(server, config) {
  if (!config.isProduction) {
    server.register(swagger, config.swagger)
  }

  server
    .register(cors, config.cors)
    .register(formbody)
    .register(autoLoad, {
      dir: path.join(__dirname, 'plugins'),
      options: config
    })
    .register(autoLoad, {
      dir: path.join(__dirname, 'routes'),
      options: config
    })

  server.setErrorHandler((err, req, res) => {
    if (res.statusCode >= 500) {
      req.log.error({ req, res, err }, err && err.message)
    } else if (res.statusCode >= 400) {
      req.log.info({ req, res, err }, err && err.message)
    }

    if (res.statusCode >= 500 && config.isProduction) {
      res.send('An error has occurred')
    } else {
      res.send(err)
    }
  })
}

module.exports = fp(plugin)
