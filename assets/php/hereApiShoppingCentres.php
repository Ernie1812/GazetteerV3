<?php

    $executionStartTime = microtime(true) / 1000;

	$url='https://discover.search.hereapi.com/v1/discover?at='.$_REQUEST['clickLat'].','.$_REQUEST['clickLng'].'&q=shoppingCentre&lang=en-US&in=countryCode:'.$_REQUEST['iso3Code'].'&limit=15&apiKey=JrMv7faeaOpGnJXd_VwW11pu8AoiIgEy_O29cZHOtMQ';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);	

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "mission saved";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['HEREapiData'] = $decode;
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>