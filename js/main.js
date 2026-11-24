
import {
  initializeGlobe,
  addCityMarker,
  flyToCity
} from "./globe.js";

let cities = [];
let selectedCity = null;

const preview = document.getElementById("cityPreview");
const cityContent = document.getElementById("cityContent");

async function loadProject() {
  try {
    const response = await fetch("./data/index.json");

    if (!response.ok) {
      throw new Error("Impossibile caricare l'indice del progetto.");
    }

    const index = await response.json();

    const cityFiles = await Promise.all(
      index.cities.map(async (path) => {
        const result = await fetch(`./data/${path}`);

        if (!result.ok) {
          throw new Error(`Impossibile caricare ${path}`);
        }

        return result.json();
      })
    );

    cities = cityFiles;
    cities.forEach(addCityMarker);

    return true;
  } catch (error) {
    console.error("Errore HEALTH PLANET:", error);
    alert("Non è stato possibile caricare i dati del progetto.");
    return false;
  }
}

function selectCity(cityId) {
  const city = cities.find(item => item.id === cityId);

  if (!city) return;

  selectedCity = city;

  document.getElementById("previewName").textContent =
    `${city.name}, ${city.country}`;

  document.getElementById("previewDescription").textContent =
    city.description;

  preview.classList.remove("hidden");
  cityContent.classList.add("hidden");

  flyToCity(city);
}

function openCity() {
  if (!selectedCity) return;

  document.getElementById("cityTitle").textContent =
    selectedCity.name;

  document.getElementById("cityCountry").textContent =
    selectedCity.country;

  document.getElementById("cityDescription").textContent =
    selectedCity.description;

  const container = document.getElementById("citySections");
  container.replaceChildren();

  selectedCity.sections.forEach(section => {
    const sectionElement = document.createElement("section");

    const title = document.createElement("h3");
    title.textContent = section.title;
    sectionElement.appendChild(title);

    const description = document.createElement("p");
    description.textContent = section.description;
    sectionElement.appendChild(description);

    section.blocks.forEach(block => {
      const article = document.createElement("article");

      const heading = document.createElement("h4");
      heading.textContent = block.title;
      article.appendChild(heading);

      const paragraph = document.createElement("p");
      paragraph.textContent = block.content;
      article.appendChild(paragraph);

      sectionElement.appendChild(article);
    });

    container.appendChild(sectionElement);
  });

  preview.classList.add("hidden");
  cityContent.classList.remove("hidden");

  cityContent.scrollIntoView({ behavior: "smooth" });
}

function searchCity() {
  const query = document.getElementById("citySearch")
    .value.trim().toLowerCase();

  if (!query) return;

  const city = cities.find(item =>
    item.name.toLowerCase().includes(query) ||
    item.country.toLowerCase().includes(query)
  );

  if (city) {
    selectCity(city.id);
  } else {
    alert("Nessun luogo trovato.");
  }
}

async function start() {
  initializeGlobe();

  const loaded = await loadProject();

  if (!loaded) return;

  window.addEventListener("citySelected", event => {
    selectCity(event.detail);
  });

  document.getElementById("openCityButton")
    .addEventListener("click", openCity);

  document.getElementById("searchButton")
    .addEventListener("click", searchCity);

  document.getElementById("citySearch")
    .addEventListener("keydown", event => {
      if (event.key === "Enter") searchCity();
    });

  document.getElementById("backButton")
    .addEventListener("click", () => {
      cityContent.classList.add("hidden");
      preview.classList.add("hidden");
    });

  document.getElementById("exploreButton")
    .addEventListener("click", () => {
      document.querySelector(".globe-section")
        .scrollIntoView({ behavior: "smooth" });
    });

  document.getElementById("routesButton")
    .addEventListener("click", () => {
      alert("I percorsi tematici saranno disponibili in una prossima versione.");
    });

  document.getElementById("aboutButton")
    .addEventListener("click", () => {
      alert("HEALTH PLANET: un progetto di educazione alla salute.");
    });
}

start();
