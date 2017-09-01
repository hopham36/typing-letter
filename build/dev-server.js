require('./check-versions')()

var config = require('../config')
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}

var opn = require('opn')
var path = require('path')
var express = require('express')
var webpack = require('webpack')
var proxyMiddleware = require('http-proxy-middleware')
var webpackConfig = require('./webpack.dev.conf')
var favicon = require('serve-favicon');

// default port where dev server listens for incoming traffic
var port = process.env.PORT || config.dev.port
// automatically open browser, if not set will be false
var autoOpenBrowser = !!config.dev.autoOpenBrowser
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
var proxyTable = config.dev.proxyTable

var app = express()
var compiler = webpack(webpackConfig)

var devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  quiet: true
})

var hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: () => {}
})
// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    hotMiddleware.publish({ action: 'reload' })
    cb()
  })
})

// proxy api requests
Object.keys(proxyTable).forEach(function (context) {
  var options = proxyTable[context]
  if (typeof options === 'string') {
    options = { target: options }
  }
  app.use(proxyMiddleware(options.filter || context, options))
})

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

// serve pure static assets
var staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
app.use(staticPath, express.static('./static'))
app.use(favicon(path.resolve(__dirname, '../static/favicon.ico')));

var uri = 'http://localhost:' + port

var _resolve
var readyPromise = new Promise(resolve => {
  _resolve = resolve
})

console.log('> Starting dev server...')
devMiddleware.waitUntilValid(() => {
  console.log('> Listening at ' + uri + '\n')
  // when env is testing, don't need open it
  if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
    opn(uri)
  }
  _resolve()
})

var server = app.listen(port)
var io = require('socket.io')(server)
var game = io.of('/game')

game.on("connection", function (socket) {
  socket.on("joinRoom", function (result) {
    socket.join(result.room, function () {
      var roomLength = io.nsps["/game"].adapter.rooms[result.room].length
      socket.room = result.room
      socket.userId = result.userId
      socket.userName = result.userName
      socket.isHost = roomLength == 1
      game.to(result.room).emit("init", {
        roomLength: roomLength,
        socketId: socket.id
      })
    })
  })

  socket.in(socket.room).on('disconnect', function(){
    socket.broadcast.to(socket.room).emit('userDisconnect', {userId: socket.userId, userName: socket.userName, isHost: socket.isHost})
  })

  socket.in(socket.room).on("initGameFromOther", function (data) {
    socket.broadcast.to(socket.room).emit('initGameFromOther')
  })

  socket.in(socket.room).on("initGameToOther", function (data) {
    socket.broadcast.to(socket.room).emit('sendGame', data)
  })

  socket.in(socket.room).on("initBot", function (data) {
    socket.broadcast.to(socket.room).emit('initBot', data)
  })

  socket.in(socket.room).on("sendNumberOfPlayer", function (data) {
    socket.broadcast.to(socket.room).emit('getNumberOfPlayer', data)
  })

  socket.in(socket.room).on("completeWorld", function (number) {
    socket.broadcast.to(socket.room).emit('completeWorld', number)
  })
  socket.in(socket.room).on("chat", function (data) {
    socket.broadcast.to(socket.room).emit('getChat', data)
  })
  socket.in(socket.room).on("startGame", function (data) {
    socket.broadcast.to(socket.room).emit('sendStartGame', data)
  })
  socket.in(socket.room).on("changeRoom", function (data) {
    socket.broadcast.to(socket.room).emit('sendChangeRoom', data)
  })
})

module.exports = {
  ready: readyPromise,
  close: () => {
    server.close()
  }
}
