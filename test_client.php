<?php if(!isset($_POST['amount']))
{ ?>
<html>
	<head>Testscript</head>
	<body>
		<form method="POST" action="http://chatclient/test_client.php">
			<label>anzahl nachrichten</label>
			<input type="text" name="amount"> 
			<input type="submit" value="send">
		</form>
	</body>
</html>

<?php
}else{
	
	$amount = (!empty($_POST['amount']))?$_POST['amount']:5;
	error_reporting(E_ERROR | E_NOTICE | E_PARSE);
	
	require_once './lib/nusoap/nusoap.php';
	$client = new nusoap_client("http://webservice/nusoap_server.php");
	$client->soap_defencoding = 'UTF-8'; 
	$client->decode_utf8 = false;
	
	
	//set_time_limit(60);
	$i=0;
	do{
		$message = 'random message: '.hash('md5',microtime(true));
		$result =$client->call("SendChatMessage", array(array("dialog_hash" => "a85ba933", "message" => $message)));
		
		$soapError = $client->getError();
		if (!empty($soapError)) {
		    $errorMessage = 'SOAP method invocation failed: ' . $soapError;
		    echo $errorMessage.'<br>';
		    
			if ($client->fault) {
			    $fault = "{$client->faultcode}: {$client->faultdetail} ";
			    // handle fault situation
			    echo $fault.'<br><br>';
			}
		    break;
		}else{
			
		//	echo '<pre>class: '.__CLASS__.' | @line:  '.__LINE__;
		//	var_dump( $result );
		//	echo '</pre>';
		//	
			echo json_encode($result);
		}
		
		//sleep(5);
		$i++;
	}while($i<$amount);
	
	//die('execution time elapsed or error');
}
