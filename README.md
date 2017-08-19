# autodis
Allows mobile clients to auto-discover desktop servers.

## Server Setup
* cd autodis/autodis-server
* npm install
* npm start

## Client Setup
* npm install -g cordova
* cd autodis/autodis-client
* bower install
* cordova prepare
* cordova run android (or ios)

### Client Methods
AUTODIS.Init(); - start the auto discovery process

### Client Events
* AUTODISSuccess - custom event with the following fields:
** evt.detail.serverName
** evt.detail.serverIp
** evt.detail.serverPort

* AUTODISError - custom event with the following fields:
** evt.detail.errCode
** evt.detail.msg
