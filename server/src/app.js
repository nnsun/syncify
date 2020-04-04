const express = require('express')

const port = 8080

const app = express()

app.get('/', (req, res) => res.send('Hello test!'))

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
