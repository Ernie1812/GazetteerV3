let countryName;
let border;
let currentCountry;
$body = $("body");

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
L.easyButton('<img src="assets/img/icons/icons8-partly-cloudy-day-24.png" width="20vw" height="20vh">', function(){
    $('#weatherModal').modal('show');
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
            console.log()
            //sort options alphabetically
            $("#selCountry").html($("#selCountry option").sort(function (a, b) {
                return a.text == b.text ? 0 : a.text < b.text ? -1 : 1
            }))

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
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                            console.log('Populate options Error',textStatus, errorThrown);
                        }
                
            });
//end document. ready
});

//Main 
    $('#selCountry').on('change', function() {
        console.clear();
        let borderCountryCode = $("#selCountry").val();
        $.ajax({
            url: "assets/php/ajaxCalls.php",
            type: 'GET',
            dataType: 'json',
            data: {
                 countryCode: borderCountryCode

             },
            success: function(result) {
                console.log('test', result);
            
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log('test',textStatus, errorThrown);
            }

        });

        
        // //adds borders
        // if (map.hasLayer(border)) {
        //     map.removeLayer(border);
        // }
        
        // border = L.geoJSON(countryArray[0], {
        //         color: '#ff7800',
        //         weight: 2,
        //         opacity: 0.65
        //     }).addTo(map);

        // let bounds = border.getBounds();
        // map.flyToBounds(bounds, {
        //         padding: [0, 35], 
        //         duration: 2
        //     });

        
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

        // //openWeather Current Weather API          
        // $.ajax({
        //     url: "assets/php/openWeatherCurrent.php",
        //     type: 'GET',
        //     dataType: 'json',
        //     data: {
        //         lat: capitalCityLat,
        //         lng: capitalCityLon
        //     }, 
        //     success: function(result) {
        //         console.log('CurrentCapitalWeather', result);
                
        //         let weatherIcon = result.weatherData.current.weather[0].icon;
                
        //         if (result.status.name == "ok") {
        //             $('#txtCapitalWeatherName').html(capitalCityName);
        //             $('#txtCapitalWeatherCurrent').html( Math.round(result.weatherData.current.temp) +'&#8451<br>');
        //             $('#txtCapitalWeatherDescription').html( result.weatherData.current.weather[0].description);
        //             $('#txtCapitalWeatherWindspeed').html(result.weatherData.current.wind_speed + ' km/h');
        //             $('#txtCapitalWeatherHumidity').html( Math.round(result.weatherData.current.humidity) +'&#37');
        //             $('#txtCapitalWeatherLo').html( Math.round(result.weatherData.daily[0].temp.min) +'&#8451<br>');
        //             $('#txtCapitalWeatherHi').html( Math.round(result.weatherData.daily[0].temp.max) +'&#8451<br>');
        //             $('#txtCapitalTomorrowsWeatherLo').html( Math.round(result.weatherData.daily[1].temp.min) +'&#8451<br>');
        //             $('#txtCapitalTomorrowsWeatherHi').html( Math.round(result.weatherData.daily[1].temp.max) +'&#8451<br>');
        //             $('#CapitalWeatherIcon').html( `<img src="https://openweathermap.org/img/wn/${weatherIcon}@2x.png" width="24px">`);
        //             $('#CapitalHumidityIcon').html('<img src="assets/img/icons/humidity.svg" width="24px">');
        //             $('#CapitalWindIcon').html('<img src="assets/img/icons/007-windy.svg" width="24px">');
        //             $('.CapitalHiTempIcon').html('<img src="assets/img/icons/temperatureHi.svg" width="24px">');
        //             $('.CapitalLoTempIcon').html('<img src="assets/img/icons/temperatureLo.svg" width="24px">');

        //         }
        //     },
        //     error: function(jqXHR, textStatus, errorThrown) {
        //         console.log('openWeather Current Data Error',textStatus, errorThrown);
        //     }
        // }); 
            
    //end on change code
    });
