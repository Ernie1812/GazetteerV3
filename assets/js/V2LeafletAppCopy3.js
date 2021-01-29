let countryName;
let border;
let currentCountry;

let landmarkName;
let landmarkLat;
let landmarkLng;

let landmarkName2;
let landmarkLat2;
let landmarkLng2;

let wikiPlaceName;
let wikiPlaceLat;
let wikiPlaceLng;

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
    
//User's Location info
function successCallback(position) {
    $.ajax({
        url: "assets/php/openCage.php",
        type: 'GET',
        dataType: 'json',
        data: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
        },

        success: function (result) {

            console.log('openCage User Location', result);
            currentLat = result.data[0].geometry.lat;
            currentLng = result.data[0].geometry.lng;

            $("selectOpt select").val(result.data[0].components["ISO_3166-1_alpha-2"]);

            currentCountry = result.data[0].components["ISO_3166-1_alpha-2"];
            $("#selCountry").val(currentCountry).change();

        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        }
    });
}

    const errorCallback = (error) => {
            console.error(error);
}
navigator.geolocation.getCurrentPosition(successCallback, errorCallback);




//add borders to map
$('#selCountry').on('change', function() {
    let countryCode = $('#selCountry').val();
    

	$.ajax({
		url: "assets/php/geoJson.php",
		type: 'POST',
		dataType: 'json',
		success: function(result) {
	
			console.log('all borders result', result);
            
			if (map.hasLayer(border)) {
				map.removeLayer(border);
            }

            let countryArray = [];
            
            for (let i = 0; i < result.data.border.features.length; i++) {
                 if (result.data.border.features[i].properties.iso_a2 === countryCode) {
                    countryArray.push(result.data.border.features[i]);
                }
            };

            console.log('country array', countryArray);
            
            border = L.geoJSON(countryArray[0], {
					color: '#ff7800',
					weight: 2,
					opacity: 0.65
                }).addTo(map);
                
            // const countryArray = result.data.border.features.filter((val) => (val.properties.iso_a2 === countryCode));
			// border = L.geoJSON(countryArray[0]).addTo(map);    
            
            let bounds = border.getBounds();
            map.flyToBounds(bounds, {
                    padding: [0, 35], 
                    duration: 2
                });

			
            
		},
		error: function(jqXHR, textStatus, errorThrown) {
			// your error code
			console.log(textStatus, errorThrown);
		}
	}); 
});

//populate select options
$.ajax({
	url: "assets/php/geoJson.php",
	type: 'POST',
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
            console.log()
            //sort options alphabetically
            $("#selCountry").html($("#selCountry option").sort(function (a, b) {
                return a.text == b.text ? 0 : a.text < b.text ? -1 : 1
            }))
        }
      });

//On Change and Rest Countries API
$('#selCountry').on('change', function() {
    console.clear();
    let iso2CountryCode = $("#selCountry").val();
    let iso3CountryCode;
    let currencyCode;
    let currencyName;
    let currencySymbol;
    let capitalCity;
    let capitalCityLat;
    let capitalCityLon;
    let cityLat;
    let cityLng;
    let airportName;
    let airportLat;
    let airportLng;
    let wikiCluster;
    let hospitalName;
    let hospitalLat;
    let hospitalLng;
    
    //World Bank Capital City Data
    $.ajax({
        url:'assets/php/worldBank.php',
        type: 'GET',
        dataType: 'json',
        data: {
            worldBankCountry: iso2CountryCode,
        },
        success: function(result) {
            console.log('WorldBankCountry Data', result);
            capitalCityLat = result.worldBankData[1][0].latitude;
            capitalCityLon = result.worldBankData[1][0].longitude;
            capitalCity = result.worldBankData[1][0].capitalCity;
            
        },
        
        error: function(jqXHR, textStatus, errorThrown) {
            console.log('WorldBank Data Error', textStatus, errorThrown);
        }

    });

    //Rest Countries Currency and Name data
    $.ajax({
        url: "assets/php/restCountries.php",
        type: 'POST',
        dataType: 'json',
        data: {
            country: iso2CountryCode  
        },
        success: function(result) {
            console.log(iso2CountryCode +' ' + 'restCountries', result);
            iso3CountryCode = result.data.alpha3Code;
            currencyCode = result.data.currencies[0].code;
            currencyName = result.data.currencies[0].name;
            currencySymbol = result.data.currencies[0].symbol;
            if (result.status.name == "ok") {
                var countryName2 = result.data.name;
                countryName = countryName2.replace(/\s+/g, '_');

                $('#txtCurrencySymbol').html(currencySymbol);
                $('#txtCurrency').html(currencyName);
                $('#txtCurrencyCode').html(currencyCode);
            }

            //HereApi Airports
            $.ajax({
                url:'assets/php/hereApiAirports.php',
                type: 'GET',
                dataType: 'json',
                data: {
                    clickLat: capitalCityLat,
                    clickLng: capitalCityLon,
                    // clickLat: e.latlng.lat,
                    // clickLng: e.latlng.lng,
                    iso3Code: iso3CountryCode
                },
                success: function(result) {
                    
                    console.log('Airport data', result);
                    
                    //var landmarksCluster2 = L.markerClusterGroup();
        
                    for (let i = 0; i < result.HEREapiData.items.length; i++) {

                        var airportIcon = L.icon({
                            iconUrl: 'assets/img/icons/airport.png',
                            iconSize: [20, 20], // size of the icon
                            popupAnchor: [0,-15]
                            });
                        
                        // function clickZoom(e) {
                        //         map.setView(e.target.getLatLng(),10);
                        //     }

                        airportName = result.HEREapiData.items[i].title;
                        airportLat = result.HEREapiData.items[i].position.lat;
                        airportLng = result.HEREapiData.items[i].position.lng;
                        var airportMarker = L.marker(new L.LatLng(airportLat, airportLng), ({icon: airportIcon})).bindPopup(airportName).addTo(map);

                        map.on('popupopen', function(centerMarker) {
        var cM = map.project(centerMarker.popup._latlng);
        cM.y -= centerMarker.popup._container.clientHeight/2
        map.setView(map.unproject(cM),12, {animate: true});
    });
                   };
        
                    
                 },
                
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log('Airport Data error',textStatus, errorThrown);
                }
            });
            //HereApi Hospitals
            $.ajax({
                url:'assets/php/hereApiHospitals.php',
                type: 'GET',
                dataType: 'json',
                data: {
                    clickLat: capitalCityLat,
                    clickLng: capitalCityLon,
                    iso3Code: iso3CountryCode
                },
                success: function(result) {
                    
                    console.log('Hospital data', result);
                    
                    for (let i = 0; i < result.HEREapiData.items.length; i++) {

                        var hospitalIcon = L.icon({
                            iconUrl: 'assets/img/icons/hospital.png',
                            iconSize: [20, 20], // size of the icon
                            popupAnchor: [0,-15]
                            });

                        hospitalName = result.HEREapiData.items[i].title;
                        hospitalLat = result.HEREapiData.items[i].position.lat;
                        hospitalLng = result.HEREapiData.items[i].position.lng;
                        var hospitalMarker = L.marker(new L.LatLng(hospitalLat, hospitalLng), ({icon: hospitalIcon})).bindPopup(hospitalName).addTo(map);

                   };
        
                    
                 },
                
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log('Hospital Data error',textStatus, errorThrown);
                }
            });

            //Covid Data
            $.ajax({
                url: "assets/php/covid.php",
                type: 'GET',
                dataType: 'json',
                data: {
                    covidCountry: iso2CountryCode,
                },
                success: function(result) {
                    console.log(iso2CountryCode + ' ' + 'Covid Data',result);
                    
                    let covidDeaths = result.covidData.latest_data.deaths;
                    let covidConfirmed = result.covidData.latest_data.confirmed;
                    let covidcritical = result.covidData.latest_data.recovered;
                    
                    function numberWithCommas(x) {
                        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    }

                    if (result.status.name == "ok") {
                    $('#covidModalLabel').html('Latest Covid data for: ' + result.covidData.name);
                    $('#txtCovidDeaths').html(numberWithCommas(covidDeaths));
                    $('#txtCovidCases').html(numberWithCommas(covidConfirmed));
                    $('#txtCovidRecovered').html(numberWithCommas(covidcritical));
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log('Covid Data Error',textStatus, errorThrown);
                }
            });
            
            // Wiki Country Summary Excerpt
            $.ajax({
                url:'assets/php/wikiSearch.php',
                type: 'GET',
                dataType: 'json',
                data: {
                    wikiCountryName: countryName,
                },
                success: function(result) {
                    console.log('wiki info', result);

                    if (result.status.name == "ok") {
                    $('#txtWikiImg').html('<img src=' + result.wikiExcerpt.thumbnail.source +'><br>');
                    $('#txtWiki').html('Wikipedia: ' + result.wikiExcerpt.extract_html +'<br>');
                }},
                
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log('wikiExcerpt Data Error',textStatus, errorThrown);
                }
            });
            
            // Exchange Rates
            $.ajax({
                url: "assets/php/exchangeRates.php",
                type: 'GET',
                dataType: 'json',
                success: function(result) {
                    console.log('exchange rates',result);
                    if (result.status.name == "ok") {
                    
                    exchangeRate = result.exchangeRate.rates[currencyCode];
                    $('#txtRate').html( exchangeRate.toFixed(2) + ' ' + currencyCode + ' to 1 EURO.');
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log('ExchangeRates Data Error',textStatus, errorThrown);
                }
            });
            
            //Cities API Data
            $.ajax({
                url:'assets/php/cities.php',
                type: 'GET',
                dataType: 'json',
                data: {
                    citiesCountry: iso2CountryCode,
                },
                success: function(result) {
                    console.log('CitiesAPI Data', result);

                    if (result.status.name == "ok") {
                        for (let i = 0; i < result.citiesApiData.records.length; i++) {
                            cityLat = result.citiesApiData.records[i].geometry.coordinates[1];
                            cityLng = result.citiesApiData.records[i].geometry.coordinates[0];
                        
            //wiki Find Nearby Places
            $.ajax({
                url: "assets/php/wikiFindNearby.php",
                type: 'GET',
                dataType: 'json',
                data: {
                    lat: cityLat,
                    lng: cityLng,
                    country: iso2CountryCode
                },
                success: function(result) {
                    console.log('wikiNearby Data',result);
                    $('#wikiNearby').html("");
                    // if (map.hasLayer(wikiCluster)) {
                    //     map.removeLayer(wikiCluster);
                    // }
                    if (result.status.name == "ok") {
                        wikiCluster = L.markerClusterGroup();
                        
                        for (let i = 0; i < result.wikiPlaces.length; i++) {
                            
                            var wikiPlaceIcon = L.icon({
                                iconUrl: 'assets/img/icons/wikipedia.png',
                                iconSize: [30, 40], // size of the icon
                                popupAnchor: [0,-15]
                                });
                            var customOptions =
                                {
                                'maxWidth': '500',
                                'className' : 'custom'
                                }
                            // function clickZoom(e) {
                            //         map.setView(e.target.getLatLng(),10);
                            //     }
                            wikiPlaceName = result.wikiPlaces[i].title;
                            wikiPlaceLat = result.wikiPlaces[i].lat;
                            wikiPlaceLng = result.wikiPlaces[i].lng;
                            wikiSummary = result.wikiPlaces[i].summary;
                            wikiUrl = result.wikiPlaces[i].wikipediaUrl;
                            wikiThumbnail = result.wikiPlaces[i].thumbnailImg;
                            
                            var customPopup = `<div class="card" style="width: 18rem;"><div class="card-body"><h5 class="card-title">${wikiPlaceName}</h5><img class="img-thumbnail float-right" style="max-width: 100px" src="${wikiThumbnail}" onerror="this.style.display='none'"><p class="card-text">${wikiSummary}</p><a href="//${wikiUrl}" class="card-link">Read more</a><a href="#" class="card-link"></a></div></div>`;

                            wikiPlaceMarker = L.marker(new L.LatLng(wikiPlaceLat, wikiPlaceLng), ({icon: wikiPlaceIcon})).bindPopup(customPopup,customOptions);

                            //wikiCluster.on('click', clickZoom).addLayer(wikiPlaceMarker);
                            
                            wikiCluster.addLayer(wikiPlaceMarker);
                            };
                            
                             map.addLayer(wikiCluster);
                        }
                
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log('WikiFindNearby Data Error', textStatus, errorThrown);
                }
                    });
                };
                    }
                    
                },
                
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log('CitiesAPI Data Error', textStatus, errorThrown);
                }

            });

            //openWeather API          
            $.ajax({
                url: "assets/php/openWeatherCurrent.php",
                type: 'POST',
                dataType: 'json',
                data: {
                    lat: capitalCityLat,
                    lng: capitalCityLon
                }, 
                success: function(result) {
                    console.log('CurrentCapitalWeather', result);
                    let weatherIcon = result.weatherData.weather[0].icon;
                    
                    if (result.status.name == "ok") {
                        $('#txtCapitalWeatherName').html(capitalCity);
                        $('#txtCapitalWeatherCurrent').html( Math.round(result.weatherData.main.temp) +'&#8451<br>');
                        $('#txtCapitalWeatherDescription').html( result.weatherData.weather[0].description);
                        $('#txtCapitalWeatherWindspeed').html(result.weatherData.wind.speed + ' km/h');
                        $('#txtCapitalWeatherHumidity').html( Math.round(result.weatherData.main.humidity) +'&#37');
                        $('#txtCapitalWeatherLo').html( Math.round(result.weatherData.main.temp_min) +'&#8451<br>');
                        $('#txtCapitalWeatherHi').html( Math.round(result.weatherData.main.temp_max) +'&#8451<br>');
                        $('#CapitalWeatherIcon').html( `<img src="https://openweathermap.org/img/wn/${weatherIcon}@2x.png" width="24px">`);
                        $('#CapitalHumidityIcon').html('<img src="assets/img/icons/humidity.svg" width="24px">');
                        $('#CapitalWindIcon').html('<img src="assets/img/icons/007-windy.svg" width="24px">');
                        $('.CapitalHiTempIcon').html('<img src="assets/img/icons/temperatureHi.svg" width="24px">');
                        $('.CapitalLoTempIcon').html('<img src="assets/img/icons/temperatureLo.svg" width="24px">');

                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log('openWeather Current Data Error',textStatus, errorThrown);
                }
            }); 
            
            //openWeather Forcast Data
            $.ajax({
                url: "assets/php/openWeatherForcast.php",
                type: 'GET',
                dataType: 'json',
                data: {
                    lat: capitalCityLat,
                    lng: capitalCityLon
                },
                success: function(result) {
                    
                    console.log('Weather Forecast',result);
                    
                    if (result.status.name == "ok") {
                        
                        $('#txtCapitalTomorrowsWeatherLo').html( Math.round(result.weatherForcast.daily[1].temp.min) +'&#8451<br>');
                        $('#txtCapitalTomorrowsWeatherHi').html( Math.round(result.weatherForcast.daily[1].temp.max) +'&#8451<br>');

                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log('openWeather Forecast Data Error',textStatus, errorThrown);
                }
            });
            
            //Bing News Seach Api
            $.ajax({
                url:'assets/php/bingNews.php',
                type: 'GET',
                dataType: 'json',
                data: {
                    bingCountry: countryName
                },
                success: function(result) {
                    
                    console.log('BingNews', result);
                        if (result.value[0].image) {
                            $('#imgArticleZero').attr("src", result.value[0].image.contentUrl);
                        } else {
                            $('#imgArticleZero').hide();
                        }
                        if (result.value[1].image) {
                            $('#imgArticleOne').attr("src", result.value[1].image.contentUrl);
                        } else {
                            $('#imgArticleOne').hide();
                        }
                        if (result.value[2].image) {
                            $('#imgArticleTwo').attr("src", result.value[2].image.contentUrl);
                        } else {
                            $('#imgArticleTwo').hide();
                        }
                        if (result.value[3].image) {
                            $('#imgArticleThree').attr("src", result.value[3].image.contentUrl);
                        } else {
                            $('#imgArticleThree').hide();
                        }
                        if (result.value[4].image) {
                            $('#imgArticleFour').attr("src", result.value[4].image.contentUrl);
                        } else {
                            $('#imgArticleFour').hide();
                        }

                        $('#txtArticleNameZero').text(result.value[0].name);
                        $('#articleLinkZero').attr("href", result.value[0].url);
                        
                        $('#txtArticleNameOne').text(result.value[1].name);
                        $('#articleLinkOne').attr("href", result.value[1].url);
                        
                        $('#txtArticleNameTwo').text(result.value[2].name);
                        $('#articleLinkTwo').attr("href", result.value[2].url);    
                        
                        $('#txtArticleNameThree').text(result.value[3].name);
                        $('#articleLinkThree').attr("href", result.value[3].url);

                        $('#txtArticleNameFour').text(result.value[4].name);
                        $('#articleLinkFour').attr("href", result.value[4].url);
                        
                 },
                
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log('BingNews Error',textStatus, errorThrown);
                }
            });

        },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log('restCountries', textStatus, errorThrown);
            }
        });
                    
    });
    
