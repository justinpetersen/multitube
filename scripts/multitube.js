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

  this.usersListDataRef = null;
  this.userDataRef = null;
  this.userId = -1;
  this.cursors = {};
  this.youTubePlayer = null;

  this.onYouTubePlayerReady = function( playerId ) {
	
	console.log( 'onYouTubePlayerReady' );
	
    this.initYouTubePlayer( playerId );
	
  };

  this.onYouTubePlayerStateChange = function( state ) {
	
	console.log( state );
	
  };

  this.onMouseMove = function( event ) {

    this.setMousePosition( event.pageX, event.pageY );

  };

  this.onUserUpdate = function( snapshot ) {
	
	// console.log( snapshot.val( ) );
	
	this.renderCursors( snapshot.val( ) )
	
  };

  this.init = function( ) {
	
	this.registerUser( );
	this.initMouseEvents( );
    onYouTubePlayerReady = $.proxy( this.onYouTubePlayerReady, this );
	onYouTubePlayerStateChange = $.proxy( this.onYouTubePlayerStateChange, this );
	
  };

  this.initYouTubePlayer = function( playerId ) {
    
	console.log( 'initYouTubePlayer( ' + playerId + ' )' );
    // this.youTubePlayer = $( playerId );
    this.youTubePlayer = document.getElementById( playerId );
	console.log( this.youTubePlayer );
    this.youTubePlayer.addEventListener("onStateChange", "onYouTubePlayerStateChange");

  };

  this.registerUser = function( ) {

	this.userId = this.getUserId( );
	this.userDataRef = new Firebase( 'https://multitube1.firebaseio.com/users/' + this.userId );
	this.userDataRef.set( { id: this.userId } );

	this.usersListDataRef = new Firebase( 'https://multitube1.firebaseio.com/users' );
	this.usersListDataRef.on( 'value', $.proxy( this.onUserUpdate, this ) );
	
  };

  this.renderCursors = function( users ) {
	
	var user;
	for ( id in users ) {
		user = users[ id ];
		this.renderCursor( user );
	}
	
  };

  this.renderCursor = function( user ) {
	
	if ( !this.cursors[ user.id ] ) {
		this.createCursor( user );
	}
	
	$( '#' + user.id ).animate( { left: user.x - 16, top: user.y - 16 }, { duration: 100, queue: false } );
	
  };

  this.createCursor = function ( user ) {
	
	// do not render a crosshair for yourself
	if ( user.id == this.userId ) {
		return;
	}
	
	var crosshair = $( "<div class='crosshair' id='" + user.id + "'><img src='images/crosshair.png' width='32' height='32' /></div>" );
	$( "body" ).append( crosshair );
	
    this.cursors[ user.id ] = true;

  };

  this.initMouseEvents = function( ) {

    $( 'body' ).mousemove( $.proxy( this.onMouseMove, this ) );

  };

  this.getUserId = function( ) {

    var id = Math.floor( Math.random( ) * 100000000 );
    return id;

  };

  this.setMousePosition = function( x, y ) {

    // console.log( this.userId + ': ' + x + ', ' + y );
    // console.log( 'userDataRef: ' + this.userDataRef );

    this.userDataRef.set( { id: this.userId, x: x, y: y } );

  };
	
}

$( document ).ready( function( ) {

  var multiTube = new MultiTube( );
  multiTube.init( );

});

/*onYouTubePlayerStateChange = function( state ) {

  console.log( 'onYouTubePlayerStateChange( ' + state + ' )' );

};*/