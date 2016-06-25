/* VARIABLES */
var socket = io.connect();
var dataArray = [];

/* sockets */
function onSocketConnect() {
	sessionId = socket.io.engine.id;
	console.log('Connected ' + sessionId);
	socket.emit('listData');
};

function onSocketError(reason) {
	console.log('Unable to connect to server', reason);
};

/* sockets */
socket.on('connect', onSocketConnect);
socket.on('error', onSocketError);
socket.on('sendText', onTextData);
socket.on('sendImages', onImagesData);


jQuery(document).ready(function($) {

	$(document).foundation();
	init();
});


function init(){
	setTimeout(function(){
		// console.log(dataArray);

		for(var i =0; i<9; i++){
			var randomIndex = Math.floor(Math.random() * dataArray.length);
			var randomFile = dataArray[randomIndex];
			var $randomCell = $('.cell').eq(i);
			// console.log(randomFile);
			var ext = randomFile.split('.')[1];
			$randomCell.attr('data-index', randomIndex);
			if(ext == 'jpg'){
				$randomCell.attr('data-ext', 'jpg');
				$randomCell.html('<img src="images/'+randomFile+'">');
			}
			else{
				$randomCell.attr('data-ext', 'txt');
				$randomCell.html('<p>'+randomFile+'</p>');
			}
		}
	},3000);

	$(document).on('keypress',function(e){
		var code = e.keyCode;
		// 	console.log(code);
		//a 97 et e 101
		if(e.keyCode == 97){
			var dataIndex = $('.cell').eq(0).attr('data-index');
			$('.cell').eq(0).attr('data-index', (parseInt(dataIndex-1)));
			var prevFile = dataArray[parseInt((dataIndex-1))];
			var extension = $('.cell').eq(0).attr('data-ext');
			// console.log(prevFile);
			if(extension == 'jpg'){
				$('.cell').eq(0).html('<img src="images/'+prevFile+'">');
			}
			else{
				$('.cell').eq(0).html('<p>'+prevFile+'</p>');
			}
		}
		if(e.keyCode == 101){
			var dataIndex = $('.cell').eq(0).attr('data-index');
			$('.cell').eq(0).attr('data-index', (parseInt(dataIndex)+1));
			console.log((parseInt(dataIndex)+1));
			var nextFile = dataArray[(parseInt(dataIndex)+1)];
			var extension = $('.cell').eq(0).attr('data-ext');
			if(extension == 'jpg'){
				$('.cell').eq(0).html('<img src="images/'+nextFile+'">');
			}
			else{
				$('.cell').eq(0).html('<p>'+nextFile+'</p>');
			}
		}
	});	

}

function onTextData(text){
	dataArray.push(text);
}

function onImagesData(images){
	dataArray.push(images);
}






