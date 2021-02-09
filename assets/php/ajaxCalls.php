<?php
    $border = null;
    $countryCodeA2 = null;
    $countryCodeA3 = null;
    $capitalCity = null;
    $countryFullName = null;
    
    $countryName = null;
    $countryNameNoSpace = null;
    $capitalLat = null;
    $capitalLng = null;
    $capitalCityNoSpace = null;

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
    $countryNameNoSpace = preg_replace('/\s+/', '%20', $countryName);
    $wikiCountryName = preg_replace('/\s+/', '_', $countryName);
    
    $countryCodeA2 = $border['properties']['iso_a2'];
    $countryCodeA3 = $border['properties']['iso_a3'];
    
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
    $capitalCityNoSpace =  preg_replace('/\s+/', '%20', $capitalCity);
    $currentCurrency = $restCountries['currencies'][0]['code'];
        
    
    //PositionStack API Call for capital city long and lat
    $url ='http://api.positionstack.com/v1/forward?access_key=cc4a38f03554215037c505edf96abf81&query='. $capitalCityNoSpace .','.$countryNameNoSpace;
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
    $url='http://data.fixer.io/api/latest?access_key=8bc8db0d02010c50047f53ccf9889388';
    //$url='https://openexchangerates.org/api/latest.json?app_id=172dd560a2bd4ea38005129d6fae498d';

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
    $accessKey = '548e929165324c1a8299320a99b97056';

    $endpoint = 'https://api.bing.microsoft.com/v7.0/news/search';

    $term = $countryName;

    function BingNewsSearch ($url, $key, $query) {
        $headers = "Ocp-Apim-Subscription-Key: $key\r\n";
        $options = array ('http' => array (
                            'header' => $headers,
                            'method' => 'GET' ));
        $context = stream_context_create($options);
        $result = file_get_contents($url . "?q=" . urlencode($query)."&originalImg=true&setLang=en-gb&mkt=en-GB&count=6", false, $context);
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
    $url='https://discover.search.hereapi.com/v1/discover?at='.$capitalLat.','.$capitalLng.'&q=hospital&lang=en-US&in=countryCode:'.$countryCodeA3.'&limit=10&apiKey=vUAsu-QX6rLWXv_WfJqiy4F94uhDCTj7aWfdLWMaiqM';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

    $capCityHospitals = json_decode($result,true);
    
    //capital city airports
    $url='https://discover.search.hereapi.com/v1/discover?at='.$capitalLat.','.$capitalLng.'&q=airport&lang=en-US&in=countryCode:'.$countryCodeA3.'&limit=15&apiKey=vUAsu-QX6rLWXv_WfJqiy4F94uhDCTj7aWfdLWMaiqM';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

    $capCityAirports = json_decode($result,true);
    
    //capital city parks
    $url='https://discover.search.hereapi.com/v1/discover?at='.$capitalLat.','.$capitalLng.'&q=park&lang=en-US&in=countryCode:'.$countryCodeA3.'&limit=20&apiKey=vUAsu-QX6rLWXv_WfJqiy4F94uhDCTj7aWfdLWMaiqM';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

    $capCityParks = json_decode($result,true);

    //capital city museums
    $url='https://discover.search.hereapi.com/v1/discover?at='.$capitalLat.','.$capitalLng.'&q=museum&lang=en-US&in=countryCode:'.$countryCodeA3.'&limit=25&apiKey=vUAsu-QX6rLWXv_WfJqiy4F94uhDCTj7aWfdLWMaiqM';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

    $capCityMuseums = json_decode($result,true);

//large cities in country
$url='https://public.opendatasoft.com/api/records/1.0/search/?dataset=geonames-all-cities-with-a-population-1000&q=&rows=8&sort=population&facet=timezone&facet=country&refine.country_code='. $countryCodeA2;

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);

$result=curl_exec($ch);

curl_close($ch);

$largeCities = json_decode($result,true);
$output['data']['largeCities'] = $largeCities['records'];

$wikiCitiesData = array();
    foreach ($largeCities['records'] as $key => $value) {
        $cityLat = $value['geometry']['coordinates'][1];
        $cityLng = $value['geometry']['coordinates'][0];
        
            //wiki cities long/lat marker data
            $url='http://api.geonames.org/findNearbyWikipediaJSON?formatted=true&lat=' . $cityLat . '&lng=' . $cityLng . '&country='. $countryCodeA2 .'&maxRows=25&username=flightltd&style=full';

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_URL,$url);

            $result=curl_exec($ch);

            curl_close($ch);
            
            $cityData = json_decode($result,true);
            if ( is_null( $cityData['geonames']) ) {
                continue;
            } else if (isset($cityData['geonames'])){
                $cityData2 = $cityData['geonames'];
                array_push($wikiCitiesData, $cityData2);
            };
            
    }; 

$wikiCitiesTextData = array();
foreach ($largeCities['records'] as $key => $value) {
    $cityName = preg_replace('/\s+/', '%20', $value['fields']['name']);
        //wiki city wiki text info
        $url='http://api.geonames.org/wikipediaSearchJSON?formatted=true&q=' . $cityName .'&maxRows=20&username=estrada1107&style=full';

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_URL,$url);

        $result=curl_exec($ch);

        curl_close($ch);
        $cityTxtData = json_decode($result,true);
        
        array_push($wikiCitiesTextData, $cityTxtData);
}


    //output status
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

    $output['data']['weather'] = $weather;
    $output['data']['covidData'] = $covid;
    $output['data']['exchangeRates'] = $exchangeRates;
    $output['data']['wikiCountryExcerpt'] = $wikiCountryExcerpt;
    $output['data']['BingNews'] = $bingNews;
    $output['data']['unescoSites'] = $unesco;
    $output['data']['capCityHospitals'] = $capCityHospitals;
    $output['data']['capCityAirports'] = $capCityAirports;
    $output['data']['capCityParks'] = $capCityParks;
    $output['data']['capCityMuseums'] = $capCityMuseums;
    $output['data']['wikiCitiesData'] = $wikiCitiesData;
    $output['data']['wikiCitiesTextData'] = $wikiCitiesTextData;

    echo json_encode($output);
?>