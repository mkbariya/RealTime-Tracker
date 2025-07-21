const socket = io();
const map = L.map("map").setView([0, 0], 16);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

const markers = {};
let mapCentered = false;

const userName = document.body.dataset.username || "Anonymous";

window.addEventListener("load", () => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;
        map.setView([latitude, longitude], 15);
        mapCentered = true;
        socket.emit("location", { latitude, longitude, name: userName });
      },
      (error) => {
        alert("Location access is required to use this app.");
        console.error("Geolocation error:", error);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    navigator.geolocation.watchPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;
        socket.emit("location", { latitude, longitude, name: userName });
      },
      (error) => {
        console.error("Error watching location:", error);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
});

socket.on("recievelocation", ({ id, latitude, longitude, name }) => {
  const label = name || id;

  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    const marker = L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup(`${label}`)
      .openPopup();
    markers[id] = marker;
  }
});

socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
