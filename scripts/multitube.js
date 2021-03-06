function MultiTube( ) {

  this.MIN_USERS = 1;
  this.HIT_TOLERANCE = 100;

  this.buffered = false;
  this.mouseX = 0;
  this.mouseY = 0;
  this.usersListDataRef = null;
  this.userDataRef = null;
  this.userId = -1;
  this.cursors = {};
  this.youTubePlayer = null;
  this.playedExplosion = false;

  this.hitTargets = [
    {
	  id: 'explosion',
      x: 600,
      y: 360,
      startTime: 2,
      endTime: 3,
      width: 128,
      height: 128,
      duration: 800,
      played: false
    },
    {
	  id: 'bird',
      x: 735,
      y: 330,
      startTime: 9,
      endTime: 10,
      width: 132,
      height: 89,
      duration: 800,
      played: false
    },
    {
	  id: 'bird',
      x: 610,
      y: 140,
      startTime: 15,
      endTime: 16,
      width: 132,
      height: 89,
      duration: 800,
      played: false
    }
  ];

  this.onYouTubePlayerReady = function( playerId ) {
	
	console.log( '\nonYouTubePlayerReady' );
	
    this.youTubePlayer = document.getElementById("myytplayer");
    this.youTubePlayer.addEventListener("onStateChange", "onYouTubePlayerStateChange");
	
  };

  this.onYouTubePlayerStateChange = function( state ) {

    console.log( '\nonYouTubePlayerStateChange( ' + state + ' )' );

    switch ( state ) {
	
      case -1:
	    console.log( 'unstarted' );
        break;
      case 0:
		console.log( 'ended' );
        break;
      case 1:
		console.log( 'playing' );
		this.setBuffered( true );
        break;
      case 2:
		console.log( 'paused' );
		console.log( 'time: ' + this.youTubePlayer.getCurrentTime( ) + ', x: ' + this.mouseX + ', y: ' + this.mouseY );
        break;
      case 3:
		console.log( 'buffering' );
		this.setBuffered( false );
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
	
	var users = snapshot.val( );
	this.renderCursors( users );
	this.syncPlayback( users );
	this.checkHitTargets( users );
	
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

	this.usersListDataRef = new Firebase( 'https://multitube1.firebaseio.com/users' );
	this.usersListDataRef.on( 'value', $.proxy( this.onUserUpdate, this ) );
	
	this.broadcastStatus( );
	
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
	
	$( '#' + user.id ).offset( { left: user.x - 16, top: user.y - 16 } );
	
  };

  this.syncPlayback = function ( users ) {
	
    console.log( '\nsyncPlayback( )' );
	if ( this.youTubePlayer == null ) {
		return;
	}
	
	var userCount = 0;
	var allUsersBuffered = true;
	for ( id in users ) {
		userCount++;
		user = users[ id ];
		console.log( '  syncPlayback: ' + id + ': buffered: ' + user.buffered + ', x: ' + user.x + ', y: ' + user.y );
		if ( !user.buffered ) {
			allUsersBuffered = false;
			break;
		}
	}
	
	console.log( '  syncPlayback: userCount: ' + userCount + ', allUsersBuffered: ' + allUsersBuffered );
	if ( userCount >= this.MIN_USERS && allUsersBuffered ) {
		this.youTubePlayer.playVideo( );
	} else if ( this.youTubePlayer.getPlayerState( ) == 1 ){
		this.youTubePlayer.pauseVideo( );
	}
	
  };

  this.checkHitTargets = function( users ) {

    if ( this.youTubePlayer == null ) {
      return;
    }

    for ( var i = 0; i < this.hitTargets.length; i++ ) {

      var data = this.hitTargets[ i ];
      if ( this.testHit( users, data ) ) {
	    this.playAnimation( data );
        this.hitTargets[ i ].played = true;
      }

    }

  };

  this.testHit = function( users, data ) {

    console.log( '\ntestMouseHit( )' );
    console.log( '  currentTime: ' + this.youTubePlayer.getCurrentTime( ) );

    var allUsersMouseHit = false;
    if ( this.youTubePlayer.getCurrentTime( ) > data.startTime && this.youTubePlayer.getCurrentTime( ) < data.endTime && !data.played ) {
      allUsersMouseHit = true;
      for ( id in users ) {
        user = users[ id ];
		console.log( '  testMouseHit: ' + id + ': buffered: ' + user.buffered + ', x: ' + user.x + ', y: ' + user.y );
        if ( Math.abs( user.x - data.x ) > this.HIT_TOLERANCE || Math.abs( user.y - data.y ) > this.HIT_TOLERANCE ) {
          allUsersMouseHit = false;
          break;
        }
	  }
    }

    return allUsersMouseHit;
	
  };

  this.playAnimation = function( data ) {
	
    // this.playedExplosion = true;
    var explosion = $( "<div class='animation' id='" + data.id + "'><img src='images/" + data.id + ".gif' width='" + data.width + "' height='" + data.height + "' /></div>" );
    $( 'body' ).append( explosion );
    $( '#' + data.id ).offset( { left: data.x - data.width / 2, top: data.y - data.height / 2 } );
    setTimeout( $.proxy( this.stopAnimation, this, data.id ), data.duration );

  };

  this.stopAnimation = function( id ) {

    $( '#' + id ).remove( );
	
  };

  this.createCursor = function( user ) {
	
	// do not render a crosshair for yourself
	if ( user.id == this.userId ) {
		return;
	}
	
	var crosshair = $( "<div class='crosshair' id='" + user.id + "'><img src='images/crosshair.png' width='32' height='32' /></div>" );
	$( 'body' ).append( crosshair );
	
    this.cursors[ user.id ] = true;

  };

  this.initMouseEvents = function( ) {

    $( 'body' ).mousemove( $.proxy( this.onMouseMove, this ) );

  };

  this.getUserId = function( ) {

    if ( $.cookie('userId') ) {
      return $.cookie('userId');
    } else {
	    var id = Math.floor( Math.random( ) * 100000000 );
		$.cookie('userId', id);
	    return id;
	}

  };

  this.setBuffered = function( b ) {
	
	console.log( 'setBuffered( ' + b + ' )' );

    this.buffered = b;
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