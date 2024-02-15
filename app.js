const express = require('express');

const app = express();
const PORT = 3000;
const ROOT = '/gti525/v1';
const pgp = require('pg-promise')(/* options */)
db = pgp({
    host: 'gti525.cydewm3dfuxa.us-east-2.rds.amazonaws.com',
    port: 5432,
    database: '',
    user: 'postgres',
    password: '8055Xilef',
    max: 30, // use up to 30 connections
    ssl: {
        rejectUnauthorized: false
    }
})
app.use(express.static(__dirname));
app.use(express.json());
app.use('/', express.static(__dirname + "/frontend/pages"));
app.use('/img', express.static(__dirname + "/frontend/img"));
app.use('/files', express.static(__dirname + "/frontend/files"));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/frontend/pages/index.html');
})

app.get(ROOT, (req, res) => {
  res.status(200).sendFile(__dirname + '/backend/API.json');
});

//COMPTEURS
const compteursRouter = require('./backend/routes/compteurs');
app.use(ROOT + '/compteurs', compteursRouter)

//PISTES
const pistesRouter = require('./backend/routes/pistes');
app.use(ROOT + '/pistes', pistesRouter)

//POINTS
const pointsRouter = require('./backend/routes/pointsdinteret');
app.use(ROOT + '/pointsdinteret', pointsRouter)


