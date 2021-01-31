let countryName;
let border;
let currentCountry;

let capitalCityName;

let unescoLayerGroup;
let unescoIcon;
let unescoSite;
let unescoLat;
let unescoLng;
let unescoMarker;
let unescoNumber;

//load gif while waiting
$(document).ajaxStart(function(){
    $('#loading').show();
 }).ajaxStop(function(){
    $('#loading').hide();
 });
//map

var map = L.map('map').fitWorld();

var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

//easy buttons
L.easyButton('<img src="assets/img/icons/wikipedia.png" width="20vw" height="20vh">', function(){
    $('#wikiModal').modal('show');
}).addTo(map);

L.easyButton('<img src="assets/img/icons/icons8-partly-cloudy-day-24.png" width="20vw" height="20vh">', function(){
    $('#weatherModal').modal('show');
}).addTo(map);

L.easyButton('<img src="assets/img/icons/newspaper.png" width="20vw" height="20vh">', function(){
    $('#newsModal').modal('show');
}).addTo(map);

L.easyButton('<img src="assets/img/icons/icons8-paper-money-24.png" width="20vw" height="20vh">', function(){
    $('#currencyModal').modal('show');
}).addTo(map);

L.easyButton('<img src="assets/img/icons/coronavirus.png" width="20vw" height="20vh">', function(){
        $('#covidModal').modal('show');
}).addTo(map);

//UNESCO Markers Toggle
let unescoToggle = L.easyButton({
    states: [{
      stateName: 'add-markers',
      icon: '<img src="assets/img/icons/unesco.png" width="20vw" height="20vh">',
      title: 'UNESCO World Heritage Sites',
      onClick: function(control) {
        if(unescoNumber === 0) {
            $('#unescoModal').modal('show');
            $( '[title]="UNESCO World Heritage Sites"' ).removeClass( "remove-markers-active" ).addClass( "add-markers-active" );
        };
        map.addLayer(unescoLayerGroup);
        control.state('remove-markers');
        
      }
    }, {
      icon: 'fa-undo',
      stateName: 'remove-markers',
      onClick: function(control) {
        map.removeLayer(unescoLayerGroup);
        control.state('add-markers');
      },
      title: 'remove UNESCO markers'
    }]
  }).addTo(map);

$(document).ready(function () { 
//populate select options
    $.ajax({
        url: "assets/php/geoJson.php",
        type: 'GET',
        dataType: "json",
        success: function(result) {
            console.log('populate options' , result);
            if (result.status.name == "ok") {
                for (var i=0; i<result.data.border.features.length; i++) {
                            $('#selCountry').append($('<option>', {
                                value: result.data.border.features[i].properties.iso_a2,
                                text: result.data.border.features[i].properties.name,
                            }));
                }
            }

            //sort options alphabetically
            $("#selCountry").html($("#selCountry option").sort(function (a, b) {
                return a.text == b.text ? 0 : a.text < b.text ? -1 : 1
                }))

            //User's Location info to change select option
            $.ajax({
                url: "assets/php/ipStackApi.php",
                type: 'GET',
                dataType: 'json', 
                    success: function (result) {
                        currentCountry = result.data.userIpInfo.country_code;
                        $("#selCountry").val(currentCountry).change();
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log(textStatus, errorThrown);
                    }
            });
        },    
    });
//end document. ready
});

//Main 
$('#selCountry').on('change', function() {
    //console.clear();
    let borderCountryCode = $("#selCountry").val();
    
    $.ajax({
        url: "assets/php/ajaxCalls.php",
        type: 'GET',
        dataType: 'json',
        data: {
                countryCode: borderCountryCode
            },
        success: function(result) {
            console.clear();
            console.log('Call Results', result);
            
            //adds borders
            if (map.hasLayer(border)) {
                map.removeLayer(border);
            }
            
            border = L.geoJSON(result.data.border, {
                    color: '#ff7800',
                    weight: 2,
                    opacity: 0.65
                });

            let bounds = border.getBounds();
            map.flyToBounds(bounds, {
                    padding: [0, 35], 
                    duration: 2
                });

            border.addTo(map); 
            
            if (result.status.name == "ok") {
                //set variables to reuse
                countryName = result.data.border.properties.name;
                capitalCityName = result.data.restCountries.capital;

                //weather info
                let weatherIcon = result.data.weather.current.weather[0].icon;
                

                $('#txtCapitalWeatherName').html(capitalCityName);
                $('#txtCapitalWeatherCurrent').html( Math.round(result.data.weather.current.temp) +'&#8451<br>');
                $('#txtCapitalWeatherDescription').html( result.data.weather.current.weather[0].description);
                $('#txtCapitalWeatherWindspeed').html(result.data.weather.current.wind_speed + ' km/h');
                $('#txtCapitalWeatherHumidity').html( Math.round(result.data.weather.current.humidity) +'&#37');
                $('#txtCapitalWeatherLo').html( Math.round(result.data.weather.daily[0].temp.min) +'&#8451<br>');
                $('#txtCapitalWeatherHi').html( Math.round(result.data.weather.daily[0].temp.max) +'&#8451<br>');
                $('#txtCapitalTomorrowsWeatherLo').html( Math.round(result.data.weather.daily[1].temp.min) +'&#8451<br>');
                $('#txtCapitalTomorrowsWeatherHi').html( Math.round(result.data.weather.daily[1].temp.max) +'&#8451<br>');
                $('#CapitalWeatherIcon').html( `<img src="https://openweathermap.org/img/wn/${weatherIcon}@2x.png" width="24px">`);
                $('#CapitalHumidityIcon').html('<img src="assets/img/icons/humidity.svg" width="24px">');
                $('#CapitalWindIcon').html('<img src="assets/img/icons/007-windy.svg" width="24px">');
                $('.CapitalHiTempIcon').html('<img src="assets/img/icons/temperatureHi.svg" width="24px">');
                $('.CapitalLoTempIcon').html('<img src="assets/img/icons/temperatureLo.svg" width="24px">');

                //Covid info
                let covidDeaths = result.data.covidData.data.latest_data.deaths;
                let covidConfirmed = result.data.covidData.data.latest_data.confirmed;
                let covidcritical = result.data.covidData.data.latest_data.recovered;
                    
                function numberWithCommas(x) {
                    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                }

                $('#covidModalLabel').html('Latest Covid data for: ' + countryName);
                $('#txtCovidDeaths').html(numberWithCommas(covidDeaths));
                $('#txtCovidCases').html(numberWithCommas(covidConfirmed));
                $('#txtCovidRecovered').html(numberWithCommas(covidcritical));

                //currency info and exchange rate
                let currencyCode = result.data.restCountries.currencies[0].code;
                let currencyName = result.data.restCountries.currencies[0].name;
                let currencySymbol = result.data.restCountries.currencies[0].symbol;
                let exchangeRate = result.data.currentRate;
                $('#txtCurrencySymbol').html(currencySymbol);
                $('#txtCurrency').html(currencyName);
                $('#txtCurrencyCode').html(currencyCode);
                $('#txtRate').html( exchangeRate.toFixed(2) + ' ' + currencyCode + ' to 1 EURO.');

                //wiki country summary
                $('#txtWikiImg').html('<img src=' + result.data.wikiCountryExcerpt.thumbnail.source +'><br>');
                $('#txtWiki').html('Wikipedia: ' + result.data.wikiCountryExcerpt.extract_html +'<br>');


                //news
                if ( result.data.BingNews[0].image) {
                    $('#overlay0').remove();
                    $('#imgArticleZeroContainer').append(`<div id="overlay0" class="overlay-image" style="background-image: url(${result.data.BingNews[0].image.contentUrl});"></div>`);
                } else {
                    $('#overlay0').remove();
                    $('#imgArticleZeroContainer').append(`<div id="overlay0" class="overlay-image" style="background-image: url(assets/img/image-not-available.jpg);"></div>`);
                }
                if ( result.data.BingNews[1].image) {
                    $('#overlay1').remove();
                    $('#imgArticleOneContainer').append(`<div id="overlay1" class="overlay-image" style="background-image: url(${result.data.BingNews[1].image.contentUrl});"></div>`);
                } else {         
                    $('#overlay1').remove();                                                                                           
                    $('#imgArticleOneContainer').append(`<div id="overlay1" class="overlay-image" style="background-image: url(assets/img/image-not-available.jpg);"></div>`);
                }
                if ( result.data.BingNews[2].image) {
                    $('#overlay2').remove()
                    $('#imgArticleTwoContainer').append(`<div id="overlay2" class="overlay-image" style="background-image: url(${result.data.BingNews[2].image.contentUrl});"></div>`);
                } else {
                    $('#overlay2').remove()
                    $('#imgArticleTwoContainer').append(`<div id="overlay2" class="overlay-image" style="background-image: url(assets/img/image-not-available.jpg);"></div>`);
                }
                if ( result.data.BingNews[3].image) {
                    $('#overlay3').remove();
                    $('#imgArticleThreeContainer').append(`<div id="overlay3" class="overlay-image" style="background-image: url(${result.data.BingNews[3].image.contentUrl});"></div>`);
                } else {
                    $('#imgArticleThreeContainer').append(`<div id="overlay3" class="overlay-image" style="background-image: url(assets/img/image-not-available.jpg);"></div>`);
                }
                if ( result.data.BingNews[4].image) {
                    $('#overlay4').remove();
                    $('#imgArticleFourContainer').append(`<div id="overlay4" class="overlay-image" style="background-image: url(${result.data.BingNews[4].image.contentUrl});"></div>`);
                } else {
                    $('#overlay4').remove();
                    $('#imgArticleFourContainer').append(`<div id="overlay4" class="overlay-image" style="background-image: url(assets/img/image-not-available.jpg);"></div>`);
                }

                $('#txtArticleNameZero').text(result.data.BingNews[0].name);
                $('#articleLinkZero').attr("href", result.data.BingNews[0].url);

                $('#txtArticleNameOne').text(result.data.BingNews[1].name);
                $('#articleLinkOne').attr("href", result.data.BingNews[1].url);

                $('#txtArticleNameTwo').text(result.data.BingNews[2].name);
                $('#articleLinkTwo').attr("href", result.data.BingNews[2].url);    

                $('#txtArticleNameThree').text(result.data.BingNews[3].name);
                $('#articleLinkThree').attr("href", result.data.BingNews[3].url);

                $('#txtArticleNameFour').text(result.data.BingNews[4].name);

                $('#articleLinkFour').attr("href", result.data.BingNews[4].url);
            }

            //UNESCO Sites
            unescoNumber = result.data.unescoSites.nhits;
            unescoLayerGroup = L.layerGroup();
                for (let i = 0; i < result.data.unescoSites.records.length; i++) {

                    unescoIcon = L.icon({
                        iconUrl: 'assets/img/icons/unesco.png',
                        iconSize: [20, 30], // size of the icon
                        popupAnchor: [0,-15]
                    });
                    
                    unescoSite = result.data.unescoSites.records[i].fields.site;
                    unescoLat = result.data.unescoSites.records[i].fields.coordinates[0];
                    unescoLng = result.data.unescoSites.records[i].fields.coordinates[1];
                    
                    unescoMarker = L.marker(new L.LatLng(unescoLat, unescoLng), ({icon: unescoIcon})).bindPopup(`<h3>${unescoSite}</h3><p>${result.data.unescoSites.records[i].fields.short_description}</p>`);
                    unescoLayerGroup.addLayer(unescoMarker);
            };

            //capital city cluster
            var capCityCluster = L.markerClusterGroup();

            for (let i = 0; i < result.data.capCityHospitals.items.length; i++) {
                hospitalName = result.data.capCityHospitals.items[i].title;
                hospitalLat = result.data.capCityHospitals.items[i].position.lat;
                hospitalLng = result.data.capCityHospitals.items[i].position.lng;
                var capCityMarker = L.marker(new L.LatLng(hospitalLat, hospitalLng)).bindPopup(hospitalName);
                capCityCluster.addLayer(capCityMarker);
            };
            
            for (let i = 0; i < result.data.capCityAirports.items.length; i++) {
                airportName = result.data.capCityAirports.items[i].title;
                airportLat = result.data.capCityAirports.items[i].position.lat;
                airportLng = result.data.capCityAirports.items[i].position.lng;
                var capCityMarker = L.marker(new L.LatLng(airportLat, airportLng)).bindPopup(airportName);
                capCityCluster.addLayer(capCityMarker);
            };

            for (let i = 0; i < result.data.capCityHotels.items.length; i++) {
                hotelName = result.data.capCityHotels.items[i].title;
                hotelLat = result.data.capCityHotels.items[i].position.lat;
                hotelLng = result.data.capCityHotels.items[i].position.lng;
                var capCityMarker = L.marker(new L.LatLng(hotelLat, hotelLng)).bindPopup(hotelName);
                capCityCluster.addLayer(capCityMarker);
            };

            for (let i = 0; i < result.data.capCityParks.items.length; i++) {
                parkName = result.data.capCityParks.items[i].title;
                parkLat = result.data.capCityParks.items[i].position.lat;
                parkLng = result.data.capCityParks.items[i].position.lng;
                var capCityMarker = L.marker(new L.LatLng(parkLat, parkLng)).bindPopup(parkName);
                capCityCluster.addLayer(capCityMarker);
            };
            
            for (let i = 0; i < result.data.capCityRestaurants.items.length; i++) {
                restaurantName = result.data.capCityRestaurants.items[i].title;
                restaurantLat = result.data.capCityRestaurants.items[i].position.lat;
                restaurantLng = result.data.capCityRestaurants.items[i].position.lng;
                var capCityMarker = L.marker(new L.LatLng(restaurantLat, restaurantLng)).bindPopup(restaurantName);
                capCityCluster.addLayer(capCityMarker);
            };
            
            map.addLayer(capCityCluster);


        },



        error: function(jqXHR, textStatus, errorThrown) {
            console.log('test',textStatus, errorThrown);
        }

    });




    
    // //JSON file Capital City Info with Coordinates and add marker
    // $.ajax({
    //     url:'assets/php/capitals.php',
    //     type: 'POST',
    //     dataType: 'json',
        
    //     success: function(result) {
    //         console.log('Country Capitals Data', result);
    //         let countryCapitalsArray = [];
    //         for (let i = 0; i < result.countryCapitals.length; i++) {
    //             if (result.countryCapitals[i].CountryCode === borderCountryCode) {
    //                 countryCapitalsArray.push(result.countryCapitals[i]);
    //             }
    //         };
            
    //         capitalCityLat = countryCapitalsArray[0].CapitalLatitude;
    //         capitalCityLon = countryCapitalsArray[0].CapitalLongitude;
    //         capitalCityName = countryCapitalsArray[0].CapitalName;
    //         countryName2 = countryCapitalsArray[0].CountryName;
    //         countryName = countryName2.replace(/\s+/g, '_');
    //         console.log("Country Capital Array", countryCapitalsArray, countryName);

    //         var capitalCityIcon = L.icon({
    //             iconUrl: 'assets/img/icons/capital.png',
    //             iconSize: [20, 20],
    //             popupAnchor: [0,-15]
    //             });
    //         var capitalMarker = L.marker(new L.LatLng(capitalCityLat, capitalCityLon), ({icon: capitalCityIcon})).bindPopup(`Capital: ${capitalCityName}`).addTo(map);
    //     },
        
    //     error: function(jqXHR, textStatus, errorThrown) {
    //         console.log('Capitals Json Error', textStatus, errorThrown);
    //     }
    // });

    // 
    // }); 
        
//end on change code
});
