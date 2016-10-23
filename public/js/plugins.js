(function ( $ ) {
 
  $.fn.zoom = function( zoom ) {

    return this.css({
      'transform': 'scale('+zoom+')',
      'transform-origin': '0 0',
    });

  };

  $.fn.move = function( posX, posY ) {

    return this.css({
      'left': posX+'cm',
      'top':posY+'cm'
    });

  };

  $.fn.wordSpacing = function( space ) {

    return this.css('word-spacing', ''+space +'px');

  };
 
}( jQuery ));





// Go prev content
function prevContent(element, eventToSend){
  // get element class
  var dataIndex = element.index;
  var prevIndex = parseInt((dataIndex)-1);
  var folder = element.slugFolderName;
  var path = element.path;
  socket.emit(eventToSend, {newIndex:prevIndex, folder:folder, path:path});

}