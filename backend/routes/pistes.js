const express = require('express');
const turf = require('@turf/turf');
const fs = require('fs');
const router = express.Router();
var wkx = require('wkx');
const moment = require('moment');

//Get piste depending on dates
router.get("/", async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try{
        if(!req.query.populaireDebut){ //Retourne tous les pistes (pas de date/populaire)
            let query = `SELECT * FROM reseau_cyclable`;
            console.log(query);
            const data = await db.any(query);
            let features = [];
            data.forEach((d) => {
                var geometry = wkx.Geometry.parse(d.wkb_geometry);
                delete d.wkb_geometry;
                features.push({
                    "type": "Feature", 
                    "properties": d,
                    "geometry": geometry.toGeoJSON()
                });
                    
            });
            res.status(200).json({
                code: 200,
                status: 'OK',
                data: {
                    "type": "FeatureCollection",
                    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
                    "features": features
                }
            }); 
        }else{ //Retourne les pistes populaires avec les dates
            const populaireDebut = req.query.populaireDebut;
            const populaireFin = req.query.populaireFin ?? new moment().format('YYYY-MM-DD');
            
            let dateFilter = '';
            if(populaireDebut){
                dateFilter = `AND cp.date >=$1`;
            }
            if(populaireFin){
                dateFilter += `AND cp.date <= $2`;
            }
            //let compteurQuery = `SELECT DATE_TRUNC($1, TO_DATE(date, 'YYYY-MM-DD')) AS d, COUNT(*) FROM comptage WHERE id_compteur = $2 AND date BETWEEN $3 AND $4 GROUP BY d ORDER BY d;`;
            let query = `SELECT r.* FROM
                            (SELECT
                                subquery.nom AS nom,
                                subquery.abrev,
                                subquery.total_count,
                                subquery.total_compteur,
                                total_count / total_compteur AS popularite
                            FROM (SELECT DISTINCT ON (t.abrev)
                                    t.nom,
                                    t.abrev,
                                    SUM(ct.count) AS total_count,
                                    COUNT(DISTINCT c.id) AS total_compteur
                                FROM
                                    Territoire t
                                JOIN
                                    Compteur c ON ST_Within(ST_SetSRID(ST_MakePoint(c.longitude::numeric, c.latitude::numeric), 4326), t.wkb_geometry)
                                JOIN
                                    Comptage ct ON c.id = ct.id_compteur2
                                WHERE
                                    ct.date > $1 AND ct.date < $2
                                GROUP BY    
                                    t.nom,
                                    t.abrev) AS subquery
                                ORDER BY 
                                    popularite DESC
                                LIMIT 3
                            ) AS subquery2
                        JOIN Territoire t2 ON t2.nom = subquery2.nom
                        JOIN Reseau_cyclable r ON ST_Intersects(ST_SetSRID(r.wkb_geometry::geometry, 4326), ST_SetSRID(t2.wkb_geometry::geometry, 4326));`;
            const data = await db.any(query, [populaireDebut, populaireFin])
            let features = [];
            data.forEach((d) => {
                var geometry = wkx.Geometry.parse(d.wkb_geometry);
                delete d.wkb_geometry;
                features.push({
                    "type": "Feature", 
                    "properties": d,
                    "geometry": geometry.toGeoJSON()
                });
                    
            });
            res.status(200).json({
                code: 200,
                status: 'OK',
                data: {
                    "type": "FeatureCollection",
                    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
                    "features": features
                }
            }); 
        }
    }catch (error) { //ERROR
        res.status(500).json({
            code: 500,
            status: 'Error',
            error: error
        });
    }
});

// get piste avec ID
router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        console.log("PARAMS ID = " + id);

        res.setHeader('Content-Type', 'application/json');
        //let stream = fs.createReadStream('backend/data/reseau_cyclable.geojson');
        let query = `SELECT * FROM reseau_cyclable WHERE id_cycl= '${id}'`;
        console.log(query);

        const data = await db.any(query, [id]);

        let features = [];
        data.forEach((d) => {
            var geometry = wkx.Geometry.parse(d.wkb_geometry);
            delete d.wkb_geometry;
            features.push({
                "type": "Feature", 
                "properties": d,
                "geometry": geometry.toGeoJSON()
            });
            
        });
        res.status(200).json({
            code: 200,
            status: 'OK',
            data: {
                "type": "FeatureCollection",
                "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
                "features": features
            }
        });
    
    }catch(error) {
        res.status(500).json({
            code: 500,
            status: 'Error',
            error: error
        });
    };
});

module.exports = router;