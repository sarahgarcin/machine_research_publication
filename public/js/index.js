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

socket.on('displayPageEvents', onDisplayPage);

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

socket.on('glitchEvents', function(clonecount, images, randomPos, randomH, randomIndex){

	var randomFile = images[randomIndex];

 	$('.right .image-wrapper').prepend('<div class="image-content wrapper'+clonecount+' glitch"><img src="images/'+randomFile+'"/></div>'); 
	$('.wrapper'+clonecount).css({
		'top': randomPos+'px',
		'height':randomH+'px',
		'z-index':clonecount +2
	}).find('img').css({
		'position':'absolute',
		'top': -randomPos+'px'
	});
});

socket.on('glitchRemEvents',function(){
	$('.glitch').remove();
});

socket.on('changeTextEvents', function(textArray, index, element){
	var $textEl = $(element);
	var newFile = textArray[index];
	console.log(index);
	if(index >= 0 && index < textArray.length){
		$textEl.attr('data-index', index);
		$textEl.html(converter.makeHtml(newFile));
	}
	else{
		$textEl.attr('data-index', textArray.length-1);
		var newFile = textArray[textArray.length-1];
		$textEl.html(converter.makeHtml(newFile));
	}
});

socket.on('changeImagesEvents', function(files, index, element){
	var $el = $(element);
	$el.each(function(){
		if(!$(this).hasClass('glitch')){
			if(index >= 0 && index < files.length){
				var newFile = files[index];
				$(this).attr('data-index', index);
				$(this).html('<img src="images/'+newFile+'">');
			}
			else{
				$(this).attr('data-index', files.length-1);
				var newFile = files[files.length-1];
				$(this).html('<img src="images/'+newFile+'">');
			}
		}
	});
});

socket.on('nbImages', function(countImg, clonecount){
	var $imageEl = $('.page-wrapper .right .image-content');
  var randomPos = Math.random() * $imageEl.find('img').height();
	var randomH = Math.random() * 100 + 10;
	var randomIndex = Math.floor(Math.random() * countImg);
	var $img = $imageEl.clone();
	
	socket.emit('glitch', clonecount, randomPos, randomH, randomIndex);
});

socket.on('changeFontEvents', function(wordsCount){
	$('p').wrapInTag({
	  tag: 'span',
	  class: 'change-font',
	  words: wordsCount
	});
});

socket.on('removeFontEvents', function(){
	$('p').find('.change-font').attr("class","normal-font");
});

socket.on('changeFontColorEvents', function(black){
	if(black == true){
		$('.text-content').addClass('black-color').removeClass('white-color');
    $('.small-text-content').addClass('black-color').removeClass('white-color');

  }
  else{
  	$('.text-content').addClass('white-color').removeClass('black-color');
    $('.small-text-content').addClass('white-color').removeClass('black-color');
  }
});

socket.on('removingBoders', function(){
	// $('.page').css('border', 'none');
	// $('.right').css('border', 'none');
	// setTimeout(function(){
	socket.emit('generate');
	// }, 100);
});

socket.on('pdfIsGenerated', function(){
	location.reload();
});


jQuery(document).ready(function($) {
	$(document).foundation();
	init();
	gridDisplayer();

});


function init(){
	
	// Z O O M  var
	var zoom = 1,
			minZoom = 0.3,
			maxZoom = 3,
			zoomStep = 0.1;

	// M O V E  var
	var posX = 0,
			posY= 0,
			maxX = 15,
			minX = -20,
			xStep = 0.5,
			maxY = 18,
			minY = -12,
			yStep = 0.5;

	// W O R D   S P A C I N G var
	var space= 0,
			spacePlus = 5,
			spaceMoins = 3;

	// G L I T C H  var
	var clonecount =0;

	// C H A N G E  F O N T   var
	var countRegex = 0;
	var arrayWords = ['froid', 'cire', 'frappe'];
	var wordsCount = [];

	// C H A N G E    C O N T E N T 
	var partCount = 0;

	// C H A N G E    F O N T    C O L O R
	var black = true;

	//Reset keypress
	reset();

	$(document).on('keypress', function(e){
		console.log(e.keyCode);
		var code = e.keyCode;

		switch(code){
		
		// ------   C H A N G E   C O N T E N T ---------

			// v2 press "o" to change content (go prev)
			case 111:
				if(partCount == 0){
					prevContent('.left .text-content', 'content/long', 'changeText');
				}
				if(partCount == 1){
					prevContent('.right .image-content', 'content/images', 'changeImages');
				}
				if(partCount == 2){
					prevContent('.right .small-text-content', 'content/short', 'changeText');
				}
				console.log(partCount);
				break;

			// v2 press "p" to go to next part to change
			case 112:
				if(partCount < 2){
					partCount ++;
				}
				else{ partCount = 0; }
				break;



		// ------   Z O O M -----------
			
			//zoomIn press "z"
			case 117:
				if(zoom > maxZoom){ zoom = zoom }
				else{ zoom += zoomStep; }
				socket.emit("zoom", zoom);
				break;
			
			//zoomOut press "-"
			case 32:
				if(zoom < minZoom){ zoom = zoom; }
				else{ zoom -= zoomStep; }
				socket.emit("zoom", zoom);
				break;

		// ------   M O V E    I M A G E S -----------
		  //press "l" to move image on the right
			case 113:
				if(posX < maxX){
					posX += xStep;
					socket.emit("move", posX, posY);
	      }
				break;
			//press "j" to move image on the left
			case 97:
				if(posX >= minX){
					posX -= xStep;
					socket.emit("move", posX, posY);
				}
				break;
			//press "k" to move image down
			case 119:
				if(posY < maxY){
					posY += yStep;
					socket.emit("move", posX, posY);
				}
				break;
			//press "i" to move image up
			case 115:
				if(posY >= minY){
					posY -= yStep;
					socket.emit("move", posX, posY);
			}
			break;

		// ------   G L I T C H    I M A G E S -----------
			// on "n" press glitch images
			case 105:
				clonecount ++;

		   	if(clonecount > 10){
		   		socket.emit('glitchRemove');
					clonecount = 0;
				} 
				else {
					socket.emit("countImages", clonecount);
		  	}
				break; 

		// ------   C H A N G E    F O N T  ------ 

			// "c" press -> change font-family 
			case 101:
				countRegex ++;
				if(countRegex <= arrayWords.length){
					for(var a =0; a<countRegex; a++){
						wordsCount.push(arrayWords[a]);
						console.log(arrayWords[a]);
					}
					socket.emit('changeFont', wordsCount);
				}
				else{
					socket.emit('removeFont');
					countRegex = 0;
					wordsCount = [];
				}
				break;

		// ------   W O R D    S P A C I N G  ------ 
		 
		  //press "s" to add space between each words
			case 121:
				space += spacePlus;
				socket.emit('wordSpacing', space);
				break;
			
			//press "q" to decrease space between each words
			case 114:
				space -= spaceMoins;
		    socket.emit('wordSpacing', space);
				break;

		// ------   G E N E R A T E     P D F  ------ 
			
			//Press T and generate PDF
			case 116:
				// var page = $('body').html();
				// $('.page').css('border', 'none');
				// $('.right').css('border', 'none');
				socket.emit('removeBorders');
				// socket.emit('generate');
				break;
		}
		e.preventDefault(); // prevent the default action (scroll / move caret)
	});

	// ------   C H A N G E    F O N T     C O L O R  ------
		// double keypress
		// press 'r' and 'y' or two black buttons in the same time
		var down = {};
		$(document).keydown(function(e) {
			down[e.keyCode] = true;
		}).keyup(function(e) {
			if (down[82] && down[89]) {
	      console.log('Double key Press');
	      if(black == true){
			    black = false;
			    socket.emit('changeFontColor', black);
			  }
			  else{
			    black = true;
			    socket.emit('changeFontColor', black);
			  }
	    }
	    down[e.keyCode] = false;
		});
	
}

function prevContent(element, dir, eventToSend){
	var $el = $(element);

	if($el.length > 1){
		$el.each(function(){
			if(!$(this).hasClass('glitch')){
				var dataIndex = $(this).attr('data-index');
				var prevIndex = parseInt((dataIndex)-1);
				socket.emit(eventToSend, prevIndex, dir, element);
			}
		});
	}
	else{
		var dataIndex = $el.attr('data-index');
		var prevIndex = parseInt((dataIndex)-1);
		socket.emit(eventToSend, prevIndex, dir, element);
	}

}

function onDisplayPage(data){

	// $('.page').css('border', '1px solid #000');
	// $('.right').css('border-left', '1px solid #000');

	// Content
	$('.left .text-content').html(converter.makeHtml(data.txtlong));
	$('.right .small-text-content').html(converter.makeHtml(data.txtshort));
	$('.right .image-content img').attr('src', 'images/'+data.image);

	// Zoom 
	$cell.css('transform', 'scale('+data.zoom+')');

	// ImagePos
	$cell.css({
		'left': data.posX+'cm',
		'top':data.posY+'cm',
	});

	// Word spacing
	$text.css('word-spacing', ''+data.space +'px'); 

	// change font
	if(data.fontwords.length != 0){
		$('p').wrapInTag({
		  tag: 'span',
		  class: 'change-font',
		  words: data.fontwords
		});
	}

	console.log('black '+data.black);
	// change font color
	if(data.black == true){
		$('.text-content').addClass('black-color').removeClass('white-color');
    $('.small-text-content').addClass('black-color').removeClass('white-color');

  }
  else{
  	$('.text-content').addClass('white-color').removeClass('black-color');
    $('.small-text-content').addClass('white-color').removeClass('black-color');
  }

	// glitch images
	if(data.imagesglitch.length !=0){
		// console.log(data.imagesglitch);
		for(var a=0; a<data.imagesglitch.length; a++){
			console.log(data.imagesglitch[a]);
			var glitch = data.imagesglitch[a];
			$('.right .image-wrapper').prepend('<div class="image-content wrapper'+glitch.count+' glitch"><img src="images/'+glitch.image+'"/></div>'); 
			$('.wrapper'+glitch.count).css({
				'top': glitch.pos+'px',
				'height':glitch.height+'px',
				'z-index':glitch.count +2
			}).find('img').css({
				'position':'absolute',
				'top': -glitch.pos+'px'
			});
		}
	}
	else{
		$('.glitch').remove();
	}

}

function reset(){
	// press o and p in the same time
	var down = {};
	$(document).keydown(function(e) {
		down[e.keyCode] = true;
	}).keyup(function(e) {
		if (down[111] && down[112]) {
      console.log('Double key Press');
      socket.emit('reset');
    }
    down[e.keyCode] = false;
	});
}


function gridDisplayer(){
	var grid = true;
	$(document).on('keypress',function(e){
		// console.log(grid);
		if(e.keyCode == '60'){
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

$.fn.wrapInTag = function(opts) {

  var tag = opts.tag, 
  words = opts.words || [],
  regex = RegExp(words.join('|'), 'gi'), // case insensitive
  classname = opts.class || 'none'
  replacement = '<'+ tag +' class="'+classname+'">$&</'+ tag +'>';

  return this.html(function() {
    return $(this).text().replace(regex, replacement);
  });
};






