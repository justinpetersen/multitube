/*$('#messageInput').keypress(function (e) {
  if (e.keyCode == 13) {
    var name = $('#nameInput').val();
    var text = $('#messageInput').val();
    myDataRef.push({name: name, text: text});
    $('#messageInput').val('');
  }
});

myDataRef.on('child_added', function(snapshot) {
  var message = snapshot.val();
  displayChatMessage(message.name, message.text);
});*/

function MultiTube( ) {

  this.dataRef = null;
  this.userId = -1;

  this.init = function( ) {
	
	this.dataRef = new Firebase( 'https://multitube.firebaseio-demo.com/' );
	this.userId = this.getUserId( );
	
	console.log( this.userId );
	
  };

  this.getUserId = function( ) {

    var id = Math.floor( Math.random( ) * 100000000 );
    return id;

  };
	
}

$( document ).ready( function( ) {

  var multiTube = new MultiTube( );
  multiTube.init( );

});
