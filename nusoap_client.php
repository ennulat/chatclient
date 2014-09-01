<?php
error_reporting(E_ERROR | E_NOTICE | E_PARSE);

require_once './lib/nusoap/nusoap.php';
$client = new nusoap_client("http://webservice/nusoap_server.php");
$client->soap_defencoding = 'UTF-8';
$client->decode_utf8 = false;
$result =  "no result";
//$_REQUEST['call'] = 'InitChatRequest';
require_once('helper.php');
//helper::writelog($_POST);
//$_POST = array('call' => 'InitChatRequest', 'name' => 'Maurer', 'email' => 'maurer@gmail.com');
//$_POST = array('call' => 'ObserveOperatorCommitment', 'dialog_hash' => 'a48576f78912fd8bbb519df622325af9');


if(isset($_POST['call'])){

	try{
		switch($_POST['call']){
			case 'ObserveOperatorCommitment':
				//$result =$client->call("GetAllChatMessages", array(array("sendby" => "482a5181b7d5d84fa57f2677a43d8757", "joinTable" => "user")));
				$result =$client->call("ObserveOperatorCommitment", array("dialog_hash" => $_POST['dialog_hash']));
				break;
			case 'GetAllChatMessages':
				//$result =$client->call("GetAllChatMessages", array(array("sendby" => "482a5181b7d5d84fa57f2677a43d8757", "joinTable" => "user")));
				$result =$client->call("GetAllChatMessages", array(array("dialog_hash" => $_POST['dialog_hash'])));
				break;
			case 'GetNewChatMessages':
				helper::writelog($_POST);
				//$result =$client->call("GetNewChatMessages", array(array("sendby" => "482a5181b7d5d84fa57f2677a43d8757", "timestamp" => "2014-08-14 16:57:01", "joinTable" => "user")));
				$result =$client->call("GetNewChatMessages", array(array("dialog_hash" => $_POST['dialog_hash'], "posttimestamp" => $_POST['posttimestamp'], "currenttimestamp" => $_POST['currenttimestamp'])));
				break;
			case 'SendChatMessage':
				//$result =$client->call("SendChatMessage", array(array("sendby" => "482a5181b7d5d84fa57f2677a43d8757", "message" => "random message: ".hash(md5,time())."")));
				$result =$client->call("SendChatMessage", array(array("dialog_hash" => $_POST['dialog_hash'], "message" => $_POST['message'])));
				break;
			case 'SendMessage':
				//$result =$client->call("SendChatMessage", array(array("sendby" => "482a5181b7d5d84fa57f2677a43d8757", "message" => "random message: ".hash(md5,time())."")));
				$result =$client->call("SendMessage", array(array("user_hash" => $_POST['user_hash'], "message" => $_POST['message'])));
				break;
			case 'InitChatRequest':
				helper::writelog($_POST);
				//$result =$client->call("InitChatRequest", array(array("name" => "Hogan", "email"=>"hogan@gmail.de")));
				$result =$client->call("InitChatRequest", array(array("name" => $_POST['name'], "email"=>$_POST['email'])));
				break;
			case 'GetAllOperators':
				helper::writelog($_POST);
				$result =$client->call("GetAllOperators", array());
				break;
			case 'Test':
				//$result =$client->call("GetAllChatMessages", array(array("sendby" => "482a5181b7d5d84fa57f2677a43d8757", "joinTable" => "user")));
				$result =$client->call("Test", array());
				break;
			default: echo json_encode(array('error' => 'requested method not available')); exit();
		}
	}catch(soap_fault $sfault){
		helper::writelog($sfault);
		echo json_encode(array('error' => $sfault->faultcode.' '.$sfault->faultstring).' '.$sfault->faultdetail); exit();
	}

	$soapError = $client->getError();
	if (!empty($soapError)) {
		$errorMessage = 'SOAP method invocation failed: ' . $soapError;
		//echo $errorMessage.'<br>';

		if ($client->fault) {
			$fault = "<br>{$client->faultcode}: {$client->faultdetail} ";
			// handle fault situation
			//echo $fault.'<br><br>';
			$errorMessage.' fault: '.$fault;
		}

		echo json_encode(array('error' => $errorMessage)); exit();
	  
	}else{

		//	echo '<pre>class: '.__CLASS__.' | @line:  '.__LINE__;
		//	var_dump( $result );
		//	echo '</pre>';

		echo json_encode($result); exit();
	}

}

