# GTI525-labo01
Labo 01 pour GTI525 groupe 02

Installer node.js et run 'npm install'
Pour start le projet, utiliser 'npm start'
Pour stop le projet, utiliser Ctrl+C

La page http://127.0.0.1:3000/ ou http://localhost:3000/ devrait donner la page d'accueil

# API
root = http://127.0.0.1:3000/gti525/v1/

## Compteurs (backend/routes/compteurs)

GET 'compteurs/' -> retourne la liste des compteurs
GET 'compteurs/:id' -> retourne le compteur et tout ses comptages
GET 'compteurs/:id?debut=20200101&fin=20230101' -> retourne le compteur et tout ses comptages entre les dates donnees

## Pistes (backend/routes/pistes)

GET 'pistes/' -> retourne le contenu du fichier geojson

## Points d'interets (backend/routes/pointsdinteret)

GET 'pointsdinteret/' -> retourne le contenu du fichier fontaines.csv en JSON
GET 'pointsdinteret/1' -> Les détails du point d'intérêt dont l'identifiant est 1
GET 'pointsdinteret?limite=10' -> 10 points d'intérêts par page, première page
GET 'pointsdinteret?limite=10&page=2' -> 10 points d'intérêts par page, seconde page.
GET 'pointsdinteret?limite=10&page=2&type=fontaine' -> 10 points d'intérêts de type fontaine par page, seconde page
GET 'pointsdinteret?limite=10&page=2&territoire=Saint-Léonard' -> Points d'intérêt du territoire Saint-Léonard, 10 points d'intérêts, seconde page
GET 'pointsdinteret?limite=10&type=fontaine&nom=Saint-Martin' -> Première page, 10 fontaines par page, et dont les nom/description contiennent Saint-Martin.

//Pour ajouter un nouveau point
POST 'pointsdinteret' -> BODY : {
    "arrondissement" : "Lachine", //Territoire
    "nom_parc_lieu" : "Sainte-Anne 2",
    "proximite_jeux_repere" : "soccer" //ou autre,
    "intersection" : "rue Provost/24e ave",
    "etat" : null,
    "date_installation" : null,
    "remarque" : "grafiti",
    "precision_localisation" : "orthophotographies",
    "x" : "290340.85",
    "y" : "5033539.99",
    "longitude" : "-73.6848264937758",
    "latitude" : "45.4416422802227",
    "type" : "fontaine" //ou autre
}

//Pour modifier un point
PATCH 'pointsdinteret/id' -> BODY : {
    "arrondissement" : "Lachine", //Territoire
    "nom_parc_lieu" : "Sainte-Anne 2",
    "proximite_jeux_repere" : "soccer" //ou autre,
    "intersection" : "rue Provost/24e ave",
    "etat" : null,
    "date_installation" : null,
    "remarque" : "grafiti",
    "precision_localisation" : "orthophotographies",
    "x" : "290340.85",
    "y" : "5033539.99",
    "longitude" : "-73.6848264937758",
    "latitude" : "45.4416422802227",
    "type" : "fontaine" //ou autre
}

//Pour supprimer un point 
DELETE 'pointsdinteret/id'

