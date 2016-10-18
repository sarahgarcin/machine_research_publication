(function ( $ ) {
 
    $.fn.zoom = function( zoom ) {

        return this.css('transform', 'scale('+zoom+')');

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