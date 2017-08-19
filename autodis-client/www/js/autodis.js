AUTODIS = {

  // this port MUST match the broadcast port on the server
  bcastPort: 6401,
  socketId: null,
  responseReceived: false,
  responseTimeout: null,

  Init: function() {
    AUTODIS.ConfirmWifi();
  },

  // Verify that device is on wifi
  ConfirmWifi: function() {
    networkinterface.getWiFiIPAddress(
      function(ip, subnet) { 
        AUTODIS.FindServer(ip);
      }, 
      function(err) {         
        var wifiErrorEvent = new CustomEvent('AUTODISError', {
      	  detail: {
      	    errCode: 'noWifi',
      		  msg: 'No wifi connection found.'
      	  }
        });
        document.dispatchEvent(wifiErrorEvent);
      }
    );
  },

  FindServer: function (myAddress) {
    // Get ip from server via broadcast and pass to feathers app
    chrome.sockets.udp.create(function(createInfo){
      AUTODIS.socketId = createInfo.socketId;

      chrome.sockets.udp.setBroadcast(AUTODIS.socketId, true, function(result){
        // Show error if setBroadcast fails
        if (result) {
          var errorEvent = new CustomEvent('AUTODISError', {
            detail: {
              errCode: 'setBroadcastError',
              msg: 'Error setting udp to broadcast mode.'
            }
          });
          document.dispatchEvent(errorEvent);
        }

        chrome.sockets.udp.bind(AUTODIS.socketId, myAddress, 0, function(result) {
          // Show error if bind fails
          if (result) {
            var errorEvent = new CustomEvent('AUTODISError', {
              detail: {
                errCode: 'portBindError',
                msg: 'Error binding to udp port.'
              }
            });
            document.dispatchEvent(errorEvent);
          }

          chrome.sockets.udp.getInfo(AUTODIS.socketId, function(socketInfo) {
            var dataObj = {};
            dataObj.msg = 'spd-chat-server-ip-request';
            var data = AUTODIS.json2ab(dataObj);
            chrome.sockets.udp.send(AUTODIS.socketId, data, '255.255.255.255', AUTODIS.bcastPort, function(result) {
              chrome.sockets.udp.onReceive.addListener(AUTODIS.UDPReceiveListener);
              chrome.sockets.udp.onReceiveError.addListener(AUTODIS.UDPErrorListener);
              //setTimeout to send error if no answer in 5 seconds
              AUTODIS.responseTimeout = setTimeout(function() {
                if (!AUTODIS.responseReceived) {
                  var errorEvent = new CustomEvent('AUTODISError', {
                    detail: {
                      errCode: 'noResponse',
                      msg: 'There has been no response received from any server.'
                    }
                  });
                  document.dispatchEvent(errorEvent);
                }
              }, 5000);
            });
          });
        }); 
      });
    });
  },

  UDPReceiveListener: function (info) {
    var dataObj = AUTODIS.ab2json(info.data);
    chrome.sockets.udp.close(AUTODIS.socketId);
    if (dataObj.msg == 'spd-chat-server-ip') {
      AUTODIS.responseReceived = true;
      var successEvent = new CustomEvent('AUTODISSuccess', {
        detail: {
          serverIp: dataObj.serverIp,
          serverPort: dataObj.serverPort,
          serverName: dataObj.serverName
        }
      });
      document.dispatchEvent(successEvent);
    }
  },

  UDPErrorListener: function(info) {
    var errorEvent = new CustomEvent('AUTODISError', {
      detail: {
        errCode: 'UDPError',
        msg: 'Error from udp listener: ' + info.resultCode
      }
    });
    document.dispatchEvent(errorEvent);
  },

  ab2json: function(buf) {
    var data = String.fromCharCode.apply(null, new Uint16Array(buf));
    return JSON.parse(data);
  },

  json2ab: function(jsonObj) {
    var str = JSON.stringify(jsonObj);
    var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=str.length; i<strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }

}
