/* VARIABLES */
var socket = io.connect();
var dataTextLong;
var dataImages= [];
var converter = new showdown.Converter();

// html elements
var $cell = $("div.right div.image-wrapper");
var $text = $(".text-content");

/* sockets */
function onSocketConnect() {
	sessionId = socket.io.engine.id;
	console.log('Connected ' + sessionId);
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

socket.on('zoomEvents', function(zoom){
	$cell.css('transform', 'scale('+zoom+')'); 
});

socket.on('moveEvents', function(posX, posY){
  $cell.css({
		'left': posX+'cm',
		'top':posY+'cm',
	})
});

socket.on('wordSpacingEvents', function(space){
	$text.css('word-spacing', ''+space +'px'); 
});

socket.on('changeTextEvents', function(textArray, index, element){
	var $textEl = $(element);
	var newFile = textArray[index];
	console.log(index);
	if(index > 0 && index < textArray.length){
		$textEl.attr('data-index', index);
		$textEl.html('<p>'+converter.makeHtml(newFile)+'</p>');
	}
});

socket.on('changeImagesEvents', function(files, index, element){
	var $el = $(element);
	var newFile = files[index];
	console.log(index);
	if(index > 0 && index < files.length){
		$el.attr('data-index', index);
		$el.html('<img src="images/'+newFile+'">');
	}
});


jQuery(document).ready(function($) {

	$(document).foundation();
	init();
	gridDisplayer();

});


function init(){
	
	// Z O O M  var
	var zoom = 1,
			minZoom = 0.4,
			maxZoom = 2,
			zoomStep = 0.1;

	// M O V E  var
	var posX = 0,
			posY= 0,
			maxX = 10,
			minX = -2,
			xStep = 0.5,
			maxY = 15,
			minY = -5,
			yStep = 0.5;

	// W O R D   S P A C I N G var
	var space= 0,
			spacePlus = 5,
			spaceMoins = 3;

	var countRegex = 0;
	
	var html = $('p').html();


	$(document).on('keypress', function(e){
		// console.log(e.keyCode);
		var code = e.keyCode;

		switch(code){
		
		// ------   C H A N G E   C O N T E N T ---------
			
			//press "a" to go to prev content
			case 97:
				prevContent('.right .small-text-content', 'content/short', 'changeText');
				prevContent('.left .text-content', 'content/long', 'changeText');
				prevContent('.right .image-content', 'content/images', 'changeImages');
				break;

			// press "e" to go to next content
			case 101:
				nextContent('.right .small-text-content', 'content/short', 'changeText');
				nextContent('.left .text-content', 'content/long', 'changeText');
				nextContent('.right .image-content', 'content/images', 'changeImages');
				break;

		// ------   Z O O M -----------
			
			//zoomIn press "z"
			case 122:
				if(zoom > maxZoom){ zoom = zoom }
				else{ zoom += zoomStep; }
				socket.emit("zoom", zoom);
				break;
			
			//zoomOut press "-"
			case 45:
				if(zoom < minZoom){ zoom = zoom; }
				else{ zoom -= zoomStep; }
				socket.emit("zoom", zoom);
				break;

		// ------   M O V E    I M A G E S -----------
		  //press "l" to move image on the right
			case 108:
				if(posX < maxX){
					posX += xStep;
					socket.emit("move", posX, posY);
	      }
				break;
			//press "j" to move image on the left
			case 106:
				if(posX >= minX){
					posX -= xStep;
					socket.emit("move", posX, posY);
				}
				break;
			//press "k" to move image down
			case 107:
				if(posY < maxY){
					posY += yStep;
					socket.emit("move", posX, posY);
				}
				break;
			//press "i" to move image up
			case 105:
				if(posY >= minY){
					posY -= yStep;
					socket.emit("move", posX, posY);
			}
			break;

		// ------   C H A N G E    F O N T  ------ 

			//change font-family
			case 99:
				countRegex ++;
				console.log(countRegex);
				if(countRegex >= 1){
      		$('p').wrapInTag({
					  tag: 'span',
					  class: 'change',
					  words: ['horreur']
					});
				}
				if (countRegex >= 2){
					$('p').wrapInTag({
					  tag: 'span',
					  class: 'change',
					  words: ['horreur', 'nuit']
					});
				}

				if (countRegex >= 3){
					$('p').wrapInTag({
					  tag: 'span',
					  class: 'change',
					  words: ['horreur', 'nuit', 'lit']
					});
				}
				if (countRegex >= 4){
					$text.find('.change').attr("class","dataface");
					countRegex = 0;
				}
				break;

		// ------   W O R D    S P A C I N G  ------ 
		 
		  //press "s" to add space between each words
			case 115:
				space += spacePlus;
				socket.emit('wordSpacing', space);
				break;
			
			//press "q" to decrease space between each words
			case 113:
				space -= spaceMoins;
		    socket.emit('wordSpacing', space);
				break;

		// ------   G E N E R A T E     P D F  ------ 
			
			//Press P and generate PDF
			case 112:
				var page = $('body').html();
				socket.emit('generate', page);
				break;
		}
		e.preventDefault(); // prevent the default action (scroll / move caret)
	});
	
}

function prevContent(element, dir, eventToSend){
	var $el = $(element);
	var dataIndex = $el.attr('data-index');
	var prevIndex = parseInt((dataIndex)-1);
	socket.emit(eventToSend, prevIndex, dir, element);
}

function nextContent(element, dir, eventToSend){
	var $el = $(element);
	var dataIndex = $el.attr('data-index');
	var nextIndex = (parseInt(dataIndex)+1);
	socket.emit(eventToSend, nextIndex, dir, element);
}

function onImagesData(file, index){
	// dataImages.push(images);
	// console.log(images);
	// addImages();
	// changeImages();
	// glitchImages();

	function glitchImages(){
		
		var clonecount =0;
		var $el = $('.page-wrapper .right .image-content');
   	
   	$(document).on('keypress',function(e){
			var code = e.keyCode;
			console.log(code);
			if(code == 110){
		  	clonecount ++;
		  	var randomPos = Math.random() * $el.find('img').height();
		  	var randomH = Math.random() * 100 + 10;
		  	var randomIndex = Math.floor(Math.random() * images.length);
				var randomFile = images[randomIndex];
		  	// console.log(randomPos);
		   	var $img = $el.clone();
		   	// console.log($img);
		   	if(clonecount > 10){
		   		$('.glitch').remove();
					clonecount = 0;
				} 
				else {
		  		$('.right .image-wrapper').prepend('<div class="image-content wrapper'+clonecount+' glitch"><img src="images/'+randomFile+'"/></div>'); 
		  		$('.wrapper'+clonecount).css({
		  			'top': randomPos+'px',
		  			'height':randomH+'px',
		  			'z-index':clonecount +2
		  		}).find('img').css({
		  			'position':'absolute',
		  			'top': -randomPos+'px'
		  		});
		  	}
		  }
	  });
	}

}

function gridDisplayer(){
	var grid = true;
	$(document).on('keypress',function(e){
		console.log(grid);
		if(e.keyCode == '119'){
			if(grid == true){
				$('.page').css('border', 'none');
				$('.page-wrapper').css('border', 'none');
				$('.page-wrapper .left').css('border', 'none');
				$('.page-wrapper .right').css('border', 'none');
				grid = false;
			}
			else{
				$('.page').css('border', '1px solid #000');
				$('.page-wrapper').css('border', '1px solid #E100B6');
				$('.page-wrapper .left').css('border-right', '1px solid #00E17B');
				$('.page-wrapper .right').css('border-left', '1px solid #00E17B');
				grid = true;
			}
		}
	});
}






