//var table = document.getElementById("interest-table").getElementsByTagName('tbody')[0];
//var rows = table.tBodies[0].rows
// var rowsPerPage = 20;
// var currentPage = 1;

//const { response } = require("express");

let geoTerritories = "backend/data/territoires.geojson";
let pointsInteretRoute = '/gti525/v1/pointsdinteret';
let features;
let geoJSONLayer;
let form_status;
let selectedArrondissement;

$(document).ready(function () {

    document.getElementById('tableau-points-interets').style.display = 'block';
    document.getElementById('ajouter-form').style.display = 'none';

    setupListeners();

    loadCSV();
    fetchPointsInteret();
});

function setupListeners()
{
    locationsSelect = document.getElementById('locations');
    locationsSelect.addEventListener('change', function(event) {
        let locationsSelect = document.getElementById('locations');
        let arrondissement = locationsSelect.options[locationsSelect.selectedIndex].textContent;
        let type = document.getElementById('types').value;

        filterPointsInteret(arrondissement, type);
    });

    typesSelect = document.getElementById('types');
    typesSelect.addEventListener('change', function(event) {
        let locationsSelect = document.getElementById('locations');
        let arrondissement = locationsSelect.options[locationsSelect.selectedIndex].textContent;
        let type = document.getElementById('types').value;

        filterPointsInteret(arrondissement, type);
    });

    ajouterBtn = document.getElementById('ajouterLink');
    ajouterBtn.addEventListener('click', function(event) {
        form_status = "ajouter";
        event.preventDefault();
        cleanForm();
        montrerOnglet('ajouter-form');
        document.getElementById("form-title").textContent = "Ajout d'un nouveau point d'intérêt";
    });


    annulerBtn = document.getElementById('annulerBtn');
    annulerBtn.addEventListener('click', function(event) {
        document.getElementById('ajouter-form').reset();
        montrerOnglet('tableau-points-interets');
    });

    deleteBtn = document.getElementById("supprimerBtn");
    deleteBtn.addEventListener('click', function(event){
        row = document.getElementById('tableau-points-interets').querySelector('.selected');
        id = row.getAttribute("id");
        deletePointInteret(id);
        fetchPointsInteret();
        row.remove();
    });

    var selectElement = document.getElementById("type-lieu");
    selectElement.addEventListener("change", function(event) {
        updateForm();
    });

    registerBtn = document.getElementById("enregistrerBtn");
    registerBtn.addEventListener('click', function(event){
        event.preventDefault();

        if(form_status == "modifier")
        {
            const data = {
                nom_parc_lieu : document.getElementById("nom-lieu").value,
                intersection : document.getElementById("adresse").value,
                arrondissement : document.getElementById("arrondissement").options[document.getElementById("arrondissement").selectedIndex].textContent,
                type : document.getElementById("type-lieu").value,
                latitude : document.getElementById("latitude").value,
                longitude : document.getElementById("longitude").value,
                remarque : document.getElementById("remarques").value
            };

            if (document.getElementById("disponible-depuis").value !== "") {
                data.date_installation = document.getElementById("disponible-depuis").value;
            }
            
            var row = document.getElementById('tableau-points-interets').querySelector('.selected');
            var id = row.getAttribute("id");
            
            updatePointInteret(id, data);

            montrerOnglet('tableau-points-interets');
            fetchPointsInteret();
        }
        else if (form_status == "ajouter")
        {
            const data = {};

            const nomParcLieu = document.getElementById("nom-lieu").value;
            const intersection = document.getElementById("adresse").value;
            const arrondissementElement = document.getElementById("arrondissement");
            const arrondissement = arrondissementElement.options[arrondissementElement.selectedIndex]?.textContent;
            const type = document.getElementById("type-lieu").value;
            const latitude = document.getElementById("latitude").value;
            const longitude = document.getElementById("longitude").value;
            const remarque = document.getElementById("remarques").value;

            if (nomParcLieu !== null && nomParcLieu !== "") {
                data.nom_parc_lieu = nomParcLieu;
            }
            
            if (intersection !== null && intersection !== "") {
                data.intersection = intersection;
            }
            
            if (arrondissement !== null && arrondissement !== "") {
                data.arrondissement = arrondissement;
            }
            
            if (type !== null && type !== "") {
                data.type = type;
            }
            
            if (latitude !== null && latitude !== "") {
                data.latitude = latitude;
            }
            
            if (longitude !== null && longitude !== "") {
                data.longitude = longitude;
            }
            
            if (remarque !== null && remarque !== "") {
                data.remarque = remarque;
            }

            if (document.getElementById("disponible-depuis").value !== "") {
                data.date_installation = document.getElementById("disponible-depuis").value;
            }
            
            addPointInteret(data);

            montrerOnglet('tableau-points-interets');
            fetchPointsInteret();
        }
    });

    modifyBtn = document.getElementById("modifierBtn");
    modifyBtn.addEventListener('click', function(event){
        form_status = "modifier";

        document.getElementById("form-title").textContent = "Modifier un point d'intérêt";

        row = document.getElementById('tableau-points-interets').querySelector('.selected');
        id = row.getAttribute("id");
        console.log(`id: ${id}`);
        montrerOnglet('ajouter-form');

        //Obtenir les valeurs du point d'intérêt
        getPointInteret(id)
        .then(pi => {
            document.getElementById("nom-lieu").setAttribute("value", pi.nom_parc_lieu);
            
            if (pi.intersection !== null) {
                document.getElementById("adresse").setAttribute("value", pi.intersection);
            }
            else
            {
                document.getElementById("adresse").setAttribute("value", "");
            }

            if (pi.arrondissement !== null) {

                var selectArrondissement = document.getElementById("arrondissement");

                // Trouver l'index qui coincide avec la valeur que nous voulons sélectionner
                for (var i = 0; i < selectArrondissement.options.length; i++) {
                    if (selectArrondissement.options[i].textContent === pi.arrondissement) {
                        selectArrondissement.selectedIndex = i;
                        break;
                    }
                }
            }
            else
            {
                document.getElementById("arrondissement").selectedIndex = 0;
            }

            if (pi.date_installation !== null) {
                document.getElementById("disponible-depuis").value = pi.date_installation.split('T')[0];
            }
            else
            {
                document.getElementById("disponible-depuis").value = "";
            }

            if (pi.type == "fontaine") {
                document.getElementById("type-lieu").selectedIndex = 0;
            }
            else
            {
                document.getElementById("type-lieu").selectedIndex = 1;
            }

            if (pi.latitude !== null) {
                document.getElementById("latitude").setAttribute("value", pi.latitude);
            }
            else
            {
                document.getElementById("latitude").setAttribute("value", "");
            }

            if (pi.longitude !== null) {
                document.getElementById("longitude").setAttribute("value", pi.longitude);
            }
            else
            {
                document.getElementById("longitude").setAttribute("value", "");
            }

            if (pi.remarque !== null) {
                document.getElementById("remarques").value = pi.remarque;
            }
            else
            {
                document.getElementById("remarques").value = "";
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });

    });
    modalButton = document.getElementById("pop-up-modal");
    modalButton.addEventListener('click', function(event) {
        console.log("modal open click");
        var row = document.getElementById('tableau-points-interets').querySelector('.selected');
        id = row.getAttribute("id");
        console.log(`id: ${id}`);
        console.log(`Arrondissement: ${selectedArrondissement}`);

        
        var element = document.getElementById("mapModal");
        var modal = new bootstrap.Modal(element);
        modal.show();
        console.log("init map");
        initMap(id);
        console.log("showing map...");
        const changeTitle = document.getElementById('points-interets-title-change');
        changeTitle.innerHTML = `<h3>Points d'intérêt: ${selectedArrondissement}</h3>`
        $('#mapModal').on('shown.bs.modal', function () {
            mapModal.invalidateSize();
        });
    });

    var closeModalButton = document.getElementById("closeModal");
    closeModalButton.addEventListener('click', function(event) {
        deInitMap();
        var element = document.getElementById("mapModal");
        var modal = new bootstrap.Modal(element);
        modal.hide();
        
    });

}
var mapModal;
function initMap(id){
    
    mapModal = L.map('mapModalContainer',{
        preferCanvas: true
    }).setView([45.5017, -73.5700],10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 15,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapModal);
        getArrondissement(selectedArrondissement)
        .then(data => {
            piData = data.data;
            piData.forEach(pi => {
                const latitude = parseFloat(pi.latitude);
                const longitude = parseFloat(pi.longitude);
                const currentPI = parseFloat(pi.id);
                console.log(currentPI);
                console.log(id);
                if(currentPI === parseFloat(id)){
                    L.marker([latitude,longitude], {
                        icon: L.icon({
                            iconUrl: '/frontend/img/marker-icon-2x-red.png',
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                            shadowSize: [41, 41]
                        })
                    })
                    .addTo(mapModal)
                    .bindPopup(`<b> ${pi.intersection}`)
                }else{
                    L.marker([latitude,longitude])
                    .addTo(mapModal)
                    .bindPopup(`<b> ${pi.intersection}`);
                }
                
            });

        })
        .catch(error =>{
            console.error(error.message)
        });
        
}
function deInitMap(){
    if(mapModal){
        mapModal.remove();
        mapModal = null;
    }
}


function montrerOnglet(divId) {
    document.getElementById('tableau-points-interets').style.display = 'none';
    document.getElementById('ajouter-form').style.display = 'none';

    // Mostrar el div correspondiente al botón presionado
    document.getElementById(divId).style.display = 'block';

    if(divId == 'ajouter-form')
    {
        updateForm();
    }
}

function loadCSV() {
    // CSV file route
    let csvTerritories = "../backend/data/territoires.csv";


    // table where the data is going to be displayed
    var table = $('.table tbody');

    $.ajax({
        url: csvTerritories,
        datatype: 'text',
        success: function (data) {
            let lines = data.split('\n');
            for (let i = 1; i < lines.length; i++) {
                let rowData = lines[i].split(',');
                if (rowData.length == 3) {

                    for (var select of document.getElementsByClassName("select-territoires"))
                    {
                        let option = document.createElement("option");
                        option.value = `${i}`;
                        option.text = rowData[0];
                        select.add(option);
                    }
                }
            }
        }
    })

    document.getElementById("locations").onchange = function () { onLocationChange(document.getElementById("locations")) };
}

function updateForm()
{
    let latitudeInput = document.getElementById("latitude");
    let longitudeInput = document.getElementById("longitude");

    let typeLieuSelect = document.getElementById("type-lieu");

    if(typeLieuSelect.value == "fontaine")
    {
        latitudeInput.parentNode.style.display = 'block';
        longitudeInput.parentNode.style.display = 'block';
    }
    else if(typeLieuSelect.value == "atelier")
    {
        latitudeInput.parentNode.style.display = 'none';
        longitudeInput.parentNode.style.display = 'none';
    }
}

function fetch_territories() {
    fetch(geoTerritories).then(response => {
        if (!response.ok) {
            throw new Error('Error fetching points of interest data.');
        }
        return response.json();
    }).then(data => {
        features = data;
        displayTerritories(features);
    }).catch(error => {
        console.error('Fetch operation failed', error);
    });
}

function displayPointsInteret(data)
{
    cleanTable();

    var tbody = document.getElementById("tableau-points-interets").querySelector("tbody");
    var points_interet = data.data;

    points_interet.forEach(function(pi){
        var row = tbody.insertRow();
        var arrondissementCell = row.insertCell(0);
        var typeCell = row.insertCell(1);
        var lieuCell = row.insertCell(2);
        var adresseCell = row.insertCell(3);

        row.setAttribute("id", pi.id);

        //insert the values readed to the row
        arrondissementCell.textContent = pi.arrondissement;
        typeCell.textContent = pi.type;
        lieuCell.textContent = pi.nom_parc_lieu;
        adresseCell.textContent = pi.intersection;


        row.addEventListener('click', function() {
            // Déselectionner toutes les lignes
            var allRows = tbody.getElementsByTagName("tr");
            for (var i = 0; i < allRows.length; i++) {
                allRows[i].classList.remove('selected');
            }
    
            // Ajouter la classe selected a la ligne sélectionnnée
            row.classList.add('selected');
    
            var selectedData = pi.arrondissement; 
            selectedArrondissement = selectedData;
            console.log('Selected row:', selectedData);
        });
    });
}

function fetchPointsInteret() {
    fetch(pointsInteretRoute).then(response => {
        if(!response.ok) {
            throw new Error('Error fetching points of interest from route /gti525/v1/pointsdinteret');
        }
        return response.json();
    }).then(data => {
        displayPointsInteret(data);
    }).catch(error =>{
        console.error('Fetch operation failed', error);
    })
};

function displayTerritories(data) {
    geoJSONLayer = L.geoJSON(data, {}).addTo(mapSmall);
}

function onLocationChange(selectObject) {
    mapSmall.eachLayer(function (layer) {
        if(layer.feature) mapSmall.removeLayer(layer);
    });
    geoJSONLayer?.clearLayers();
    if (selectObject.selectedIndex == 0) {
        geoJSONLayer = L.geoJSON(features, {}).addTo(mapSmall);
    } else {
        geoJSONLayer = L.geoJSON(features, {
            style: function(feature) { 
                if(feature == features.features[selectObject.selectedIndex]) 
                    return { color: "#ff0000" }
                return {};
            }
        }).addTo(mapSmall);
    }
    
}

function deletePointInteret(id)
{
    fetch(`${pointsInteretRoute}/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error deleting the point of interest. Code: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error('Error:', error.message);
    });
}

function getPointInteret(id)
{
    return fetch(`${pointsInteretRoute}/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error when trying to get the interest point. Código de estado: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        return data.data[0];
    })
    .catch(error => {
        console.error('Error:', error.message);
    });
}

function updatePointInteret(id, data)
{
    console.log(data);
    fetch(`${pointsInteretRoute}/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error when updating the point of interest. Code: ${response.status}`);
        }
        return response.json();
    })
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.error('Error:', error.message);
    });
}

function addPointInteret(data)
{
    fetch(pointsInteretRoute, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Response ', data);
    })
      .catch(error => {
        console.error('Error:', error);
    });
}

function cleanForm() {
    // Obtener el formulario por su ID
    var formulario = document.getElementById("ajouter-form");

    // Iterar sobre todos los elementos del formulario
    for (var i = 0; i < formulario.elements.length; i++) {
        var elemento = formulario.elements[i];

        // Verificar el tipo de elemento y limpiar su valor
        switch (elemento.type) {
            case "text":
            case "date":
            case "textarea":
                elemento.value = "";
                break;
            case "select-one":
                elemento.selectedIndex = 0; // Establecer la primera opción como seleccionada
                break;
        }
    }
}

function filterPointsInteret(arrondissement, type)
{
    let url = `${pointsInteretRoute}/?territoire=${arrondissement}&type=${type}`;

    if(arrondissement == "Tous")
    {
        url = `${pointsInteretRoute}/?type=${type}`
    }

    fetch(url)
    .then(response => {
        if (!response.ok) {
        throw new Error(`Error al realizar la solicitud. Código de estado: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        displayPointsInteret(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function cleanTable()
{
    var rows = document.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

    for (var i = rows.length - 1; i >= 0; i--) {
        var row = rows[i];
        row.parentNode.removeChild(row);
    }
}

function getArrondissement(arrondissement)
{
    let url = `${pointsInteretRoute}/?territoire=${arrondissement}`;

    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error in getting arrondissement: ${response.status}`);
        }
            return response.json();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
