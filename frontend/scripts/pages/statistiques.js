var map;
var isMapInitialized = false;
var currentId;
var myChart;
$(document).ready(function() {

    document.getElementById('statsTable').style.display = 'none';
    document.getElementById('map').style.display = 'block';
    
    initSearchbar();
    initEventHandlers();
    // createGraph();
    fetchData();
    
});

function createMap()
{
    // Créer une carte Leaflet et l'afficher dans le div avec l'ID "map"
    map = L.map('map').setView([45.508, -73.587], 10);

    // Ajouter une couche de tuiles OpenStreetMap pour la carte de base
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    
    return map;
}

function initEventHandlers()
{
    // Fonction pour montrer ou pas l'onglet de la liste
    document.getElementById('tableBtn').addEventListener('click', function() {
        document.getElementById('statsTable').style.display = 'block';
        document.getElementById('map').style.display = 'none';
    });

    // Fonction pour montrer ou pas l'onglet de la carte
    document.getElementById('mapBtn').addEventListener('click', function() {
        document.getElementById('statsTable').style.display = 'none';
        document.getElementById('map').style.display = 'block';
    });

    document.getElementById('rechercheBtn').addEventListener('click', function() {
        let nom = document.getElementById('nomCompteur').value;
        let annee = document.getElementById('dateCompteur').value;
        cleanTable();
        fetchDataWithFilter(nom, annee);
    });
    document.getElementById('passage-search').addEventListener('click', function() {
        let startDate = document.getElementById('startDate').value;
        let endDate = document.getElementById('endDate').value;
        let intervalle = document.getElementById('interval').value;
        let id = currentId;
        fetchDataWithFilter(id,startDate,endDate,intervalle);
    });
}

function initSearchbar(){
    $("#nomCompteur").on('input', function(){
        let nom = $("#nomCompteur").val().toLowerCase();
        let rows = $(".table tbody tr");
        $.each(rows, function(i, row){
            if($(row).find("td:nth-child(2)").text().toLowerCase().includes(nom))
                $(row).show();
            else
                $(row).hide();
        })
    })
}


function createGraphIcon()
{
    var i = document.createElement("i");
    i.classList.add("fas", "fa-chart-bar");

    return i;
}

function createGraph(newData)
{
    // Sélectionner le canvas où le graphique sera rendu
    let chartStatus = Chart.getChart("passagesChart"); // <canvas> id
    if (chartStatus != undefined) {
        chartStatus.destroy();
    }
    var ctx = document.getElementById('passagesChart').getContext('2d');
    var data = newData.data;
    var labels = [];
    var dataset = [];
    data.forEach(d => {

        var newDate = new Date(d.d);
        const formatDate = newDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        labels.push(formatDate);
        dataset.push(d.count);
    });
    
    console.log(labels);

    // Données du graphique (exemple)
    var dataGraph = {
    labels: labels,
    datasets: [{
        label: 'Nombre de passages',
        data: dataset,
        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Couleur de fond
        borderColor: 'rgba(75, 192, 192, 1)', // Couleur de la ligne
        borderWidth: 1 // Largeur de la ligne
    }]
    };
    
    // Configuration du graphique
    var config = {
    type: 'bar', // Type de graphique (bar pour un graphique en barres)
    data: dataGraph,
    options: {
        scales: {
        y: {
            beginAtZero: true
        }
        }
    }
    };

    // Créer le graphique
    myChart = new Chart(ctx, config);

}

// function createGraph()
// {
//     let chartStatus = Chart.getChart("passagesChart"); // <canvas> id
//     if (chartStatus != undefined) {
//         chartStatus.destroy();
//     }
//     // Sélectionner le canvas où le graphique sera rendu
//     var ctx = document.getElementById('passagesChart').getContext('2d');

//     // Créer un tableau de labels pour les jours du 1er au 31
//     var labels = [];
//     for (var i = 1; i <= 31; i++) {
//         labels.push(i);
//     }

//     var data = [];

//     // Données du graphique (exemple)
//     var data = {
//     labels: labels,
//     datasets: [{
//         label: 'Nombre de passages',
//         data: [15, 25, 18, 30, 22, 28, 34, 42, 39, 29, 20, 15, 18, 25, 31, 37, 44, 49, 40, 32, 27, 23, 19, 15, 12, 28, 35, 41, 47, 50],
//         backgroundColor: 'rgba(75, 192, 192, 0.2)', // Couleur de fond
//         borderColor: 'rgba(75, 192, 192, 1)', // Couleur de la ligne
//         borderWidth: 1 // Largeur de la ligne
//     }]
//     };

//     // Configuration du graphique
//     var config = {
//     type: 'bar', // Type de graphique (bar pour un graphique en barres)
//     data: data,
//     options: {
//         scales: {
//         y: {
//             beginAtZero: true
//         }
//         }
//     }
//     };

//     // Créer le graphique
//     var myChart = new Chart(ctx, config);

// }

function processCompteurs(data)
{
    var tbody = document.getElementById("statsTable").querySelector("tbody");

    if(!isMapInitialized)
    {
        map = createMap();
    }
    

    for (const c of data.data)
    {
        var row = tbody.insertRow();
        var identifiantCell = row.insertCell(0);
        var nomCell = row.insertCell(1);
        var statutCell = row.insertCell(2);
        var anneeCell = row.insertCell(3);
        var passagesCell = row.insertCell(4);
        
        //insert the values readed to the row
        identifiantCell.textContent = c.id;
        nomCell.textContent = c.nom;
        statutCell.textContent = c.statut;
        anneeCell.textContent = c.annee_implante;
        
        //Adds the graph icon to the passages column for each row
        var passagesBtn = document.createElement("button");
        passagesBtn.setAttribute("data-bs-toggle", "modal");
        passagesBtn.setAttribute("data-bs-target", "#passagesModal");
        passagesBtn.setAttribute("data-info", c.nom);
        passagesBtn.classList.add("passages-btn");
        var graphIcon = createGraphIcon();
        passagesBtn.appendChild(graphIcon);
        passagesCell.style = "text-align:center;";
        passagesCell.appendChild(passagesBtn);
        
        
        //Add listener to send data to the modal view
        passagesBtn.addEventListener("click", function() {
            // Passes the data to modal view
            var modal = document.getElementById("passagesModal");
            var data_info = this.getAttribute("data-info");

            var modalBody = modal.querySelector(".modal-body");
            var modalTitle = modal.querySelector(".modal-title");

            modalTitle.textContent = "Statistiques des passages: " + data_info;
            currentId = c.id;
            
        });

        if(!isMapInitialized)
        {
            //inserts markers and pop-up hints to the map
            const marker = L.marker([c.latitude, c.longitude]).addTo(map);
            marker.bindPopup(`<b>${c.nom}</b>`); // Afficher le nom du compteur au clic sur le marqueur
        }
    }

    isMapInitialized = true;
}

function fetchData() {
    fetch('/gti525/v1/compteurs').then(response => {
        if(!response.ok) {
            throw new Error('Error fetching data');
        }
        return response.json();
    }).then(data => {
        document.getElementById('nombre-compteurs-text').textContent = `Le réseau cyclable de Montréal est composé de ${data.data.length} compteurs.`;
        processCompteurs(data);
    }).catch(error =>{
        console.error('Fetch operation failed', error);
    })
};

function fetchDataWithFilter(nom, annee) {

    let url = `/gti525/v1/compteurs/?implantation=${annee}&nom=${nom}`;

    if(nom == '')
    {
        url = `/gti525/v1/compteurs/?implantation=${annee}`
    }
    console.log(url);

    fetch(url).then(response => {
        if(!response.ok) {
            throw new Error('Error fetching data');
        }
        return response.json();
    }).then(data => {
        processCompteurs(data);
    }).catch(error =>{
        console.error('Fetch operation failed', error);
    })
};
function fetchDataWithFilter(id, dateDebut, dateFin, intervalle) {

    let url = `/gti525/v1/compteurs/${id}/passages?debut=${dateDebut}&fin=${dateFin}&intervalle=${intervalle}`;

    console.log(url);

    fetch(url).then(response => {
        if(!response.ok) {
            throw new Error('Error fetching data');
        }
        return response.json();
    }).then(data => {
        createGraph(data);
    }).catch(error =>{
        console.error('Fetch operation failed', error);
    })
};
function cleanTable()
{
    var rows = document.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

    for (var i = rows.length - 1; i >= 0; i--) {
        var row = rows[i];
        row.parentNode.removeChild(row);
    }
}
