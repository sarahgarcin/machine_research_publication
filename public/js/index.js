/* VARIABLES */
var socket = io.connect();
var dataTextLong;
var dataImages= [];

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
socket.on('sendShortText', onShortTextData);
socket.on('sendImages', onImagesData);


jQuery(document).ready(function($) {

	$(document).foundation();
	init();
});


function init(){
	
	// setTimeout(function(){
	// 	var randomIndex = Math.floor(Math.random() * dataArray.length);
	// 	var randomFile = dataArray[randomIndex];
		
	// }, 3000);


	// var scaleCount = 1;
	// var imagePosY = 0;
	// var imagePosX = 0;
	// setTimeout(function(){
	// 	// console.log(dataArray);

	// 	for(var i =0; i<9; i++){
	// 		var randomIndex = Math.floor(Math.random() * dataArray.length);
	// 		var randomFile = dataArray[randomIndex];
	// 		var $randomCell = $('.cell').eq(i);
	// 		// console.log(randomFile);
	// 		var ext = randomFile.split('.')[1];
	// 		$randomCell.attr('data-index', randomIndex);
	// 		if(ext == 'jpg'){
	// 			$randomCell.attr('data-ext', 'jpg');
	// 			$randomCell.html('<img src="images/'+randomFile+'">');
	// 		}
	// 		else{
	// 			$randomCell.attr('data-ext', 'txt');
	// 			$randomCell.html('<p>'+randomFile+'</p>');
	// 		}
	// 	}
	// },3000);

	// Action on keypress
		// $(document).on('keypress',function(e){
		// 	var code = e.keyCode;
		// 	console.log(code);
		// 	var $firstCell = $('.cell').eq(0);
		// 	// press space (32) -> transform the page in pdf
		// 	if(e.keyCode == 32){
		// 		socket.emit('savePDF');
		// 	}
		// 	//a 97 et e 101
		// 	// change image in the first cell
		// 	if(e.keyCode == 97){
		// 		var dataIndex = $('.cell').eq(0).attr('data-index');
		// 		$('.cell').eq(0).attr('data-index', (parseInt(dataIndex-1)));
		// 		var prevFile = dataArray[parseInt((dataIndex-1))];
		// 		var extension = $('.cell').eq(0).attr('data-ext');
		// 		console.log(extension);
		// 		if(extension == 'jpg'){
		// 			$('.cell').eq(0).html('<img src="images/'+prevFile+'">');
		// 		}
		// 		else{
		// 			$('.cell').eq(0).html('<p>'+prevFile+'</p>');
		// 		}
		// 	}
		// 	if(e.keyCode == 101){
		// 		var dataIndex = $('.cell').eq(0).attr('data-index');
		// 		$('.cell').eq(0).attr('data-index', (parseInt(dataIndex)+1));
		// 		// console.log((parseInt(dataIndex)+1));
		// 		var nextFile = dataArray[(parseInt(dataIndex)+1)];
		// 		var extension = $('.cell').eq(0).attr('data-ext');
		// 		if(extension == 'jpg'){
		// 			$('.cell').eq(0).html('<img src="images/'+nextFile+'">');
		// 		}
		// 		else{
		// 			$('.cell').eq(0).html('<p>'+nextFile+'</p>');
		// 		}
		// 	}
		// 	// press Z and if zoom in the cell
		// 	if(e.keyCode == 122){
		// 		console.log(scaleCount);
		// 		if(scaleCount > 4){
		// 			console.log('too big');
		// 			scaleCount = 1;
		// 		}
		// 		else{
		// 			console.log('increase');
		// 			scaleCount += 0.2;
		// 			$firstCell.children().css({
		// 				'transform': 'scale('+scaleCount+')'
		// 			});
		// 		}
		// 	}
		// 	// press - and if zoom out the cell
		// 	if(e.keyCode == 45){
		// 		console.log(scaleCount);
		// 		if(scaleCount < 0.4){
		// 			console.log('too small');
		// 			scaleCount = 1.2;
		// 		}
		// 		else{
		// 			console.log('discrease');
		// 			scaleCount -= 0.2;
		// 			$firstCell.children().css({
		// 				'transform': 'scale('+scaleCount+')'
		// 			});
		// 		}
		// 	}
		// 	// move the image in the cell
		// 	// press o to move the image up
		// 	if(e.keyCode == 111){
		// 		console.log(imagePosY, $firstCell.children().height());
		// 		if(imagePosY < -$firstCell.children().height()){
		// 			console.log('too high');
		// 			imagePosY = 0;
		// 		}
		// 		else{
		// 			console.log('go high');
		// 			imagePosY -= 10;
		// 			$firstCell.children().css({
		// 				'transform': 'translateY('+imagePosY+'px)',
		// 				// 'transform': 'scale('+scaleCount+')'
		// 			});
		// 		}
		// 	}
		// 	// press l to move the image down
		// 	if(e.keyCode == 108){
		// 		console.log(imagePosY, $firstCell.children().height());
		// 		if(imagePosY > $firstCell.children().height()){
		// 			console.log('too low');
		// 			imagePosY = 0;
		// 		}
		// 		else{
		// 			console.log('go low');
		// 			imagePosY += 10;
		// 			$firstCell.children().css({
		// 				'transform': 'translateY('+imagePosY+'px)',
		// 				// 'transform': 'scale('+scaleCount+')'
		// 			});
		// 		}
		// 	}
		// 	// press k to move the image left
		// 	if(e.keyCode == 107){
		// 		console.log(imagePosX, $firstCell.children().width());
		// 		if(imagePosX < -$firstCell.children().width()){
		// 			console.log('too low');
		// 			imagePosX = 0;
		// 		}
		// 		else{
		// 			console.log('go low');
		// 			imagePosX -= 10;
		// 			$firstCell.children().css({
		// 				'transform': 'translateX('+imagePosX+'px)',
		// 				// 'transform': 'scale('+scaleCount+')'
		// 			});
		// 		}
		// 	}
		// 	// press m to move the image right
		// 	if(e.keyCode == 109){
		// 		console.log(imagePosX, $firstCell.children().width());
		// 		if(imagePosX > $firstCell.children().width()){
		// 			console.log('too high');
		// 			imagePosX = 0;
		// 		}
		// 		else{
		// 			console.log('go high');
		// 			imagePosX += 10;
		// 			$firstCell.children().css({
		// 				'transform': 'translateX('+imagePosX+'px)',
		// 				// 'transform': 'scale('+scaleCount+')'
		// 			});
		// 		}
		// 	}

		// });	

}

function onShortTextData(text){
	console.log(text);
	addTextShort();
	changeTextShort();
	
	// add short text in the right place	
	function addTextShort(){

		var randomIndex = Math.floor(Math.random() * text.length);
		var randomFile = text[randomIndex];
		var $el = $('.page-wrapper .right .small-text-content');
		$el.attr('data-index', randomIndex);

		$el.append('<p>'+randomFile+'</p>');
	}

	function changeTextShort(){
		$(document).on('keypress',function(e){
			var code = e.keyCode;
			console.log(code);
			var $el = $('.page-wrapper .right .small-text-content');
			// on "a" press go to prev image
			if(e.keyCode == 97){
				var dataIndex = $el.attr('data-index');
				var prevIndex = parseInt((dataIndex)-1);

				if(prevIndex >= 0){
					$el.attr('data-index', prevIndex);
					var prevFile = text[prevIndex];
					$el.html('<p>'+prevFile+'</p>');
				}
			}

			// on "e" press go to next image
			if(e.keyCode == 101){

				var dataIndex = $el.attr('data-index');
				var nextIndex = (parseInt(dataIndex)+1);
				
				if(nextIndex < text.length){
					console.log('text are there');
					$el.attr('data-index', nextIndex);
					var nextFile = text[nextIndex];
					$el.html('<p>'+nextFile+'</p>');
				}
			}

		});
	}
}

function onTextData(text){
	console.log(text);
	addTextLong();
	changeTextLong();
	
	// add long text in the right place	
	function addTextLong(){

		var randomIndex = Math.floor(Math.random() * text.length);
		var randomFile = text[randomIndex];
		var $el = $('.page-wrapper .left .text-content');
		$el.attr('data-index', randomIndex);

		$el.append('<p>'+randomFile+'</p>');
	}

	function changeTextLong(){
		$(document).on('keypress',function(e){
			var code = e.keyCode;
			console.log(code);
			var $el = $('.page-wrapper .left .text-content');
			// on "a" press go to prev image
			if(e.keyCode == 97){
				var dataIndex = $el.attr('data-index');
				var prevIndex = parseInt((dataIndex)-1);

				if(prevIndex >= 0){
					$el.attr('data-index', prevIndex);
					var prevFile = text[prevIndex];
					$el.html('<p>'+prevFile+'</p>');
				}
			}

			// on "e" press go to next image
			if(e.keyCode == 101){

				var dataIndex = $el.attr('data-index');
				var nextIndex = (parseInt(dataIndex)+1);
				
				if(nextIndex < text.length){
					console.log('text are there');
					$el.attr('data-index', nextIndex);
					var nextFile = text[nextIndex];
					$el.html('<p>'+nextFile+'</p>');
				}
			}

		});
	}
}

function onImagesData(images){
	// dataImages.push(images);
	console.log(images);
	addImages();
	changeImages();
	
	// add Images in the right place	
	function addImages(){

		var randomIndex = Math.floor(Math.random() * images.length);
		var randomFile = images[randomIndex];
		var ext = randomFile.split('.')[1];
		var $el = $('.page-wrapper .right .image-content');
		$el.attr('data-index', randomIndex);

		if(ext == 'jpg'){
			console.log('Yes jpg image');
			$el.append('<img src="images/'+randomFile+'">');
		}
		else{
			console.log('Not a jpg image');
			addImages();
		}

	}

	function changeImages(){
		$(document).on('keypress',function(e){
			var code = e.keyCode;
			console.log(code);
			var $el = $('.page-wrapper .right .image-content');
			// on "a" press go to prev image
			if(e.keyCode == 97){
				var dataIndex = $el.attr('data-index');
				var prevIndex = parseInt((dataIndex)-1);

				if(prevIndex > 0){
					$el.attr('data-index', prevIndex);
					var prevFile = images[prevIndex];
					$el.html('<img src="images/'+prevFile+'">');
				}
			}

			// on "e" press go to next image
			if(e.keyCode == 101){

				var dataIndex = $el.attr('data-index');
				var nextIndex = (parseInt(dataIndex)+1);
				
				if(nextIndex < (images.length - 1)){
					console.log('images are there');
					$el.attr('data-index', nextIndex);
					var nextFile = images[nextIndex];
					$el.html('<img src="images/'+nextFile+'">');
				}
			}

		});
	}

}






