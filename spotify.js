//@CrossOrigin(origins = "http://localhost:4200")
//@GetMapping("/yourPath")
var currentplaylist = ""
let redirect_uri ="http://127.0.0.1:5500/spotify.html"
let client_id="";
let clientsecret="";
let authorize="https://accounts.spotify.com/authorize"
const token = "https://accounts.spotify.com/api/token"
const DEVICES ="https://api.spotify.com/v1/me/player/devices"
const CURRENT = "https://api.spotify.com/v1/me/player/currently-playing"
const TOPER = "https://api.spotify.com/v1/me/top/tracks"
const RECENT ="https://api.spotify.com/v1/me/player/recently-played"
//const LIB = "";
const PLAYER ="https://api.spotify.com/v1/me/player"
const PLAYLIST ="https://api.spotify.com/v1/me/playlists"
let TRACKS ="https://api.spotify.com/v1/playlists/{{PlaylistId}}/tracks"
const PREVIOUS = "https://api.spotify.com/v1/me/player/previous"
const PLAY ="https://api.spotify.com/v1/me/player/play"
const PAUSE ="https://api.spotify.com/v1/me/player/pause"
const NEXT = "https://api.spotify.com/v1/me/player/next"
const SHUFFLE = "https://api.spotify.com/v1/me/player/shuffle";

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
            getplaying()
            playlist()
            currentlyplaying()
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
function mytracks(){
    var pid = document.getElementById("player").value
    console.log(pid)
    if(pid.length > 0){
       var url = TRACKS.replace("{{PlaylistId}}",pid)
       //console.log(pid)
        console.log(TRACKS)
        console.log(url)
        callApi("GET",url,null,handletrackresponse)
    }
}
function handletrackresponse(){
     if(this.status == 200){
        var data =JSON.parse(this.responseText)
        console.log(data)
        //console.log(data.items[0].track.name)
        removeAllItems("track")
        data.items.forEach(item => 
            tracklist(item))
     }else if(this.status == 201){
        refreshaccesstoken
     }else{
        console.log(this.responseText)
        alert(this.responseText)
     }

}
function tracklist(item){
    let node = document.createElement("option")
    node.value=item.track.id
    node.innerHTML=item.track.name
    document.getElementById("track").appendChild(node)
}
function playlist(){
    callApi("GET",PLAYLIST,null,handleplaylist)
}
function recplay(){
    callApi("GET",RECENT, null, handlerecent)
}
function topread(){
    callApi("GET", TOPER,null,handletop)
}
 function getDevices(){
    callApi("GET",DEVICES ,null, handledeviceresponse)
 }
 function getplaying(){
    callApi("GET",CURRENT,null,handleplaying)
 }
 function handleplaylist(){
    if(this.status == 200){
        var data = JSON.parse(this.responseText)
        //console.log(data)
        //console.log(data.items)
        removeAllItems("player");
       data.items.forEach(item =>
        //console.log(item),
        addplaylists(item)
       )
     document.getElementById("player").value=currentplaylist
     console.log(currentplaylist)
    }else if(this.status == 401){
        refreshaccesstoken
    }else{
        console.log(this.responseText);
        alert(this.responseText)
    }
 }
 function addplaylists(item){
    //console.log(item)
    var node= document.createElement("option");
    node.value= item.id
    node.innerHTML=item.name
   // console.log(node.value)
    document.getElementById("player").appendChild(node)
 }
 function handlerecent(){
    if(this.status == 200){
        var data = JSON.parse(this.responseText)
        console.log(data)
        removeAllItems("recent")
        data.items.forEach(item =>
            ayee(item),
            //console.log(item.track.name)
            //document.getElementById("recent").value=item.track.name
           )
           //document.getElementById("recent").value=currentplaylist
    }else if(this.status ==401){
        refreshaccesstoken
    }else{
        console.log(this.responseText)
        alert(this.responseText)
    } 
 }
 //unit test area 
 function ayee(item){
    let node = document.createElement("option")
    console.log(node)
    node.value=item.track.name
    node.innerHTML=item.track.name
    document.getElementById("recent").appendChild(node)
 }
 function handletop(){
    if(this.status == 200){
        var  data = JSON.parse(this.responseText);
        console.log(data)
        if(data.item != null){
            //document.getElementById('play1').src=data.items[0].track.album.images[0].url
        }
    }else if(this.status == 401){
        refreshaccesstoken()
    }else{
        console.log(this.responseText)
        alert(this.responseText)
    }
 }
 function handleplaying(){
    if(this.status == 200){
        var data = JSON.parse(this.responseText)
        console.log(data)
        removeAllItems("playing")
        //console.log(data.devices)
       data.devices.forEach(item => play(item))
    }else if(this.status == 401){
        refreshaccesstoken()
    }else{
        console.log(this.responseText)
        alert(this.responseText)
    }
 }
 /*
 function play(item){
    let node = document.createElement("option")
    node.value=item.id
    node.innerHTML=item.currently_playing_type
    document.getElementById("playing")
 }
 */
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
        node.removeChild(node.firstChild)
    }
 }
 function deviceid(){
    return document.getElementById("devices").value;
 }
 function  shuffle(){
    callApi("PUT",SHUFFLE + "?state=true&device_id=" + deviceid() ,null,handleplayingactivity)
    play()
 }
 function previous(){
    callApi("POST", PREVIOUS + "?device_id=" + deviceid(),null, handleplayingactivity)
 }
 function next(){
    callApi("POST",NEXT + "?device_id=" + deviceid(),null,handleplayingactivity)
 }
 function pause(){
    callApi("PUT", PAUSE + "?device_id" + deviceid(), null , handleplayingactivity)
 }
 function handleplayingactivity(){
    if(this.status == 200){
        var data = JSON.parse(this.responseText)
        //console.log(data);
         currentlyplaying
    }else if(this.status == 204){
        currentlyplaying
    }else if(this.status == 401){
        refreshaccesstoken
    }else{
        console.log(this.responseText)
        alert(this.responseText)
    }
 }
 function currentlyplaying(){
    callApi("GET" ,PLAYER + "?market=US", null, handlecurrentlyplaying)
 }
 function handlecurrentlyplaying(){
    if(this.status == 200){
        var data = JSON.parse(this.responseText)
        console.log(data);
        if(data.item != null){
            document.getElementById("image").src=data.item.album.images[0].url
            document.getElementById("tracktitle").innerHTML=data.item.name
            document.getElementById("trackartist").innerHTML=data.item.artists[0].name
        }
        if(data.context != null){
             currentplaylist = data.context.uri;
             //console.log(currentplaylist)
            currentplaylist = currentplaylist.substring(currentplaylist.lastIndexOf(":") + 1, currentplaylist.length)
           // console.log(currentplaylist)
            document.getElementById("player").value=currentplaylist
        }
        if(data.device != null){
            currentdevice =data.device.id
            console.log(data.device)
            document.getElementById("devices").value = currentdevice
        }
    }else if(this.status == 401){
        refreshaccesstoken
    }else{
        console.log(this.responseText)
        alert(this.responseText)
    }
 }
 function play(){
    //console.log(currentplaylist)
    let playlistid= document.getElementById("player").value
    let tracks = document.getElementById("track").value
    let album = document.getElementById("album").value
    console.log(album)
    let body ={}
    if(album.length > 0){
        body.context_uri = album
        console.log(body.context_uri)
    }else{
    body.context_uri= "spotify:playlist:" + playlistid
    }
    body.offset = {};
    body.offset.position = tracks.length > 0 ? Number(tracks) : 0;
    body.offset.position_ms = 0;
    callApi("PUT",PLAY +"?device_id=" + deviceid(),JSON.stringify(body), handleplayingactivity)
 }
 