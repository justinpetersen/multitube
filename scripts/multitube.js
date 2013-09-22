function MultiTube( ) {

  this.buffered = false;
  this.mouseX = 0;
  this.mouseY = 0;
  this.usersListDataRef = null;
  this.userDataRef = null;
  this.userId = -1;
  this.cursors = {};
  this.youTubePlayer = null;

  this.onYouTubePlayerReady = function( playerId ) {
	
	// console.log( 'onYouTubePlayerReady' );
	
    this.youTubePlayer = document.getElementById("myytplayer");
    this.youTubePlayer.addEventListener("onStateChange", "onYouTubePlayerStateChange");
	
  };

  this.onYouTubePlayerStateChange = function( state ) {

    console.log( 'onYouTubePlayerStateChange( ' + state + ' )' );

    switch ( state ) {
	
      case -1:
	    console.log( 'unstarted' );
        break;
      case 0:
		console.log( 'ended' );
        break;
      case 1:
		console.log( 'playing' );
		this.setBuffered( );
        break;
      case 2:
		console.log( 'paused' );
        break;
      case 3:
		console.log( 'buffering' );
	    break;
      case 5:
		console.log( 'video queued' );
	    break;
	}
	
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
	this.initYouTubePlayer( );
	
  };

  this.initYouTubePlayer = function( playerId ) {
    
    onYouTubePlayerReady = $.proxy( this.onYouTubePlayerReady, this );
	onYouTubePlayerStateChange = $.proxy( this.onYouTubePlayerStateChange, this );
	
    var params = { allowScriptAccess: "always" };
    var atts = { id: "myytplayer" };
    swfobject.embedSWF("http://www.youtube.com/v/zuzaxlddWbk?autoplay=1&controls=0&enablejsapi=1&rel=0&showinfo=0&version=3&playerapiid=multitube",
                       "ytapiplayer", "1280", "720", "8", null, null, params, atts);

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

  this.setBuffered = function( ) {

    this.buffered = true;
	this.broadcastStatus( );

  };

  this.setMousePosition = function( x, y ) {
	
	this.mouseX = x;
	this.mouseY = y;
	this.broadcastStatus( );
	
  };

  this.broadcastStatus = function( ) {

    // console.log( this.userId + ': ' + x + ', ' + y );
    // console.log( 'userDataRef: ' + this.userDataRef );
	
	this.userDataRef.set( { id: this.userId, x: this.mouseX, y: this.mouseY, buffered: this.buffered } );

  };
	
}

$( document ).ready( function( ) {

  var multiTube = new MultiTube( );
  multiTube.init( );

});