const express = require('express')

const app = express()

app.get('/', function(req, res) {
  res.send('you are: ' + req.get('host'))
})

const server = app.listen(process.env.PORT || 3000)

const io = require('socket.io')(server)

io.on('connection', function(socket) {

  socket.on('pause', function() {
    socket.broadcast.emit('pause')
  })

  socket.on('resume', function() {
    socket.broadcast.emit('resume')
  })

  socket.on('seek', function(position) {
    socket.broadcast.emit('update', position)
  })

  socket.on('song', function(uri) {
    socket.broadcast.emit('song', uri)
  })
})
