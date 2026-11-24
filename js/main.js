
import {
  initializeGlobe,
  addCityMarker,
  flyToCity
} from "./globe.js";

let cities = [];
let selectedCity = null;

const welcomePanel = document.getElementById("welcomePanel");
const cityInformation = document.getElementById("cityInformation");

async function loadProject() {
  const response = await fetch("./data/index.json");

  if (!response.ok) {
    throw new Error("Indice del progetto non disponibile.");
  }

  const index = await response.json();

  const files = await Promise.all(
    index.cities.map(async path => {
      const result = await fetch(`./data/${path}`);

      if (!result.ok) {
        throw new Error(`Errore nel caricamento: ${path}`);
      }

      return result.json();
    })
  );

  cities = files;
  cities.forEach(addCityMarker);
}

function selectCity(cityId) {
  const city = cities.find(item => item.id === cityId);

  if (!city) return;

  selectedCity = city;

  welcomePanel.classList.add("hidden");
  cityInformation.classList.remove("hidden");

  document.getElementById("cityTitle").textContent = city.name;
  document.getElementById("cityCountry").textContent = city.country;
  document.getElementById("cityDescription").textContent =
    city.description;

  const topics = document.getElementById("cityTopics");
  topics.replaceChildren();

  (city.topics || []).forEach(topic => {
    const tag = document.createElement("span");
    tag.className = "topic-tag";
    tag.textContent = topic;
    topics.appendChild(tag);
  });

  renderSections(city);
  flyToCity(city);
}

function renderSections(city) {
  const container = document.getElementById("citySections");
  container.replaceChildren();

  (city.sections || []).forEach(section => {
    const sectionElement = document.createElement("section");
    sectionElement.className = "city-section";

    const heading = document.createElement("h3");
    heading.textContent = section.title;
    sectionElement.appendChild(heading);

    if (section.description) {
      const description = document.createElement("p");
      description.textContent = section.description;
      sectionElement.appendChild(description);
    }

    (section.blocks || []).forEach(block => {
      const article = document.createElement("article");

      if (block.title) {
        const title = document.createElement("h4");
        title.textContent = block.title;
        article.appendChild(title);
      }

      if (block.content) {
        const paragraph = document.createElement("p");
        paragraph.textContent = block.content;
        article.appendChild(paragraph);
      }

      if (block.image) {
        const image = document.createElement("img");
        image.className = "city-image";
        image.src = block.image;
        image.alt = block.imageAlt || block.title || city.name;
        image.loading = "lazy";
        article.appendChild(image);
      }

      if (block.subjects?.length) {
        const subjectContainer = document.createElement("div");
        subjectContainer.className = "block-subjects";

        block.subjects.forEach(subject => {
          const tag = document.createElement("span");
          tag.className = "subject-tag";
          tag.textContent = subject;
          subjectContainer.appendChild(tag);
        });

        article.appendChild(subjectContainer);
      }

      sectionElement.appendChild(article);
    });

    container.appendChild(sectionElement);
  });
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

function backToWelcome() {
  selectedCity = null;
  cityInformation.classList.add("hidden");
  welcomePanel.classList.remove("hidden");
}

async function start() {
  try {
    initializeGlobe();
    await loadProject();

    window.addEventListener("citySelected", event => {
      selectCity(event.detail);
    });

    document.getElementById("searchButton")
      .addEventListener("click", searchCity);

    document.getElementById("citySearch")
      .addEventListener("keydown", event => {
        if (event.key === "Enter") searchCity();
      });

    document.getElementById("backButton")
      .addEventListener("click", backToWelcome);

    document.getElementById("exploreButton")
      .addEventListener("click", () => {
        document.getElementById("globe")
          .scrollIntoView({ behavior: "smooth" });
      });

    document.getElementById("routesButton")
      .addEventListener("click", () => {
        alert("I percorsi tematici saranno disponibili prossimamente.");
      });

    document.getElementById("aboutButton")
      .addEventListener("click", () => {
        alert("HEALTH PLANET: un progetto di educazione alla salute.");
      });

  } catch (error) {
    console.error(error);
    alert("Errore durante il caricamento di HEALTH PLANET.");
  }
}

start();
