const RESOURCES = [
{
    name: "Osmania General Hospital",
    type: "hospital",
    lat: 17.3850,
    lon: 78.4867,
    phone: "04024600146",
    open: true
},
{
    name: "Gandhi Hospital",
    type: "hospital",
    lat: 17.4210,
    lon: 78.5030,
    phone: "04027505566",
    open: true
},
{
    name: "Abids Police Station",
    type: "police",
    lat: 17.3910,
    lon: 78.4740,
    phone: "9490616303",
    open: true
},
{
    name: "Secunderabad Fire Station",
    type: "fire_station",
    lat: 17.4400,
    lon: 78.4980,
    phone: "04027801101",
    open: true
},
{
    name: "Chiranjeevi Blood Bank",
    type: "bloodbank",
    lat: 17.4000,
    lon: 78.4500,
    phone: "04027567892",
    open: false
}
];

const statusEl = document.getElementById("status");
const coordsEl = document.getElementById("coords");
const listEl = document.getElementById("resourceList");
const getBtn = document.getElementById("getLocationBtn");
const filterEl = document.getElementById("categoryFilter");
const darkToggle = document.getElementById("darkToggle");
const voiceBtn = document.getElementById("voiceSOS");

let userLat = null;
let userLon = null;

/* NETWORK STATUS */
function updateStatus() {
    if (navigator.onLine) {
        statusEl.textContent = "Online — fetching live emergency data";
        statusEl.style.color = "green";
    } else {
        statusEl.textContent = "Offline — using built-in emergency database";
        statusEl.style.color = "red";
    }
}
window.addEventListener("online", updateStatus);
window.addEventListener("offline", updateStatus);
updateStatus();

/* DISTANCE */
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

    return Number((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
}

/* LOAD LAST SAVED LOCATION */
const savedLat = localStorage.getItem("lastLat");
const savedLon = localStorage.getItem("lastLon");

if (savedLat && savedLon) {
    userLat = Number(savedLat);
    userLon = Number(savedLon);
    coordsEl.textContent =
        `Last location: ${userLat.toFixed(4)}, ${userLon.toFixed(4)}`;
}

/* RENDER */
function renderResources() {
    if (userLat === null) return;

    let resources = RESOURCES;

    if (filterEl.value !== "all") {
        const mapped = filterEl.value === "fire" ? "fire_station" : filterEl.value;
        resources = resources.filter(r => r.type === mapped);
    }

    const finalList = resources
        .map(r => ({
            ...r,
            dist: getDistance(userLat, userLon, r.lat, r.lon)
        }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 5);

    listEl.innerHTML = "";

    finalList.forEach((r, index) => {
        const li = document.createElement("li");

        if (index === 0) {
            li.style.border = "2px solid green";
        }

        li.innerHTML = `
<strong>${r.name}</strong><br>
${r.type.toUpperCase()} ${r.open ? "(24×7)" : ""}<br>
<span class="distance">${r.dist} km away</span><br>

<a href="tel:${r.phone}" class="call">📞 Call</a><br>
<a href="https://www.google.com/maps?q=${r.lat},${r.lon}" target="_blank" class="call">🗺️ Navigate</a>
`;
        listEl.appendChild(li);
    });
}

/* GET LOCATION BUTTON */
getBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
        alert("Geolocation not supported");
        return;
    }

    coordsEl.textContent = "Fetching location...";

    navigator.geolocation.getCurrentPosition(pos => {
        userLat = pos.coords.latitude;
        userLon = pos.coords.longitude;

        localStorage.setItem("lastLat", userLat);
        localStorage.setItem("lastLon", userLon);

        coordsEl.textContent =
            `Your location: ${userLat.toFixed(4)}, ${userLon.toFixed(4)}`;

        renderResources();
    });
});

/* AUTO LOCATION ON LOAD */
window.addEventListener("load", () => {
    if (!savedLat && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            userLat = pos.coords.latitude;
            userLon = pos.coords.longitude;
            renderResources();
        });
    } else {
        renderResources();
    }
});

/* FILTER */
filterEl.addEventListener("change", renderResources);

/* DARK MODE */
darkToggle.addEventListener("click", () =>
    document.body.classList.toggle("dark")
);

/* VOICE SOS */
voiceBtn.addEventListener("click", () => {
    const msg = new SpeechSynthesisUtterance(
        "Emergency mode activated. Showing nearest help."
    );
    speechSynthesis.speak(msg);
});

/* SERVICE WORKER */
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
}
