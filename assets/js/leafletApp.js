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

let capCityCluster;
let wikiCluster;


//map
mapboxgl.accessToken = 'pk.eyJ1IjoiZXN0cmFkYTExMDciLCJhIjoiY2p3cmkxaXE1MWs2ajRibGV4bjZna2cyZyJ9.rfXkxJ59K98sg9us_cOj3w';

L.tileLayer('https://tile.jawg.io/jawg-streets/{z}/{x}/{y}.png?access-token=B5c7xyU8C9pYj2cSITJ1HHTfUeL6zaLCh8styLvSen0e5nBgU4p53kJ84IWOGAqZ', {})

var jawgStreets = L.tileLayer('https://tile.jawg.io/jawg-streets/{z}/{x}/{y}.png?access-token=B5c7xyU8C9pYj2cSITJ1HHTfUeL6zaLCh8styLvSen0e5nBgU4p53kJ84IWOGAqZ', {
	attribution: '<a href=\"https://www.jawg.io\" target=\"_blank\">&copy; Jawg</a> - <a href=\"https://www.openstreetmap.org\" target=\"_blank\">&copy; OpenStreetMap</a>&nbsp;contributors'}),
    hybrid = L.mapboxGL({
    attribution: "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e",
    style: 'https://api.maptiler.com/maps/hybrid/style.json?key=IFRW9BnLg67kStosRQhA'});

var map = L.map('map', {
    maxZoom: 18,
    layers: [jawgStreets]
}).fitWorld();

var baseMaps = {
    "Satellite Map": hybrid,
    "Streets Map": jawgStreets
};

L.control.layers(baseMaps).addTo(map);

//easy buttons
L.easyButton('<i class="fas fa-info"></i>', function(){
    $('#wikiModal').modal('show');
}, 'Country Infomation').addTo(map);

L.easyButton('<i class="fas fa-cloud-sun"></i>', function(){
    $('#weatherModal').modal('show');
}, 'Weather').addTo(map);

L.easyButton('<i class="far fa-newspaper"></i>', function(){
    $('#newsModal').modal('show');
}, 'News').addTo(map);

L.easyButton('<i class="fas fa-money-bill-wave"></i>', function(){
    $('#currencyModal').modal('show');
}, 'Currency Information').addTo(map);

L.easyButton('<i class="fas fa-virus"></i>', function(){
        $('#covidModal').modal('show');
}, 'Covid-19 Information').addTo(map);

//UNESCO Markers Toggle
let unescoToggle = L.easyButton({
    states: [{
      stateName: 'add-markers',
      icon: '<i class="fas fa-landmark"></i>',
      title: 'UNESCO (Cultural) World Heritage Sites',
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
      title: 'Remove UNESCO Markers'
    }]
  }).addTo(map);

  //Capital City Cluster Easy Button Toggle
let capCityToggle = L.easyButton({
    states: [{
      stateName: 'add-markers',
      icon: '<i class="fas fa-city"></i>',
      title: 'Places of Interest',
      onClick: function(control) {
        map.addLayer(capCityCluster);
        control.state('remove-markers');
        
      }
    }, {
      icon: 'fa-undo',
      stateName: 'remove-markers',
      onClick: function(control) {
        map.removeLayer(capCityCluster);
        control.state('add-markers');
      },
      title: 'Remove Places of Interest'
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
            //User's Location info
const successCallback = (position) => {
    $.ajax({
        url: "assets/php/openCage.php",
        type: 'GET',
        dataType: 'json',
        data: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
        },

        success: function(result) {
            
            console.log('openCage User Location',result);
            currentLat = result.data[0].geometry.lat;
            currentLng = result.data[0].geometry.lng;

            $("selectOpt select").val(result.data[0].components["ISO_3166-1_alpha-2"]);
            
            currentCountry = result.data[0].components["ISO_3166-1_alpha-2"];
            $("#selCountry").val(currentCountry).change();
        
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        }
    }); 
    }

    const errorCallback = (error) => {
            console.error(error);
}
navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
            // $.ajax({
            //     url: "assets/php/ipStackApi.php",
            //     type: 'GET',
            //     dataType: 'json', 
            //         success: function (result) {
            //             currentCountry = result.data.userIpInfo.country_code;
            //             $("#selCountry").val(currentCountry).change();
            //         },
            //         error: function (jqXHR, textStatus, errorThrown) {
            //             console.log(textStatus, errorThrown);
            //         }
            // });
        },    
    });
//end document. ready
});

//Main Ajax Call
$('#selCountry').on('change', function() {
    let borderCountryCode = $("#selCountry").val();
    
    $.ajax({
        url: "assets/php/ajaxCalls.php",
        type: 'GET',
        dataType: 'json',
        data: {
                countryCode: borderCountryCode
            },
        beforeSend: function() {
            $('#loading').show();
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
                let popoulation =  numberWithCommas(result.data.restCountries.population);
                let area = numberWithCommas(result.data.restCountries.area);
                let callingCode = result.data.restCountries.callingCodes[0];
                let demonym =  result.data.restCountries.demonym;
                let domain = result.data.restCountries.topLevelDomain[0];
                let languages = "";
                    if (result.data.restCountries.languages.length === 1) {
                        languages = result.data.restCountries.languages[0].name;
                    } else if (result.data.restCountries.languages.length ===2 ) {
                        languages = result.data.restCountries.languages[0].name +" and " + result.data.restCountries.languages[1].name
                    } else if (result.data.restCountries.languages.length === 3) {
                        languages = result.data.restCountries.languages[0].name +" , " + result.data.restCountries.languages[1].name + " and " +  result.data.restCountries.languages[2].name
                    } else { result.data.restCountries.languages.forEach(language => {
                        languages += language.name + " ";
                            }) 
                        }
                $('#wikiModalLabel').html(result.data.restCountries.name);
                $('#txtPopulation').html(popoulation);
                $('#txtCapital').html(capitalCityName);
                $('#txtLanguages').html(languages);
                $('#txtArea').html(area +'km<sup>2</sup>');
                $('#txtIso2').html(result.data.border.properties.iso_a2);
                $('#txtIso3').html(result.data.border.properties.iso_a3)
                $('#txtCallingCode').html("+" + callingCode);
                $('#txtDemonym').html(demonym);
                $('#txtDomain').html(domain);
                $('#txtWikiImg').html(`<img id='flag' src='${result.data.wikiCountryExcerpt.thumbnail.source}'><br>`);
                $('#txtWiki').html('<br>Wikipedia: ' + result.data.wikiCountryExcerpt.extract_html +'<br>');


                //Bing News
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
                }  else {         
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
                    $('#overlay3').remove();
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
                        iconSize: [50, 50],
                        popupAnchor: [0,-15]
                    });

                    unescoSite = result.data.unescoSites.records[i].fields.site;
                    unescoLat = result.data.unescoSites.records[i].fields.coordinates[0];
                    unescoLng = result.data.unescoSites.records[i].fields.coordinates[1];
                    unescoThumbnail = result.data.unescoSites.records[i].fields.image_url.filename;
                    unsescoDescription = result.data.unescoSites.records[i].fields.short_description;
                    
                    unescoMarker = L.marker(new L.LatLng(unescoLat, unescoLng), ({icon: unescoIcon})).bindPopup(`<div id="unescoContainer"><h3>${unescoSite}</h3><img id="unescoThumbnail" src='https://whc.unesco.org/uploads/sites/${unescoThumbnail}'><p id="unescoDescription">${unsescoDescription}</p></div>`, {
                        maxWidth : 300
                    });

                    unescoLayerGroup.addLayer(unescoMarker);

                };
            
            //capital city cluster
            capCityCluster = L.markerClusterGroup();

            result.data.capCityHospitals.items.forEach(hospital => {
                var hospitalIcon = L.icon({
                    iconUrl: 'assets/img/icons/hospital.png',
                    iconSize: [50, 50],
                    popupAnchor: [0,-15]
                    });
                hospitalLabel = hospital.address.label;
                hospitalLat = hospital.position.lat;
                hospitalLng = hospital.position.lng;

                var capCityMarker = L.marker(new L.LatLng(hospitalLat, hospitalLng), ({icon: hospitalIcon})).bindPopup(hospitalLabel);
                capCityCluster.addLayer(capCityMarker);
            });
            
            result.data.capCityAirports.items.forEach(airport => {
                var airportIcon = L.icon({
                    iconUrl: 'assets/img/icons/airport.png',
                    iconSize: [50, 50],
                    popupAnchor: [0,-15]
                    });
                airportName = airport.title;
                airportLat = airport.position.lat;
                airportLng = airport.position.lng;
                var capCityMarker = L.marker(new L.LatLng(airportLat, airportLng), ({icon: airportIcon})).bindPopup(airportName);
                capCityCluster.addLayer(capCityMarker);
            });
            
            result.data.capCityHotels.items.forEach(hotel => {
                var hotelIcon = L.icon({
                    iconUrl: 'assets/img/icons/hotel.png',
                    iconSize: [50, 50],
                    popupAnchor: [0,-15]
                    });
                hotelLabel = hotel.address.label;
                hotelLat = hotel.position.lat;
                hotelLng = hotel.position.lng;
                var capCityMarker = L.marker(new L.LatLng(hotelLat, hotelLng), ({icon: hotelIcon})).bindPopup(hotelLabel);
                capCityCluster.addLayer(capCityMarker);
            });

            result.data.capCityParks.items.forEach(park => {
                var parkIcon = L.icon({
                    iconUrl: 'assets/img/icons/park.png',
                    iconSize: [50, 50],
                    popupAnchor: [0,-15]
                    });
                parkLabel = park.address.label;
                parkLat = park.position.lat;
                parkLng = park.position.lng;
                var capCityMarker = L.marker(new L.LatLng(parkLat, parkLng), ({icon: parkIcon})).bindPopup(parkLabel);
                capCityCluster.addLayer(capCityMarker);
            });
            
            result.data.capCityRestaurants.items.forEach(restaurant => {
                var restaurantIcon = L.icon({
                    iconUrl: 'assets/img/icons/icons8-dining-room-48.png',
                    iconSize: [50, 50],
                    popupAnchor: [0,-15]
                    });
                restaurantLabel = restaurant.address.label;
                restaurantLat = restaurant.position.lat;
                restaurantLng = restaurant.position.lng;
                var capCityMarker = L.marker(new L.LatLng(restaurantLat, restaurantLng), ({icon: restaurantIcon})).bindPopup(restaurantLabel);
                capCityCluster.addLayer(capCityMarker);
            });

            result.data.capCityMuseums.items.forEach(museum => {
                var museumIcon = L.icon({
                    iconUrl: 'assets/img/icons/museum.png',
                    iconSize: [50, 50],
                    popupAnchor: [0,-15]
                    });
                museumLabel = museum.address.label;
                museumLat = museum.position.lat;
                museumLng = museum.position.lng;
                var capCityMarker = L.marker(new L.LatLng(museumLat, museumLng), ({icon: museumIcon})).bindPopup(museumLabel);
                capCityCluster.addLayer(capCityMarker);
            });

            //cities markers
            let largeCityCluster = new L.layerGroup();

            result.data.largeCities.forEach(largeCity => {
                let cityName = largeCity.fields.name;
                let cityName2 = cityName.replaceAll(" ", "%20");
                let countryName2 = countryName.replaceAll(" ", "%20");
                let cityLat =  largeCity.geometry.coordinates[1];
                let cityLng =  largeCity.geometry.coordinates[0];

                // Wiki city info
                $.ajax({
                    url: "assets/php/wikiSearch.php",
                    type: 'GET',
                    dataType: 'json',
                    data: {
                        wikiCityName: cityName2,
                        wikiCountryName: countryName2
                    },
                    beforeSend: function() {
                        $('#loading').show();
                    },
                    success: function(result) {
                        $('#loading').hide();
                        if (result.status.name == "ok") {
                            let cityInfo = null;
                            let cityThumbnailImg;
                            let cityUrl;
                            let text;
                            result.wikiCity.geonames.forEach(city => {
                                if (city.countryCode === borderCountryCode && city.title === cityName) {
                                    cityInfo = city.summary;
                                    cityThumbnailImg = city.thumbnailImg;
                                    cityUrl = city.wikipediaUrl;
                                    text = 'Read more';
                                };

                                if (cityInfo === null) {
                                    cityInfo = " ";
                                    cityThumbnailImg = " ";
                                    cityUrl = " ";
                                    text = " "
                                    
                                };
                                var cityIcon = L.icon({
                                    iconUrl: 'assets/img/icons/city.png',
                                    iconSize: [30, 30],
                                    popupAnchor: [0,-15],
                                    className: 'cityIcon'
                                    });

                                var cityOptions =
                                                {
                                                'maxWidth': '300',
                                                'className' : 'custom'
                                                };        
                
                                var largeCityMarker = L.marker(new L.LatLng(cityLat, cityLng), ({icon: cityIcon})).bindPopup(`<div id="unescoContainer"><h3>${cityName}</h3><img id="unescoThumbnail" src='${cityThumbnailImg}' onerror="this.style.display='none'"><p id="unescoDescription">${cityInfo}</p><div id="city-link"><a href="//${cityUrl}">${text}</a></div></div>`, cityOptions);
                
                                largeCityCluster.addLayer(largeCityMarker);
                                
                            });
                        
                        }
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.log('Wiki City Error',textStatus, errorThrown);
                    }
                });
                
                
            });
            
            map.addLayer(largeCityCluster);

            //Large Cities Clusters
            for (let i = 0; i < result.data.largeCities.length; i++) {
                cityName = result.data.largeCities[i].fields.name;
                cityLat = result.data.largeCities[i].geometry.coordinates[1];
                cityLng = result.data.largeCities[i].geometry.coordinates[0];
                
                //wiki Find Nearby Places for cities
                $.ajax({
                    url: "assets/php/wikiFindNearby.php",
                    type: 'GET',
                    dataType: 'json',
                    data: {
                        lat: cityLat,
                        lng: cityLng,
                        country: borderCountryCode
                    },
                    beforeSend: function() {
                        $('#loading').show();
                    },
                    success: function(result) {
                        $('#wikiNearby').html("");
                        
                        if (result.status.name == "ok") {
                            
                             wikiCluster = new L.markerClusterGroup();
                            
                            for (let i = 0; i < result.wikiPlaces.length; i++) {
                                
                                var wikiPlaceIcon = L.icon({
                                    iconUrl: 'assets/img/icons/wikipedia.png',
                                    iconSize: [50, 50], // size of the icon
                                    popupAnchor: [0,-15]
                                    });
                                var customOptions =
                                    {
                                    'maxWidth': '300',
                                    'className' : 'custom'
                                    }

                                wikiPlaceName = result.wikiPlaces[i].title;
                                wikiPlaceLat = result.wikiPlaces[i].lat;
                                wikiPlaceLng = result.wikiPlaces[i].lng;
                                wikiSummary = result.wikiPlaces[i].summary;
                                wikiUrl = result.wikiPlaces[i].wikipediaUrl;
                                wikiThumbnail = result.wikiPlaces[i].thumbnailImg;
                                
                                var customPopup = `<div class="card" style="width: 18rem;"><div class="card-body"><h5 class="card-title">${wikiPlaceName}</h5><img class="img-thumbnail float-right" style="max-width: 100px" src="${wikiThumbnail}" onerror="this.style.display='none'"><p class="card-text" id="wiki-sum">${wikiSummary}</p><a href="//${wikiUrl}" class="card-link">Read more</a><a href="#" class="card-link"></a></div></div>`;

                                wikiPlaceMarker = L.marker(new L.LatLng(wikiPlaceLat, wikiPlaceLng), ({icon: wikiPlaceIcon})).bindPopup(customPopup,customOptions);

                                capCityCluster.addLayer(wikiPlaceMarker);
                                };
                            }
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.log('WikiFindNearby Data Error', textStatus, errorThrown);
                    }
                        });
                    };
        },

        error: function(jqXHR, textStatus, errorThrown) {
            console.log('Main Call Error',textStatus, errorThrown);
        }

    });
        
//end on change code
});
