<? 
function getWalkScore($lat, $lon, $address) {
	// status 41 - Your daily API quota has been exceeded.
	// $APIKEY1 = "823ebf192a9537ddb2cbb92ea29ff225";
	// $APIKEY2 = "da798f70a01ed66eba6ef6fadfef657c";
    // $APIKEY3 = "ffd1c56f9abcf84872116b4cc2dfcf31";
	$APIKEY4 = "3d0a80831f3b8b1feb8abfcea5a823ca";
	$address=urlencode($address);
	$url = "http://api.walkscore.com/score?format=json&address=$address";
	$url .= "&lat=$lat&lon=$lon&wsapikey=";
	$url = $url . $APIKEY4;
	$str = @file_get_contents($url);
	return $str; 
} 

$lat = $_GET['lat']; 
$lon = $_GET['lon']; 
$address = stripslashes($_GET['address']);
$json = getWalkScore($lat,$lon,$address);
echo $json; 

?>