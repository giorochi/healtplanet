
/* ==================================
   HEALTH PLANET - MOTORE PRINCIPALE
================================== */

// INSERIRE QUI IL TOKEN CESIUM ION
Cesium.Ion.defaultAccessToken = "INSERISCI_IL_TUO_TOKEN";

// Elementi dell'interfaccia
const preview = document.getElementById("preview");
const cityPanel = document.getElementById("cityPanel");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

let cities = [];
let selectedCity = null;

// Inizializzazione del globo
const viewer = new Cesium.Viewer("cesiumContainer", {
  terrain: Cesium.Terrain.fromWorldTerrain(),

  animation: false,
  timeline: false,
  baseLayerPicker: false,
  geocoder: false,
  homeButton: false,
  sceneModePicker: false,
  navigationHelpButton: false,
  fullscreenButton: false,
  infoBox: false,
  selectionIndicator: false
});

viewer.scene.globe.enableLighting = true;
viewer.scene.backgroundColor = Cesium.Color.fromCssColorString("#050b16");

viewer.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(15, 25, 23000000)
});

// Caricamento dei dati
async function loadData() {
  try {
    const response = await fetch("data/index.json");

    if (!response.ok) {
      throw new Error("Impossibile caricare l'indice.");
    }

    const index = await response.json();

    for (const file of index.cities) {
      const cityResponse = await fetch("data/" + file);

      if (!cityResponse.ok) {
        console.error("Errore nel caricamento:", file);
        continue;
      }

      const city = await cityResponse.json();
      cities.push(city);
      addCityMarker(city);
    }

  } catch (error) {
    console.error("Errore:", error);
    alert("Non è stato possibile caricare i dati.");
  }
}

// Creazione degli indicatori geografici
function addCityMarker(city) {
  const latitude = city.coordinates.latitude;
  const longitude = city.coordinates.longitude;

  // Area geografica evidenziata
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(
      longitude,
      latitude
    ),

    ellipse: {
      semiMajorAxis: 100000,
      semiMinorAxis: 100000,
      material: Cesium.Color.CYAN.withAlpha(0.13),
      outline: true,
      outlineColor: Cesium.Color.CYAN.withAlpha(0.8),
      height: 100
    },

    cityId: city.id
  });

  // Punto preciso della città
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(
      longitude,
      latitude,
      1000
    ),

    point: {
      pixelSize: 13,
      color: Cesium.Color.CYAN,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
      disableDepthTestDistance: Number.POSITIVE_INFINITY
    },

    label: {
      text: city.name.toUpperCase(),
      font: "bold 12px Arial",
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 3,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      pixelOffset: new Cesium.Cartesian2(0, -24),
      disableDepthTestDistance: Number.POSITIVE_INFINITY
    },

    cityId: city.id
  });
}

// Apertura dell'anteprima
function showPreview(city) {
  selectedCity = city;

  document.getElementById("previewName").textContent =
    city.name;

  document.getElementById("previewCountry").textContent =
    `${city.region || ""} · ${city.country}`;

  document.getElementById("previewDescription").textContent =
    city.preview.description;

  preview.classList.remove("hidden");
  cityPanel.classList.add("hidden");
}

// Ricerca della città
function searchCity(name) {
  const city = cities.find(
    item => item.name.toLowerCase() === name.toLowerCase()
  );

  if (!city) return;

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      city.coordinates.longitude,
      city.coordinates.latitude,
      900000
    ),
    duration: 2
  });

  showPreview(city);
  searchResults.innerHTML = "";
}

// Risultati della ricerca
searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();

  searchResults.innerHTML = "";

  if (!query) return;

  const results = cities.filter(city =>
    city.name.toLowerCase().includes(query) ||
    city.country.toLowerCase().includes(query)
  );

  results.forEach(city => {
    const result = document.createElement("div");

    result.className = "search-result";
    result.textContent = `${city.name} · ${city.country}`;

    result.addEventListener("click", () => {
      searchCity(city.name);
      searchInput.value = city.name;
    });

    searchResults.appendChild(result);
  });
});

// Selezione degli indicatori sul globo
const handler = new Cesium.ScreenSpaceEventHandler(
  viewer.scene.canvas
);

handler.setInputAction((movement) => {
  const picked = viewer.scene.pick(movement.position);

  if (!Cesium.defined(picked) || !picked.id) return;

  const cityId = picked.id.cityId;

  if (!cityId) return;

  const city = cities.find(item => item.id === cityId);

  if (city) showPreview(city);

}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

// Apertura della città
document.getElementById("openCity").addEventListener(
  "click",
  () => {
    if (!selectedCity) return;

    preview.classList.add("hidden");
    openCity(selectedCity);
  }
);

// Costruzione della pagina della città
function openCity(city) {
  document.getElementById("cityName").textContent =
    city.name;

  document.getElementById("cityTheme").textContent =
    city.theme;

  const container = document.getElementById("citySections");

  container.innerHTML = "";

  city.sections.forEach(section => {
    const sectionElement = document.createElement("section");
    sectionElement.className = "city-section";

    const title = document.createElement("h3");
    title.textContent = section.title;

    const subjects = document.createElement("p");
    subjects.textContent =
      "Discipline: " + section.subjects.join(", ");

    sectionElement.append(title, subjects);

    section.blocks.forEach(block => {
      const blockTitle = document.createElement("h4");
      blockTitle.textContent = block.title;

      const paragraph = document.createElement("p");
      paragraph.textContent = block.content;

      sectionElement.append(blockTitle, paragraph);
    });

    container.appendChild(sectionElement);
  });

  cityPanel.classList.remove("hidden");

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      city.coordinates.longitude,
      city.coordinates.latitude,
      900000
    ),
    duration: 1.5
  });
}

// Chiusura dei pannelli
document.getElementById("closePreview").onclick = () => {
  preview.classList.add("hidden");
};

document.getElementById("closeCity").onclick = () => {
  cityPanel.classList.add("hidden");
};

// Avvio
loadData();

