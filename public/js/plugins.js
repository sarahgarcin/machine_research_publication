(function ( $ ) {
 
  $.fn.zoom = function( zoom ) {

    return this.css('transform', 'scale('+zoom+')');

  };

  $.fn.move = function( posX, posY ) {

    return this.css({
      'left': posX+'cm',
      'top':posY+'cm'
    });

  };
 
}( jQuery ));


function zoomIn(zoom, maxZoom, zoomStep){
  if(zoom > maxZoom){zoom = zoom;}
  else{ zoom += zoomStep; }
  return zoom;
}

function zoomOut(zoom, minZoom, zoomStep){
  if(zoom < minZoom) zoom = zoom; 
  else zoom -= zoomStep; 
  return zoom;
}


// Go prev content
function prevContent(element, dir, eventToSend){
  var $el = element;
  // get element class
  var elementClass = '.'+element.attr('class').toString().split(' ')[0];
  var dataIndex = $el.attr('data-index');
  var prevIndex = parseInt((dataIndex)-1);

  socket.emit(eventToSend, prevIndex, dir, elementClass);

}