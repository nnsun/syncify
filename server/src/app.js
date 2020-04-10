const express = require('express')

const port = 3000

const app = express()

app.get('/', function(req, res) {
  res.send('hello')
})

const server = app.listen(port)

const io = require('socket.io')(server)

io.on('connection', function(socket) {
  console.log('connected!')
})