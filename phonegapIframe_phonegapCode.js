function successHandler (result) {
  alert('result = ' + result);
}
function errorHandler (error) {
  alert('error = ' + error);
}

function registerForPushNotification() {
  alert('registerForPushNotification for cordova.platformId:' + cordova.platformId);
  var pushNotification = window.plugins.pushNotification;
  alert('pushNotification=' + pushNotification + " pushNotification.register=" + pushNotification.register);
  if ( cordova.platformId == 'android' || cordova.platformId == 'Android' || cordova.platformId == "amazon-fireos" ){
    pushNotification.register(
      successHandler,
      errorHandler,
      {
          "senderID":"24803504516",
          "ecb":"onNotification"
      });
  } else {
    pushNotification.register(
      tokenHandler,
      errorHandler,
      {
          "badge":"true",
          "sound":"true",
          "alert":"true",
          "ecb":"onNotificationAPN"
      });
  }
}

// iOS
function onNotificationAPN(event) {
  alert('RECEIVED:' + JSON.stringify(event));
  if ( event.alert )
  {
      navigator.notification.alert(event.alert);
  }

  if ( event.sound )
  {
      var snd = new Media(event.sound);
      snd.play();
  }

  if ( event.badge )
  {
      window.plugins.pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
  }
}

function tokenHandler(result) {
  // Your iOS push server needs to know the token before it can push to this device
  // here is where you might want to send it the token for later use.
  alert('device token = ' + result);
  document.getElementById("regIdTextarea").value = result;
}

// Android and Amazon Fire OS
function onNotification(e) {
  alert('RECEIVED:' + JSON.stringify(e));

  switch( e.event )
  {
    case 'registered':
      if ( e.regid.length > 0 )
      {
        // Your GCM push server needs to know the regID before it can push to this device
        alert('REGID:' + e.regid);
        document.getElementById("regIdTextarea").value = e.regid;

        window.regid = e.regid;
      }
    break;

    case 'message':
      // if this flag is set, this notification happened while we were in the foreground.
      // you might want to play a sound to get the user's attention, throw up a dialog, etc.
      // e.foreground , e.coldstart
      // e.soundname || e.payload.sound
      // e.payload.message
      // e.payload.msgcnt
      // e.payload.timeStamp
    break;

    case 'error':
      // e.msg
    break;
  }
}

function sendMessageToPlatform(message) {
  alert("sendMessageToPlatform:" + JSON.stringify(message));
  //window.document.getElementById("platform_iframe").contentWindow.postMessage(message, "*");
}
function sendToken(token, error) {
  sendMessageToPlatform({token: token, error: error});
  registerForPushNotification();
}
function fbLoginSuccess(userData) {
    facebookConnectPlugin.getAccessToken(function(token) {
        sendToken(token, "");
    }, function(error) {
        sendToken("", error);
    });
}

function onDeviceReady() {
    facebookConnectPlugin.login(["public_profile"],
        fbLoginSuccess,
        function (error) { sendToken("", error); }
    );
}
document.addEventListener("deviceready", onDeviceReady, false);
