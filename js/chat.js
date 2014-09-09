function resetValuesAndActions(){
	//reset all fields & actions
	$('#email').val('');
	$('#name').val('');
	$('#loopGetNewChatMessages').val(0);
	$('#LoopObserveUserOperatorCommitment').val(0);
	$('#lastGetNewChatMessagesTimestamp').val('');
	$('#offline-message').val('');
	$('#operator_hash').val('');
	$('#chat_dialog').val('');
	$('#user_hash').val('');	
	$('#dialog_hash').val('');
	$('#operator_available').val('');
	$('#dialog_status').val('');
}

function ViewController(status){

		switch(status){
			case 'show-welcome-splash':  
									resetValuesAndActions();
									showView('welcome-splash'); 
									break;
			case 'show-auth-form':  showView('auth-form'); break;
			case 'submit-auth-form': 
							  if(!formValidation()){
								  var message = 'bitte namen & email angeben sowie grund auswählen.';
								  $('#error-message').html(message);
								  showView('auth-form&error-message');
		
							  }else{//init chat request OR send offline message
								  
								  InitChatRequest();
								  
								  //any operator available ?
								  if($('#operator_available').val() != '0'){
									
									showView('chat-box');
								  	//wait for operator commitment
								  	$('#LoopObserveUserOperatorCommitment').val(1);
								  	LoopObserveUserOperatorCommitment();

								  }else{
									showView('offline-message-box');
								  }
							  }
						      break;
			case 'send-chatmessage': sendNewChatMessage(); break;
			case 'send-offlinemessage': sendMessage(); 
										showView('termination_offline_message'); 
										break;
			case 'logoff': showView('termination_chat'); break;
			case 'termination-messagebox': showView('welcome-splash'); break;
			default: showView('error-message');break;
		}
}

function Test(){

	  alert('test');
}

function LoopObserveUserOperatorCommitment(){
	
	setTimeout(function() {
      if ($('#LoopObserveUserOperatorCommitment').val() == 0) {
          return;
      }

      // Do what you need to do   
      ObserveUserOperatorCommitment();

      LoopObserveUserOperatorCommitment();
	}, 1000);	

}

function ObserveUserOperatorCommitment(){

	var dialog_hash = $('#dialog_hash').val();
	var resultObserveUserOperatorCommitment = $.ajax({
		url: "http://chatclient/nusoap_client.php",
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		type: "POST",
		async: false,
		data: { call: 'ObserveUserOperatorCommitment', dialog_hash: dialog_hash },
		dataType: "json"
	});
	
	resultObserveUserOperatorCommitment.success(function(data){
		
		var tmp = data;
		$.each(tmp, function(key, value){
		
				if(key=="status"){//operator has accepted?
					if(value=="2"){
						$('#operator_hash').val(data.operator_hash);
						
						//trigger löst den nachrichtenabruf intervall auf..
						$('#dialog_status').val(value).trigger('change');
						console.log('dialog_status: ' + $('#dialog_status').val());
					}else if(value == "3"){
						$('#LoopObserveUserOperatorCommitment').val(0);//cancel observer loop
						$('#dialog_status').val(value);//chat dialog was finished
						$('#loopGetNewChatMessages').val(0);//nachrichtenabruf intervall stoppen
						showView('termination_chat');
					}
				
				}else if(key=="error")
					alert(value);
		});
		
	});

	resultObserveUserOperatorCommitment.fail(function(xHttp, statustext){
		console.log(statustext);
		alert(statustext);
	});

}


	function LoopGetNewChatMessages(){
	 	setTimeout(function() {
            if ($('#loopGetNewChatMessages').val() == 0) {
                return;
            }

            // Do what you need to do   
            GetNewChatMessages();
    
            LoopGetNewChatMessages();
        }, 500);	

	}
	
	


function getTime(){
  	var formattedDate = new Date();
  	var d = formattedDate.getDate();
  	var month = formattedDate.getMonth();
      month = parseInt(month)+1;
  	var h = formattedDate.getHours();
  	var m = formattedDate.getMinutes();
  	var s = formattedDate.getSeconds();
  	var y = formattedDate.getFullYear();
  	timearray = {year : y, month: month, day : d, hour: h, minute:m, sec:s};
		$.each(timearray, function(key, value){
			var tmp = value.toString();
			if(tmp.length < 2){
				switch(key){
					case 'month': month = '0' + tmp; break;
					case 'day': d = '0' + tmp; break;
					case 'hour': h = '0' + tmp; break;
					case 'minute': m = '0' + tmp; break;
					case 'sec': s = '0' + tmp; break;
				}
			}
		});
  	
  	var datetime = y + '-' + month + '-' + d + ' ' + h + ':' + m + ':' + s;

		
		return datetime;
}

function GetNewChatMessages(){

	
	//toid = setTimeout(GetNewMessages, 5000);
	
	var message = "";
	var posttimestamp = "";
	var currenttimestamp = getTime();
	console.log('currenttimestamp: ' + currenttimestamp);
	
	if($('#lastGetNewChatMessagesTimestamp').val() != ''){
		posttimestamp = $('#lastGetNewChatMessagesTimestamp').val();
	}
	
	console.log('posttimestamp: ' + posttimestamp);
	//var timestamp = '2014-08-20 21:34:07';
	var user_hash = $('#user_hash').val();
	var operator_hash = $('#operator_hash').val();
	var dialog_hash = $('#dialog_hash').val();
	

	var getNewChatmessageResult  = $.ajax({
		url: "http://chatclient/nusoap_client.php",
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		type: "POST",
		async: false,
		data: { call: 'GetNewChatMessages', dialog_hash: dialog_hash, posttimestamp: posttimestamp, currenttimestamp: currenttimestamp },
		dataType: "json"
	});

	
	getNewChatmessageResult.success(function(data){


	//update posttimestamp for next request
	$('#lastGetNewChatMessagesTimestamp').val(currenttimestamp);

	console.log(data);	

	var messages = [];
	$.each(data, function(){
		var p = this;
		var tmp = '';
		$.each(p, function(key, value){
			if(key=='name'){
				tmp += value + ': ';
			}
			else if(key=='message'){
				tmp += value;
			}else if(key=="error")
				alert(value);
		});
		if(tmp!='')
			messages.push(tmp);
	});

	if(messages.length > 0){

		//delete initial waiting message
		if($('#chat-dialog').val() == 'wait for operator ... '){
			$('#chat-dialog').val(messages.join('\n'));
		}
		else{
			var chatdialog = $('#chat-dialog').val() + '\n' + messages.join('\n');
			$('#chat-dialog').val(chatdialog);
		}
		
		$('#chat-dialog').animate({	
		    scrollTop:$('#chat-dialog')[0].scrollHeight - $('#chat-dialog').height()
		},1000,function(){
		    
		});
	}
		
	});
	getNewChatmessageResult.fail(function(jqXHR, textStatus){
		console.log(textStatus);
	});


}

function sendNewChatMessage(){
	var message = $('#name').val() + ': ' + $('#new-post').val();
	
	var user_hash = $('#user_hash').val()
	var dialog_hash = $('#dialog_hash').val()

	var sendChatmessageResult  = $.ajax({
		url: "http://chatclient/nusoap_client.php",
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		type: "POST",
		async: false,
		data: { call: 'SendChatMessage', dialog_hash: dialog_hash, message: message },
		dataType: "json"
	});

	sendChatmessageResult.success(function(data){
	
//		var chatdialog = $('#chat-dialog').val() + '\n' + $('#name').val() + ': ' + $('#new-post').val();
//		$('#chat-dialog').val(chatdialog);
		$('#new-post').val('');
		
		console.log(data);
	});
	sendChatmessageResult.fail(function(jqXHR, textStatus){
		console.log(textStatus);
	});


}

function sendMessage(){
	var message = $('#offline-message').val();
	var user_hash = $('#user_hash').val();

	var sendMessageResult  = $.ajax({
		url: "http://chatclient/nusoap_client.php",
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		type: "POST",
		async: false,
		data: { call: 'SendMessage', user_hash: user_hash, message: message },
		dataType: "json"
	});

	sendMessageResult.success(function(data){
		console.log('sendmessage' + data);
//		var chatdialog = $('#chat-dialog').val() + '\n' + $('#name').val() + ': ' + $('#new-post').val();
//		$('#chat-dialog').val(chatdialog);
		//showView('termination_offline_message');

	});
	sendMessageResult.fail(function(jqXHR, textStatus){
		console.log('sendmessage' + textStatus);
	});


}



function setUserOperatorStatus(){
	
	$.ajax({
		url: 'http://chatclient/nusoap_client.php',
		data: {call: 'SetUserOperatorStatus', status: 3, dialog_hash: $('#dialog_hash').val()},
		dataType: 'json',
		type: 'post',
		assync: false
	}).success(function(data){
		//console.log(data);
	}).fail(function(xhr, textstatus){
		//console.log(data);
	});
	
}

function showView(view){

	var array = view.split('&'); //split possible error message
	var errormessage = (view == 'error-message')?'error-message':null;
	if(array.length > 1){
		view = array[0];
		if(array['1'] == 'error-message'){
			errormessage = array[1];
		}
	}
	$('#spinner').hide();
	$("#error-message").hide();
	$("#welcome-splash").hide();
	$("#auth-form").hide();
	$("#chat-box").hide();
	$("#offline-message-box").hide();
	$("#termination_chat").hide();
	$("#termination_offline_message").hide();
	
	
	switch(view){
		case 'welcome-splash': 
			$("#welcome-splash").show();
			break;
			
		case 'auth-form': 
			$("#auth-form").show();
			break;
		
		case 'chat-box': 
			$("#chat-dialog").val('wait for operator ... ');
			$("#chat-box").show();
			break;
			
		case 'offline-message-box': 
			$("#offline-message-box").show();
			break;
			
		case 'termination_chat': 
			setUserOperatorStatus();
			resetValuesAndActions();
			$("#termination_chat").show();
			break;
			
		case 'termination_offline_message': 
			resetValuesAndActions();
			$("#termination_offline_message").show();
			break;
		
		default: break;//$("#error-message").show(); break;
	}

	if(errormessage != null){
		$("#error-message").show();
	}

}



function GetAllChatMessages(){
	var user_hash = $('#user_hash').val()
	var userobject = { call: 'GetAllChatMessages', dialog_hash: dialog_hash, joinTable: 'user' };
	var resGetAllMessages  = $.ajax({
		url: "http://chatclient/nusoap_client.php",
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		type: "POST",
		async: false,
		data: userobject,
		dataType: "json"
	});

	resGetAllMessages.success(function(data){
		var messages = [];
		
		$.each(data, function(){
			var p = this;
			var tmp = '';
			$.each(p, function(key, value){
				
				if(key=='name')
					//tmp +='<span class=\'dialog-text-client-name\'>' + value + '</span>: ';
					tmp +=value + ': ';
				else if(key=='message')
					tmp +=value;
			}); 
			if(tmp != '')
			 	messages.push(tmp);
		});

		$('#chat-dialog').val(messages.join('\n'));
		console.log(messages);
	});
	resGetAllMessages.fail(function(jqXHR, textStatus){
		console.log(textStatus);
	});

}

	
function InitChatRequest(){

		var userdata = {};
		userdata.name = $('#name').val()
		userdata.email = $('#email').val();
		userdata.call = "InitChatRequest";
		
		var request  = $.ajax({
			url: "http://chatclient/nusoap_client.php",
			contentType: "application/x-www-form-urlencoded; charset=UTF-8",
			type: "POST",
			async: false,
			data: userdata,
			dataType: "json"
		});
	
		request.success(function(data){
			//alert('successsss');
			//bind operator_hash and user_hash to hidden fields
			//console.log(data);
			$.each(data, function( key, value ) {
					
				  if(key == 'dialog_hash'){
				  	  $('#dialog_hash').val(value);
				  }
				  else if(key == 'user_hash'){
					  $('#user_hash').val(value);
				  }
				  else if(key == 'operator_available'){
					  $('#operator_available').val(value);
				  }
			});


		});	
		request.fail(function(jqXHR, textStatus){
			alert(textStatus);
		});
	

}


function formValidation(){
	
	var email = $('#email').val();
	var name = $('#name').val();
	var requestcase = $("#myselect option:selected" ).text();
	if(email != '' && name != '' && requestcase != '--- Bitte auswählen ---')
		return true;
	else
		return false;
}