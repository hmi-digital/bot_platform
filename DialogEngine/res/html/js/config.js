/* ==========================
Config JS
=================== */
// Set Idle Interval time

var idlleIntervalTime = 90; // 10 = 10 sec

/*--- Set Config IP -------------*/
const locationUrl1 = window.location.origin;
location1 = locationUrl1 + "/api/v2/bot"; // if not set in login ip configuration

users_list = ["Dummy","John","Gus Holmes","Sila Orr","Aubrey Wright","Sebastian Mcculloch","Cordelia Sharp","Kodi Reynolds","Homer Dixon","Opal Hansen"];

//Few Global variable 
var idleTime = 0;
var cardsFlag = false;
var loginDone = false;

// If Polling require only once in idle scenario set false. 
var pollingOnlyOnceInIdle = false; //default true

// check if socket base or httpbase
let isWebSocketBase; //= true // if you want set default as websocket base.
let isHttpBase;
