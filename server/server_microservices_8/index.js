const express = require('express');
const cors = require('cors');
const app = express();

require('dotenv').config();

app.use(cors({
    // origin : 'http://localhost:8081'
    origin : '*'
}));

app.use(express.json());






const apelPelaksanaan = require('./apiMysql/listAbsenFull');
app.use('/micro_8/listAbsenFull', apelPelaksanaan);







app.get('/', (req, res) => {
    res.json({
      message: '🦄🌈✨Hello pengunjung,,, Anda mengunjugi alamat yg salah... mungkin maksud anda http://konaweselatankab.go.id ! 🌈✨🦄',
      user : req.user
    });
});












  const port = process.env.PORT || 50288;
  const server = app.listen(port, () => {
    console.log('Listening on port', port);
  });