const express = require('express');
const router = express.Router();
const fs = require('fs');
const csv = require("csvtojson");
const moment = require('moment');


//Return all COMPTEURS
router.get("/", (req, res) => {
    //page et limite sont pour limit et peut-être offset.
    const limite = req.query.limite ?? 1000;
    const page = req.query.page ?? 1;
    const implantation = req.query.implantation;
    const nom = req.query.nom ?? '';

    let offset = limite * page - limite;

    res.setHeader('Content-Type', 'application/json');

    let query = `SELECT * FROM compteur c WHERE c.nom LIKE '%${nom}%' ${implantation ? `AND c.annee_implante = '${implantation}'` : ''} LIMIT ${limite} OFFSET ${offset}`;

    console.log(query);
    db.any(query).then(function(data){
        res.status(200).json({
            code: 200,
            status: 'OK',
            count: data.length,
            data: data
        });
    }).catch(function(error){
        console.log(error);
        res.status(500).json({
            code: 500,
            status: 'Error',
            error: error
        });
    });
});

router.get("/:id", (req, res) => {
    const id = req.params.id;
    const debut = req.query.debut;
    const fin = req.query.fin;
    console.log("PARAMS ID = " + id);
    console.log("PARAMS Debut = " + moment(debut).toDate());
    console.log("PARAMS Fin = " + moment(fin).toDate());
    res.setHeader('Content-Type', 'application/json');

    db.any('SELECT * FROM compteur WHERE id = $1', [id]).then(function(data){
        res.status(200).json({
            code: 200,
            status: "OK",
            count: data.length,
            data: data
        });
    }).catch(function(error){
        res.status(500).json({
            code: 500,
            status: 'Error',
            error: error
        });
    });
});

router.get("/:id/passages", async (req, res) =>{
    const id = req.params.id;
    const debut = req.query.debut ?? '2019-01-01';
    const fin = req.query.fin ?? new moment().format('YYYY-MM-DD');
    const intervalle = req.query.intervalle ?? 'jour';
    let intervalleQuery = 'day';
    switch(intervalle){
        case 'jour' : intervalleQuery = 'day'; break;
        case 'semaine' : intervalleQuery = 'week'; break;
        case 'mois' : intervalleQuery = 'month'; break;
        default : intervalleQuery = 'day'; break;
    }
    res.setHeader('Content-Type', 'application/json');
    let query = `SELECT DATE_TRUNC($1, TO_DATE(date, 'YYYY-MM-DD')) AS d, COUNT(*) FROM comptage WHERE id_compteur = $2 AND date BETWEEN $3 AND $4 GROUP BY d ORDER BY d;`
    //let query = `SELECT * FROM comptage WHERE id_compteur = $1 AND date BETWEEN $2 AND $3`;
    db.any(query, [intervalleQuery, id, debut, fin]).then(data => {
        res.status(200).json({
            code: 200,
            status: 'OK',
            data: data
        });
    }).catch(error => {
        res.status(500).json({
            code: 500,
            status: 'Error',
            error: error
        });
    });
})

module.exports = router;