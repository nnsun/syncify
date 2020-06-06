const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()

app.use(bodyParser.json())
app.use(cors())


const rooms = {}

const users = []

app.get('/', function(req, res) {
  res.send('you are: ' + req.get('host'))
})

app.post('/create', function(req, res) {
  if (req.room in rooms) {
    res.status(409).send()
    return
  }

  rooms[req.room] = {
    // TODO: hash password
    password: req.password,
    users: [],
  }

  res.status(201).send()
})

app.post('/join', function(req, res) {
  if (req.room in rooms) {
    if (req.data.password !== rooms.room.password) {
      res.status(401).send()
      return
    }
  }

  res.status(200).send()
})

const server = app.listen(process.env.PORT || 3000)
const io = require('socket.io')(server)

io.on('connect', function(socket) {
  let display_name = ''
  socket.on('info', function([display_name, room]) {
    this.display_name = display_name
    users.push(display_name)
    io.sockets.emit('users', users)
  })

  socket.on('disconnect', function() {
    const index = users.indexOf(this.display_name)
    if (index > -1) {
      users.splice(index, 1);
    }
    socket.broadcast.emit('users', users)
  })

  socket.on('pause', function() {
    socket.broadcast.emit('pause')
  })

  socket.on('resume', function() {
    socket.broadcast.emit('resume')
  })

  socket.on('seek', function(position) {
    socket.broadcast.emit('seek', position)
  })

  socket.on('song', function(uri) {
    socket.broadcast.emit('song', uri)
  })
})
