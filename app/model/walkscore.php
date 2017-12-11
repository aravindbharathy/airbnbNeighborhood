<? 
function getWalkScore($lat, $lon, $address) {
	// status 41 - Your daily API quota has been exceeded.
	$APIKEY1 = "823ebf192a9537ddb2cbb92ea29ff225";
	$APIKEY2 = "da798f70a01ed66eba6ef6fadfef657c";
    $APIKEY3 = "ffd1c56f9abcf84872116b4cc2dfcf31";
	$APIKEY4 = "3d0a80831f3b8b1feb8abfcea5a823ca";
	// next day
	$APIKEY5 = "3a0c265c4326b7b35e65d383d4594148";
	$APIKEY6 = "b54d7a1a14b06657d6ecd2bc9fe8f2ed";
	$APIKEY7 = "b8e1215244ca3c87e2018dfa731744b5";
	
	$address=urlencode($address);
	$url = "http://api.walkscore.com/score?format=json&address=$address";
	$url .= "&lat=$lat&lon=$lon&wsapikey=";
	$url = $url . $APIKEY7;
	$str = @file_get_contents($url);
	return $str; 
} 

$lat = $_GET['lat']; 
$lon = $_GET['lon']; 
$address = stripslashes($_GET['address']);
$json = getWalkScore($lat,$lon,$address);
echo $json; 

?>