//@CrossOrigin(origins = "http://localhost:4200")
//@GetMapping("/yourPath")

let redirect_uri ="http://127.0.0.1:5500/spotify.html"
let client_id="";
let clientsecret="";
let authorize="https://accounts.spotify.com/authorize"
const token = "https://accounts.spotify.com/api/token"
const DEVICES ="https://api.spotify.com/v1/me/player/devices"
var access_token= null

function onPageLoad(){
    client_id = localStorage.getItem("client_id")
    clientsecret=localStorage.getItem("clientsecret")
   if(window.location.search.length > 0){
        handleredirect()
    }
    else{
        access_token = localStorage.getItem("access_token")
        if(access_token == null){
            document.getElementById("tokensection").style.display = "block"
        }
        else{
            document.getElementById("devicesection").style.display= "block"
            getDevices()
        }
    }

}
function handleredirect(){
     let code = getCode()
     fetchaccesstoken(code)
     window.history.pushState("","",redirect_uri)// remove paramater from url
}
function fetchaccesstoken(code){
    let body = "grant_type=authorization_code";
    body += "&client_id=" + client_id;
    body += "&redirect_uri=" + encodeURI(redirect_uri);
    body += "&code=" + code
    body += "&clientsecret=" + clientsecret
    callouthapi(body)
}
 function callouthapi(body) {
   let xhr = new XMLHttpRequest()
   xhr.open("POST", token ,true);
   xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
   xhr.setRequestHeader("Authorization", "Basic " + btoa(client_id + ":" + clientsecret));
   xhr.send(body)
   xhr.onload = handleouthresponse

}
function handleouthresponse(){
    if(this.status  == 200){
        var data = JSON.parse(this.responseText)
        console.log(data)
        var data = JSON.parse(this.responseText)
        if(data.access_token != undefined){
            access_token = data.access_token
            localStorage.setItem("access_token", access_token)
        }
        if(data.refresh_token != undefined){
            refresh_token = data.refresh_token
            localStorage.setItem("refresh_token" , refresh_token)
            
       }
       onPageLoad()
    }
    else{
        console.log(this.responseText);
        alert(this.responseText)
    }
}

function getCode(){
    let code =null;
    const queryString = window.location.search
    if(queryString.length > 0){
        const urlparams = new URLSearchParams(queryString)
        code =urlparams.get("code")
    }
    return code
}



function getAOuth(){
    client_id=document.getElementById("client_id").value
    clientsecret=document.getElementById("clientsecret").value

   localStorage.setItem("client_id", client_id)
   localStorage.setItem("clientsecret", clientsecret)
   
   let url =authorize
   url += "?client_id=" + client_id;
   url += "&response_type=code";
   url += "&redirect_uri=" + encodeURI(redirect_uri);
   url += "&scope=user-read-private user-read-email user-read-playback-position user-read-recently-played  user-top-read user-modify-playback-state user-read-playback-state user-read-currently-playing playlist-read-collaborative playlist-modify-public playlist-read-private streaming user-library-modify user-library-read";
   //url += "&scope=user-read-private user-read-email user-read-playback-position user-read-recently-played  user-top-read user-modify-playback-state user-read-playback-state user-read-currently-playing playlist-read-collaborative playlist-modify-public playlist-read-private    ";
   url += "&show_dialog=true";
   window.location.href = url; //show spotify oauth screen it will take me to spotify Outh page 
}
 function getDevices(){
    callApi("GET",DEVICES ,null, handledeviceresponse)
 }
 function handledeviceresponse(){
    if(this.status == 200){
        var data = JSON.parse(this.responseText)
        console.log(data)
        removeAllItems("devices")
        data.devices.forEach(item => addevice(item))
    }
    else if(this.status == 401){
        refreshaccesstoken()
    }
    else{
        console.log(this.responseText)
        alert(this.responseText)
    }
 }
 function addevice(item){
    let node = document.createElement("option")
    node.value=item.id
    node.innerHTML=item.name
    document.getElementById("devices").appendChild(node)
 }
 function refreshaccesstoken(){
    refresh_token = localStorage.getItem("refresh_token")
    let body = "grant_type=refresh_token"
    body += "&refresh_token=" + refresh_token
    body += "&client_id=" + client_id
    callouthapi(body)
 }
 function callApi(method , url,body,callback){
    let xhr = new XMLHttpRequest()
    xhr.open(method, url ,true);
    //xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    //xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
    //hr.setRequestHeader('Access-Control-Allow-Headers', '*');
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + access_token);
    xhr.send(body)
    xhr.onload = callback
 }
 function removeAllItems(elementid){
    let node = document.getElementById(elementid)
    while(node.firstChild){
        node.removeChild(node.firstchild)
    }
 }