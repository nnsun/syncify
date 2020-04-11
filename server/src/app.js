const express = require('express')

const port = 3000
const app = express()

app.get('/', function(req, res) {
  res.send('you are: ' + req.get('host'))
})

const server = app.listen(port)

const io = require('socket.io')(server)

io.on('connection', function(socket) {

  socket.on('update', function(state) {
    socket.broadcast.emit('update', state)
    console.log(state)
  })
})
