/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var app = {
    
    chat: null,
    send: null,
    errdiv: null,
    
    // Application Constructor
    initialize: function() {
      this.chat = document.querySelector('.chat');
      this.send = document.querySelector('#send-message');
      this.errdiv = document.querySelector('#errordiv');
      
      document.addEventListener('AUTODISSuccess', this.adSuccess.bind(this), false);
      document.addEventListener('AUTODISError', this.adError.bind(this), false);  
      document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
      if (id == 'deviceready')
      {
        this.tryAutoDis();
      }
    },
    
    tryAutoDis: function() {
      this.chat.innerHTML = '<p>Searching for servers:</p>';
      this.chat.setAttribute('style', 'display:block;');
      this.send.setAttribute('style', 'display:none;');
      this.errdiv.setAttribute('style', 'display:none;');
      if (device.platform == 'Android' || device.platform == 'iOS') {
        AUTODIS.Init();
      }
    },
    
    tryFChat: function(evt) {
      this.chat.innerHTML = '';
      this.send.setAttribute('style', 'display:block;');
      this.send.setAttribute('style', 'display:block;');
      this.errdiv.setAttribute('style', 'display:none;');
      FCHAT.Init(evt.target.dataset.serverip, evt.target.dataset.serverport);
    },
    
    adSuccess: function(evt) {
      this.errdiv.innerHTML = '';
      this.send.setAttribute('style', 'display:block;');
      this.send.setAttribute('style', 'display:none;');
      this.errdiv.setAttribute('style', 'display:none;');
      // display servers, let user choose
      this.chat.insertAdjacentHTML('beforeEnd', '<p class="serverlisting">' + evt.detail.serverName + ' <button class="connect" data-serverip="' + evt.detail.serverIp + '" data-serverport="' + evt.detail.serverPort + '">Connect</button></p>');  
      document.querySelector('.connect').addEventListener('click', this.tryFChat.bind(this), false);
    },

    adError: function(evt) {
      this.chat.innerHTML = '';
      this.chat.setAttribute('style', 'display:none;');
      this.send.setAttribute('style', 'display:none;');
      this.errdiv.setAttribute('style', 'display:block;');
      
      switch (evt.detail.errCode) {
      case 'noResponse':
      case 'noWifi':
        var errorString = '<div class="errmsg">' + evt.detail.msg + '</div><button id="retry">Retry</button>';
        this.errdiv.innerHTML = errorString;
        document.querySelector('#retry').addEventListener('click', this.tryAutoDis.bind(this), false);
    	  break;
    	default:
    	  var errorString = '<div class="errmsg">' + evt.detail.errCode + ': ' + evt.detail.msg + '</div>';
        this.errdiv.innerHTML = errorString;
    	  break;
      }
    }

};

app.initialize();
