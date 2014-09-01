function ViewController(status){

		switch(status){
			case 'show-welcome-splash':  
									//reset all fields & actions
									$('#loopGetNewChatMessages').val(0);
									$('#LoopObserveOperatorCommitment').val(0);
									$('#lastGetNewChatMessagesTimestamp').val('');
									$('#operator_hash').val('');
									$('#chat_dialog').val('');
									$('#user_hash').val('');
									$('#dialog_hash').val('');
									$('#operator_available').val('');
									$('#dialog_status').val('');
									
									showView('welcome-splash'); 
									break;
			case 'show-auth-form':  showView('auth-form'); break;
			case 'submit-auth-form': 
							  if(!formValidation()){
							
								  $('#error-message').html(message);
								  showView('auth-form&error-message');
		
							  }else{//init chat request OR send offline message
								  
								  InitChatRequest();
								  
								  //any operator available ?
								  if($('#operator_available').val() != '0'){
									
									showView('chat-box');
								  	//wait for operator commitment
								  	$('#LoopObserveOperatorCommitment').val(1);
								  	LoopObserveOperatorCommitment();

								  }else{
									showView('offline-message-box');
								  }
							  }
						      break;
			case 'send-chatmessage': sendNewChatMessage(); break;
			case 'send-offlinemessage': sendOfflineMessage(); 
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

function LoopObserveOperatorCommitment(){
	
	setTimeout(function() {
      if ($('#LoopObserveOperatorCommitment').val() == 0) {
          return;
      }

      // Do what you need to do   
      ObserveOperatorCommitment();

      LoopObserveOperatorCommitment();
	}, 1000);	

}

function ObserveOperatorCommitment(){

	var dialog_hash = $('#dialog_hash').val();
	var resultObserveOperatorCommitment = $.ajax({
		url: "http://chatclient/nusoap_client.php",
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		type: "POST",
		async: false,
		data: { call: 'ObserveOperatorCommitment', dialog_hash: dialog_hash },
		dataType: "json"
	});
	
	resultObserveOperatorCommitment.success(function(data){
		
		var tmp = data;
		$.each(tmp, function(key, value){
		
				if(key=="status"){//operator has accepted?
					if(value=="2"){
						$('#LoopObserveOperatorCommitment').val(0);//cancel observer loop
						$('#operator_hash').val(data.operator_hash);
						$('#dialog_status').val(value).trigger('change');
						console.log('dialog_status: ' + $('#dialog_status').val());
					}
				
				}
		});
		

//		console.log($('#LoopObserveOperatorCommitment').val())
//	    console.log($('#operator_hash').val());
//		console.log($('#user_hash').val());
//		console.log($('#operator_hash').val());

	});

	resultObserveOperatorCommitment.fail(function(xHttp, statustext){
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
        }, 1000);	

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
			}
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
	var message = $('#new-post').val();
	var user_hash = $('#user_hash').val();

	var sendChatmessageResult  = $.ajax({
		url: "http://chatclient/nusoap_client.php",
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		type: "POST",
		async: false,
		data: { call: 'SendMessage', user_hash: user_hash, message: message },
		dataType: "json"
	});

	sendChatmessageResult.success(function(data){
	
//		var chatdialog = $('#chat-dialog').val() + '\n' + $('#name').val() + ': ' + $('#new-post').val();
//		$('#chat-dialog').val(chatdialog);
		showView('termination_offline_message');

	});
	sendChatmessageResult.fail(function(jqXHR, textStatus){
		console.log(textStatus);
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
			$("#termination_chat").show();
			break;
			
		case 'send-offlinemessage': 
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
				  	  //$('#dialog_hash').val(value);
				  	  $('#dialog_hash').val('8b27769258c6fcb0fb1322dc3dfe9f7c');
				  }
				  else if(key == 'user_hash'){
					  //$('#user_hash').val(value);
					  $('#user_hash').val('482a5181b7d5d84fa57f2677a43d8757');
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