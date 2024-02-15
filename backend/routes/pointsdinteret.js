const express = require('express');
const fs = require('fs');


const router = express.Router();

//GET ALL
router.get("/", (req, res) => {
    const limite = req.query.limite ?? 1000;
    const page = req.query.page ?? 1;
    const type = req.query.type ?? null;
    const territoire = req.query.territoire ?? null;
    const nom = req.query.nom ?? '';
    let offset = limite * page - limite;
    res.setHeader('Content-Type', 'application/json');
    let query = `SELECT * FROM point_interet p WHERE p.nom_parc_lieu LIKE '%${nom}%' ${type ? ` AND p.type LIKE '${type}'` : ''}${territoire ? ` AND p.arrondissement = '${territoire}'` : ''} LIMIT ${limite} OFFSET ${offset};`;
    console.log(query);
    db.any(query).then(function(data) {
        res.status(200).json({
            code: 200,
            status: 'OK',
            count: data.length,
            data: data
        });
    }).catch(function(error) {
        console.log(error);
        res.status(500).json({
            code: 500,
            status: 'Error',
            error: error
        });
    });
});

//GET ONE USING ID
router.get("/:id", (req, res) => {
    const id = req.params.id;
    res.setHeader('Content-Type', 'application/json');
    db.any('SELECT * FROM point_interet WHERE id = $1', [id]).then(function(data) {
        res.status(200).json({
            code: 200,
            status: 'OK',
            count: data.length,
            data: data
        });
    }).catch(function(error) {
        res.status(500).json({
            code: 500,
            status: 'Error',
            error: error
        });
    });
});

//ADD NEW POINTS
router.post("/", (req, res) => {
    console.log(req.body);
    let fields = [];
    let values = [];
    let queryString = [];
    let count = 1;
    Object.keys(req.body).forEach(e => {
        fields.push(e);
        values.push(req.body[e]);
        queryString.push("$" + count);
        count++; 
    });
    let query = `INSERT INTO point_interet(${fields.toString()}) VALUES(${queryString.toString()}) RETURNING id`
    db.one(query, values).then(data => {
        res.status(200).json({
            code: 200,
            status: 'OK',
            data: {id: data.id}
        });
    }).catch(error => {
        res.status(500).json({
            code: 500,
            status: 'Error',
            error: error
        });
    });
});

//PATCH EXISITNG POINT USING ID
router.patch("/:id", (req, res) => {
    const id = req.params.id;
    console.log(req.body);
    let fields = [];
    let values = [];
    let queryString = [];
    let count = 1;
    Object.keys(req.body).forEach(e => {
        fields.push(e);
        values.push(req.body[e]);
        queryString.push(e + "=$" + count);
        count++; 
    });
    let query = `UPDATE point_interet SET ${queryString.toString()} WHERE id = ${id} RETURNING id`
    db.one(query, values).then(data => {
        res.status(200).json({
            code: 200,
            status: 'OK',
            data: {id: data.id}
        });
    }).catch(error => {
        res.status(500).json({
            code: 500,
            status: 'Error',
            error: error
        });
    });
});

router.delete("/:id", (req, res) => {
    const id = req.params.id;
    res.setHeader('Content-Type', 'application/json');
    db.any('DELETE FROM point_interet WHERE id = $1', id).then(function(data) {
        res.status(200).json({
            code: 200,
            status: 'OK'
        });
    }).catch(function(error) {
        res.status(500).json({
            code: 500,
            status: 'Error',
            error: error
        });
    });
});

module.exports = router;