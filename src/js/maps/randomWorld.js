let panorama;
var map;
var overlay = document.getElementById("overlay");
var ui = document.getElementById("ui");
var guess = document.getElementById("guess");
var guessCont = document.getElementById("button-wrapper");
var guessbtn = document.getElementById("guess-btn");
var completeDiv = document.getElementById("completeLevel");
var next = document.getElementById("next");
var tools = document.getElementById("tools");
var playerScore = 0;
var distanceScore = 5000;
var round = 1;
document.getElementById("mapname").innerHTML = "World";

var currentCordsLat, currentCordsLng;
function checkDistance() {
  var lat1 = guessMarker.position.lat();
  var lng1 = guessMarker.position.lng();
  var lat2 = currentCordsLat;
  var lng2 = currentCordsLng;
  var R = 6371;
  var dLat = deg2rad(lat2 - lat1);
  var dLng = deg2rad(lng2 - lng1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var distance = R * c;

  return distance;
}
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
function levelComplete() {
  guess.style.height = "100vh";
  guess.style.width = "100vw";
  guess.style.margin = "0";
  tools.style.display = "none";
  guessbtn.style.display = "none";
  completeDiv.style.display = "flex";
}
function showHide() {
  var x = document.getElementById("map");
  var tools = document.getElementById("tools");
  var show = document.getElementById("show");
  if (x.style.display === "none") {
    x.style.display = "block";
    tools.style.display = "flex";
    show.style.display = "none";
  } else {
    x.style.display = "none";
    tools.style.display = "none";
    show.style.display = "block";
  }
}
function defaultSetting() {
  var tools = document.getElementById("tools");
  var show = document.getElementById("show");
  show.style.display = "none";
  ui.style.display = "none";
  tools.style.display = "flex";
  guess.style.height = "40vh";
  guess.style.width = "35vw";
  guessbtn.style.display = "block";
  guessCont.style.display = "none";
  guess.style.margin = "3.5%";
  overlay.style.display = "flex";
  completeDiv.style.display = "none";
}
function playagain() {
  distanceScore = 5000;
  next.value = "Next";
  next.onclick = function () {
    showHide();
  };
  played = false;
  defaultSetting();
  initMap();
}
played = false;

function generateRandomPoint(callback) {
  var sv = new google.maps.StreetViewService();
  sv.getPanoramaByLocation(
    new google.maps.LatLng(Math.random() * 180 - 90, Math.random() * 360 - 180),
    6371,
    callback
  );
}
var marked = false;
function initMap(data, status) {
  if (round <= 5) {
    document.getElementById("round").innerHTML = "" + round + "/5";
    if (status == google.maps.StreetViewStatus.OK) {
      currentCordsLat = data.location.latLng.lat();
      currentCordsLng = data.location.latLng.lng();
      overlay.style.display = "none";
      ui.style.display = "flex";
      console.clear();
      const panorama = new google.maps.StreetViewPanorama(
        document.getElementById("street-view"),
        {
          position: data.location.latLng,
          pov: {
            heading: 0,
            pitch: 0,
            zoom: 0,
          },
          showRoadLabels: false,
        }
      );
    } else generateRandomPoint(initMap);

    map = new google.maps.Map(document.getElementById("map"), {
      zoom: 2,
      maxZoom: 10,
      minZoom: 2,
      center: { lat: 0, lng: 0 },
      streetViewControl: false,
      showRoadLabels: false,
      zoomControl: true,
      mapTypeControl: false,
    });
    map.setOptions({ draggableCursor: "crosshair" });
    const myinfowindow = new google.maps.InfoWindow({});
    var marker = new google.maps.Marker({
      map,
    });
    marker.addListener("click", () => {
      infowindow.open({
        anchor: marker,
        map,
      });
      marked = true;
    });
    myinfowindow.open(map);
    // YOUR GUESS MARKER
    var set = true;
    map.addListener("click", (mapsMouseEvent) => {
      guessCont.style.display = "flex";
      if (played === true) {
        return;
      }
      if (set == true) {
        guessLatLng = new google.maps.LatLng(
          mapsMouseEvent.latLng.lat(),
          mapsMouseEvent.latLng.lng()
        );
        guessMarker = new google.maps.Marker({
          position: mapsMouseEvent.latLng,
        });
        guessMarker.setMap(map);
        set = false;
        marked = true;
      } else {
        guessMarker.setMap(null);
        set = true;
        marked = false;
      }
    });

    // TRUE LOCATION
    guessbtn.addEventListener("click", () => {
      if (marked == true) {
        targetLatLng = data.location.latLng;
        map = new google.maps.Map(document.getElementById("map"), {
          zoom: 3,
          maxZoom: 10,
          minZoom: 2,
          center: targetLatLng,
          streetViewControl: false,
          zoomControl: false,
          mapTypeControl: false,
        });
        targetMarker = new google.maps.Marker({
          position: targetLatLng,
          title: "True Location",
          draggable: false,
          icon: {
            url: "../../../assets/imgs/3.png",
          },
          anchor: new google.maps.Point(15, 15),
        });
        marker = new google.maps.Marker({
          position: guessLatLng,
          map,
        });
        targetMarker.setMap(map);
        distance = checkDistance();
        if (Math.floor(distance) == 0) {
          var yards = Math.round(distance * 1093);
          document.getElementById("score").innerHTML = yards + " yards";
        } else {
          document.getElementById("score").innerHTML =
            Math.floor(distance) + " km";
        }
        var points = Math.round(
          5000 * 0.998036 * Math.exp((-10 * distance) / 40000)
        );
        if (points < 0) {
          points = 0;
        } else if (Math.floor(distance) <= 0) {
          points = 5000;
        }

        lineCoordinates = [targetLatLng, guessLatLng];
        linePath = new google.maps.Polyline({
          path: lineCoordinates,
          geodesic: true,
          strokeColor: "#FF0000",
          strokeOpacity: 1.0,
          strokeWeight: 2,
        });

        levelComplete();
        linePath.setMap(map);
        document.getElementById("playerScore").innerHTML = "" + points;
        played = true;
        next.value = "Next";

        next.onclick = function () {
          round++;
          playerScore += points;
          playagain();
        };
      }
    });
  } else {
    window.location.reload();
  }
}