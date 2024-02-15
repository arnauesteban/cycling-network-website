let geoData;
let geoJSONLayer;
let fourSeasons = false;
const pistesRoute = '/gti525/v1/pistes';

$(document).ready(function() {
    fetchData();
});

//Add event listeners
window.onload = () => {
    document.getElementById('4saisons').addEventListener('change', seasonsCheckbox);
    document.getElementById('saisonnier').addEventListener('change', seasonsCheckbox);
    document.getElementById('voies_partagees').addEventListener('change', updateData);
    document.getElementById('voies_protegees').addEventListener('change', updateData);
    document.getElementById('search-button').addEventListener('click', updateSearchData);
}

function fetchData() {
    fetch(pistesRoute).then(response => {
        if(!response.ok) {
            throw new Error(`Error fetching data: ${response.status}`);
        }
        return response.json();
    }).then(data => {
        geoData = data.data;
        displayData(data.data);
    }).catch(error =>{
        console.error('Fetch operation failed', error);
    })
};

function displayData(data) {
    if(geoJSONLayer) {
        map.removeLayer(geoJSONLayer);
    }
    geoJSONLayer = L.geoJSON(data, { style: colorLine }).addTo(map);
};

function updateData() {
    if(geoJSONLayer) {
        map.removeLayer(geoJSONLayer);
    }
    const data = filterGeoData(geoData);
    geoJSONLayer = L.geoJSON(data, { style: colorLine }).addTo(map);
};

function updateSearchData() {
    if(geoJSONLayer) {
        map.removeLayer(geoJSONLayer);
    }
    startDate = document.getElementById("date_initiale");
    endDate = document.getElementById("date_finale");
    
    if(startDate){
        startDate = startDate.value;
        endDate = endDate.value;
        if(startDate ==='' || startDate === null || startDate === undefined){
            alert("Il n'y a aucune date de début. Veuillez entrer une date de début");
            const data = filterGeoData(geoData);
            geoJSONLayer = L.geoJSON(data, { style: colorLine }).addTo(map);
        }else{
            if(endDate ==='' || endDate === null || endDate === undefined){
                endDate = new Date().toISOString().split('T')[0];
                
            } else{
                if(endDate < startDate){
                    alert("La date de fin ne peut pas êttre avant le début");
                    console.error("End date is before start date", error);
                }
            }
            startDate = startDate.replace(/-/g, "");
            endDate = endDate.replace(/-/g, "");
            console.log(startDate);
            console.log(endDate);
            alert(`On cherche toutes les pistes populaires entre ${startDate} et ${endDate}. Donne nous quelques secondes`);
            fetch(`${pistesRoute}?populaireDebut=${startDate};populaireFin=${endDate}`).then(response => {
                if(!response.ok) {
                    throw new Error(`Error fetching data: ${response.status}`);
                }
                return response.json();
            }).then(data => {
                filteredData = filterGeoData(data.data);
                geoData = data.data;
                console.log(filteredData);
                geoJSONLayer = L.geoJSON(filteredData, { style: colorLine }).addTo(map);
            }).catch(error =>{
                console.error('Fetch operation failed', error);
            });
        }  
    } else{
        const data = filterGeoData(geoData);
        geoJSONLayer = L.geoJSON(data, { style: colorLine }).addTo(map);
    }
};

function seasonsCheckbox() {
    console.log('checkbox change');
    const selected = document.getElementById('4saisons').checked;
    console.log('4 saisons is: '+ selected);
    fourSeasons = selected;
    updateData();
};

function filterGeoData(data){
    let filteredData = data;
    let voie_partagees = document.getElementById('voies_partagees');
    let voie_protegee = document.getElementById('voies_protegees');
    //console.log(filteredData);
    if(fourSeasons){
        filteredData = data.features.filter(feature =>feature.properties.saisons4 == "Oui");
    } else{
        filteredData = data.features;
    }
    if(voie_partagees.checked && !voie_protegee.checked) {
            filteredData = filteredData.filter(feature => {
                if(['1', '3', '8', '9'].includes(feature.properties.type_voie_code)){ //Si TYPE_VOIE_CODE est 1, 3, 8 ou 9
                    return feature.properties.avancement_code == 'E'; //Et AVANCEMENT_CODE est 'E'
                }
                return false;
            });
    }
    else if(!voie_partagees.checked && voie_protegee.checked) {
            filteredData = filteredData.filter(feature => {
                if(['4', '5', '6', '7'].includes(feature.properties.type_voie_code)){
                    if(!['EV', 'PE', 'TR'].includes(feature.properties.avancement_code))
                        return feature.properties.avancement_code == 'E';
                    return false;
                }
                return false;
            });
        
    };
    return filteredData;
};
function colorLine(feature) {
    if(feature.properties.rev_avancement_code=='EV'|| feature.properties.rev_avancement_code=='PE'
        || feature.properties.rev_avancement_code=='TR'){
            return {
                color: "#2AC7DD",
                weight: 3,
            }
        }
    if(feature.properties.avancement_code=='E'){
        if(feature.properties.type_voie_code == '1' || feature.properties.type_voie_code == '3' 
         || feature.properties.type_voie_code == '8' || feature.properties.type_voie_code == '9'){
            return {
                color: "#84CA4B",
                weight: 3,
            }
         }
        else if ((feature.properties.type_voie_code == '4' || feature.properties.type_voie_code == '5'
                ||  feature.properties.type_voie_code == '6') &&(feature.properties.rev_avancement_code !='EV'
                || feature.properties.rev_avancement_code !='PE'|| feature.properties.rev_avancement_code !='TR')){
                    return {
                        color: "#025D29",
                        weight: 3,
                    }
                }
        else if(feature.properties.type_voie_code == '7'){
            return {
                color: "#B958D9",
                weight: 3,
            }
        }
    }
}