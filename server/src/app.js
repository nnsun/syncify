const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()

app.use(bodyParser.json())
app.use(cors())


const rooms = {}

app.get('/', function(req, res) {
  res.send('you are: ' + req.get('host'))
})

app.post('/create', function(req, res) {
  if (req.body.room in rooms) {
    res.status(409).send()
    return
  }

  rooms[req.body.room] = {
    // TODO: hash password
    password: req.body.password,
    users: [],
  }

  res.status(201).send()
})

app.post('/join', function(req, res) {
  if (req.body.room in rooms) {
    if (req.data.password === rooms.room.password) {
      res.status(200).send()
      return
    }
  }

  res.status(401).send()
})

const server = app.listen(process.env.PORT || 3000)
const io = require('socket.io')(server)

io.on('connect', function(socket) {
  let room = null
  let displayName = ''

  socket.on('info', function([displayName, room]) {
    this.room = room
    this.displayName = displayName
    rooms[room].users.push(displayName)
    io.sockets.emit('users', rooms[room].users)
  })

  socket.on('disconnect', function() {
    const index = rooms[this.room].users.indexOf(this.displayName)
    if (index > -1) {
      rooms[this.room].users.splice(index, 1);
    }

    if (rooms[this.room].users.length == 0) {
      delete rooms[this.room]
    }
    else {
      socket.broadcast.emit('users', rooms[this.room].users)
    }
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
