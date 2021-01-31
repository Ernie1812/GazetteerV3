<?php
    $border = null;
    $countryCodeA2 = null;
    $countryCodeA3 = null;
    $capitalCity = null;
    $countryFullName = null;
    
    $countryName = null;
    $capitalLat = null;
    $capitalLng = null;

    $currentCurrency = null;
    $wikiCountryName = null;

    ini_set('display_errors', 'On');
    error_reporting(E_ALL);
    $executionStartTime = microtime(true);

    // get country border feature
    $countryBorders = json_decode(file_get_contents("../data/countryBorders.geo.json"), true);

        foreach ($countryBorders['features'] as $feature) {
            if ($feature["properties"]["iso_a2"] ==  $_REQUEST['countryCode']) {
                $border = $feature;
                break;
            }
        }
        $output['data']['border'] = $border;
        $countryName = $border['properties']['name'];
        $wikiCountryName = preg_replace('/\s+/', '_', $countryName);
        
        $countryCodeA2 = $border['properties']['iso_a2'];
        $countryCodeA3 = $border['properties']['iso_a3'];
    
    // get User IP info from ipstack.com
    $url='http://api.ipstack.com/check?access_key=a0bc50db7a7bfab522a89f9b5241d2be';
        $ch = curl_init();

        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_URL,$url);

        $result=curl_exec($ch);

        curl_close($ch);

        $UserIp = json_decode($result,true); 

    // RestCountries API Call for capital city and currrency info
    $url='https://restcountries.eu/rest/v2/alpha/'. $countryCodeA2;
    
        $ch = curl_init();

        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_URL,$url);

        $result=curl_exec($ch);

        curl_close($ch);

        $restCountries = json_decode($result,true); 
        $output['data']['restCountries'] = $restCountries;
        $countryFullName = $restCountries['name'];
        $capitalCity = $restCountries['capital'];
        $currentCurrency = $restCountries['currencies'][0]['code'];
        
    
    //PositionStack API Call for capital city long and lat
    $url ='http://api.positionstack.com/v1/forward?access_key=03dd90a4064c55cbb186d659cbe3c5d3&query='. $capitalCity .','.$countryName;
    $ch = curl_init();

    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL,$url);

    $result=curl_exec($ch);
    
    curl_close($ch);
    
    $capitalData = json_decode($result,true);   
    $output['data']['capitalData'] = $capitalData['data'][0];
    $capitalLat = $capitalData['data'][0]['latitude'];
    $capitalLng = $capitalData['data'][0]['longitude'];
    
    //Weather Api
    $url='api.openweathermap.org/data/2.5/onecall?lat='. $capitalLat . '&lon='. $capitalLng .'&exclude=minutely,hourly,alerts&units=metric&appid=4ef2716ffdcebe56f05f86c5c6adb952';
    $ch = curl_init();

    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL,$url);

    $result=curl_exec($ch);

    curl_close($ch);

    $weather = json_decode($result,true);

    //Covid Api Call
    $url='https://corona-api.com/countries/'. $countryCodeA2;

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

    $covid = json_decode($result,true);
    
    //Currency Exchange Rates
    $url='http://data.fixer.io/api/latest?access_key=54b8d05cf6bc98c297a61ffa4e922dd0';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

    $exchangeRates = json_decode($result,true);

    foreach ($exchangeRates['rates'] as $code => $rate) {
        if ($code ==  $currentCurrency) {
            $output['data']['currentRate'] = $rate;
            break;
        } else {
            $output['data']['currentRate'] = 'Rate not available';
        }
    }

    //Wiki Country Excerpt
    $url='https://en.wikipedia.org/api/rest_v1/page/summary/' . $wikiCountryName .'?redirect=true';
    
    $ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$wikiCountryExcerpt = json_decode($result,true);	

    //Bing News API
    $accessKey = '0a06c1feb63e425ebe3a8258b407f917';

    $endpoint = 'https://api.bing.microsoft.com/v7.0/news/search';

    $term = $countryName;

    function BingNewsSearch ($url, $key, $query) {
        $headers = "Ocp-Apim-Subscription-Key: $key\r\n";
        $options = array ('http' => array (
                            'header' => $headers,
                            'method' => 'GET' ));
        $context = stream_context_create($options);
        $result = file_get_contents($url . "?q=" . urlencode($query)."&originalImg=true&setLang=en&count=6", false, $context);
        $headers = array();
        foreach ($http_response_header as $k => $v) {
            $h = explode(":", $v, 2);
            if (isset($h[1]))
                if (preg_match("/^BingAPIs-/", $h[0]) || preg_match("/^X-MSEdge-/", $h[0]))
                    $headers[trim($h[0])] = trim($h[1]);
        }
        return array($headers, $result);
    }
    list($headers, $json) = BingNewsSearch($endpoint, $accessKey, $term);

    $bingNews = json_decode($json, true);

    //UNESCO Sites
    $url='https://data.opendatasoft.com/api/records/1.0/search/?dataset=world-heritage-list%40public-us&q='.$countryFullName.'&rows=20&sort=date_inscribed&facet=category&facet=region&facet=states&refine.category=Cultural&refine.states='.$countryFullName;

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL,$url);

    $result=curl_exec($ch);

    curl_close($ch);

    $unesco = json_decode($result,true);

    //capital city hospitals
    $url='https://discover.search.hereapi.com/v1/discover?at='.$capitalLat.','.$capitalLng.'&q=hospital&lang=en-US&in=countryCode:'.$countryCodeA3.'&limit=15&apiKey=JrMv7faeaOpGnJXd_VwW11pu8AoiIgEy_O29cZHOtMQ';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

    $capCityHospitals = json_decode($result,true);
    
    //capital city airports
    $url='https://discover.search.hereapi.com/v1/discover?at='.$capitalLat.','.$capitalLng.'&q=airport&lang=en-US&in=countryCode:'.$countryCodeA3.'&limit=15&apiKey=JrMv7faeaOpGnJXd_VwW11pu8AoiIgEy_O29cZHOtMQ';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

    $capCityAirports = json_decode($result,true);
    
    //capital city hotels
    $url='https://discover.search.hereapi.com/v1/discover?at='.$capitalLat.','.$capitalLng.'&q=hotel&lang=en-US&in=countryCode:'.$countryCodeA3.'&limit=20&apiKey=JrMv7faeaOpGnJXd_VwW11pu8AoiIgEy_O29cZHOtMQ';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

    $capCityHotels = json_decode($result,true);
    
    //capital city parks
    $url='https://discover.search.hereapi.com/v1/discover?at='.$capitalLat.','.$capitalLng.'&q=park&lang=en-US&in=countryCode:'.$countryCodeA3.'&limit=20&apiKey=JrMv7faeaOpGnJXd_VwW11pu8AoiIgEy_O29cZHOtMQ';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

    $capCityParks = json_decode($result,true);

    //capital city parks
    $url='https://discover.search.hereapi.com/v1/discover?at='.$capitalLat.','.$capitalLng.'&q=restaurant&lang=en-US&in=countryCode:'.$countryCodeA3.'&limit=20&apiKey=JrMv7faeaOpGnJXd_VwW11pu8AoiIgEy_O29cZHOtMQ';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

    $capCityRestaurants= json_decode($result,true);

    //output status
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

    
    $output['data']['userIpInfo'] = $UserIp;
    $output['data']['weather'] = $weather;
    $output['data']['covidData'] = $covid;
    $output['data']['exchangeRates'] = $exchangeRates;
    $output['data']['wikiCountryExcerpt'] = $wikiCountryExcerpt;
    $output['data']['BingNews'] = $bingNews['value'];
    $output['data']['unescoSites'] = $unesco;
    $output['data']['capCityHospitals'] = $capCityHospitals;
    $output['data']['capCityAirports'] = $capCityAirports;
    $output['data']['capCityHotels'] = $capCityHotels;
    $output['data']['capCityParks'] = $capCityParks;
    $output['data']['capCityRestaurants'] = $capCityRestaurants;

    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output);

?>