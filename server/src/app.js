const express = require('express')

const app = express()

app.get('/', function(req, res) {
  res.send('you are: ' + req.get('host'))
})

const server = app.listen(process.env.PORT || 3000)
const io = require('socket.io')(server)

const room_users = []
queue = []

io.on('connect', function(socket) {
  let display_name = ''
  socket.on('info', function(display_name) {
    this.display_name = display_name
    room_users.push(display_name)
  })

  socket.on('disconnect', function() {
    console.log(room_users)
    const index = room_users.indexOf(this.display_name)
    if (index > -1) {
      room_users.splice(index, 1);
    }
    console.log(room_users)
  })

  socket.on('pause', function() {
    socket.broadcast.emit('pause')
  })

  socket.on('resume', function() {
    socket.broadcast.emit('resume')
  })

  socket.on('seek', function(position) {
    // socket.broadcast.emit('seek', position)
  })

  socket.on('song', function(uri) {
    socket.broadcast.emit('song', uri)
  })
})
