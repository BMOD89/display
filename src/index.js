require('dotenv').config()
const log4js = require('log4js')

const logger = log4js.getLogger()
const debugEnabled = process.env.DEBUG === '1'
logger.level = debugEnabled ? 'debug' : 'info'

const Database = require('./persistence/Database')
const DisplayService = require('./services/DisplayService')
const SocketController = require('./sockets/SocketController')
const SocketServer = require('./sockets/SocketServer')

/**
 * Make sure that all required environment variables are set.
 */
function checkEnvironment () {
  const missingEnvs = []

  for (const env of ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_PREFIX']) {
    if (!Object.prototype.hasOwnProperty.call(process.env, env)) {
      missingEnvs.push(env)
    }
  }

  if (missingEnvs.length > 0) {
    throw new Error(`The following mandatory environment variables have not been set: ${missingEnvs.join(', ')}`)
  }
}

// Catches any exception that has not been caught yet
process.setUncaughtExceptionCaptureCallback(err => {
  logger.fatal('Uncaught Exception:', err)
  process.exit(1)
})

checkEnvironment()

/**
 * Sets up the connection to the database.
 *
 * @return {Promise}
 * @throws Error If the connection to the database fails
 */
function connectDatabase () {
  const database = new Database(process.env.DB_HOST, process.env.DB_USER, process.env.DB_PASSWORD, process.env.DB_NAME, process.env.DB_PREFIX)
  return database.start()
    .catch(reason => {
      if (reason.errno && reason.errno === 1045) {
        throw new Error(`Could not connect to the database: ${reason.message}`)
      } else {
        throw reason
      }
    })
}

connectDatabase()
  .then(() => {
    const AlertRepository = require('./persistence/repositories/AlertRepository')
    const AlertService = require('./services/AlertService')
    const AnnouncementRepository = require('./persistence/repositories/AnnouncementRepository')
    const AnnouncementService = require('./services/AnnouncementService')
    const ContentSlotOptionRepository = require('./persistence/repositories/ContentSlotOptionRepository')
    const ContentService = require('./services/ContentService')
    const ContentSlotRepository = require('./persistence/repositories/ContentSlotRepository')
    const DisplayRepository = require('./persistence/repositories/DisplayRepository')
    const ViewRepository = require('./persistence/repositories/ViewRepository')

    const alertService = new AlertService(new AlertRepository())
    const announcementService = new AnnouncementService(new AnnouncementRepository())
    const displayService = new DisplayService(new DisplayRepository(), new ViewRepository(), new ContentSlotRepository(), new ContentSlotOptionRepository())
    const contentService = new ContentService(announcementService)

    const app = require('./app')(displayService, announcementService, alertService)
    const server = require('http').createServer(app)

    const port = process.env.PORT || 3000

    const socketServer = new SocketServer()
    const socketController = new SocketController(socketServer, displayService, contentService, alertService)
    socketController.registerListeners()
    socketServer.startListening(server)

    server.on('error', err => {
      logger.error('Server error:', err)
    })
    server.on('listening', () => {
      const address = server.address()
      logger.info(`Server listens on port ${address.port}`)
    })
    server.listen(port)
  })
  .catch(reason => {
    logger.fatal('Could not start the server', reason)
    process.exit(2)
  })
