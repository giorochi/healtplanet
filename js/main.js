
import {
  initializeGlobe,
  addCityMarker,
  flyToCity
} from "./globe.js";


let cities = [];
let subjects = {};


const welcomePanel = document.getElementById("welcomePanel");
const cityInformation = document.getElementById("cityInformation");

const cityTitle = document.getElementById("cityTitle");
const cityCountry = document.getElementById("cityCountry");
const cityDescription = document.getElementById("cityDescription");
const citySections = document.getElementById("citySections");

const searchInput = document.getElementById("citySearch");
const searchMessage = document.getElementById("searchMessage");


/* ==========================================
   LOAD PROJECT DATA
========================================== */

async function loadProject() {

  const response = await fetch("./data/index.json");

  if (!response.ok) {
    throw new Error("Indice del progetto non disponibile.");
  }

  const index = await response.json();

  const cityFiles = await Promise.all(
    index.cities.map(async path => {

      const result = await fetch(`./data/${path}`);

      if (!result.ok) {
        throw new Error(`Errore nel caricamento: ${path}`);
      }

      return result.json();

    })
  );

  cities = cityFiles;


  // Caricamento delle materie
  if (index.subjects) {

    try {

      const subjectResponse = await fetch(`./data/${index.subjects}`);

      if (subjectResponse.ok) {

        const subjectData = await subjectResponse.json();

        subjectData.forEach(subject => {
          subjects[subject.id] = subject;
        });

      }

    } catch (error) {
      console.warn("Materie non disponibili:", error);
    }

  }


  cities.forEach(addCityMarker);

}


/* ==========================================
   SELECT CITY
========================================== */

function selectCity(cityId) {

  const city = cities.find(item => item.id === cityId);

  if (!city) return;


  welcomePanel.classList.add("hidden");
  cityInformation.classList.remove("hidden");


  cityCountry.textContent = city.country || "";
  cityTitle.textContent = city.name || "";
  cityDescription.textContent = city.description || "";


  renderSections(city);


  flyToCity(city);

  searchMessage.textContent = "";

}


/* ==========================================
   RENDER SECTIONS
========================================== */

function renderSections(city) {

  citySections.replaceChildren();

  (city.sections || []).forEach((section, sectionIndex) => {

    const sectionElement = document.createElement("section");

    sectionElement.className = "city-section reveal";

    sectionElement.style.animationDelay =
      `${Math.min(sectionIndex * 120, 480)}ms`;


    // Titolo della sezione
    const heading = document.createElement("h2");

    heading.className = "city-section-title";
    heading.textContent = section.title;

    sectionElement.appendChild(heading);


    // Descrizione della sezione
    if (section.description) {

      const description = document.createElement("p");

      description.className = "city-section-description";
      description.textContent = section.description;

      sectionElement.appendChild(description);

    }


    // Blocchi della sezione
    (section.blocks || []).forEach((block, blockIndex) => {

      const article = document.createElement("article");

      article.className = "city-block reveal";

      article.style.animationDelay =
        `${Math.min(160 + blockIndex * 120, 640)}ms`;


      // Titolo del blocco
      if (block.title) {

        const title = document.createElement("h3");

        title.className = "city-block-title";
        title.textContent = block.title;

        article.appendChild(title);

      }


      // Testo
      if (block.content) {

        const paragraph = document.createElement("p");

        paragraph.className = "city-block-text";
        paragraph.textContent = block.content;

        article.appendChild(paragraph);

      }


      // Immagine
      if (block.image) {

        const image = document.createElement("img");

        image.className = "city-image";
        image.src = block.image;
        image.alt = block.imageAlt || block.title || city.name;
        image.loading = "lazy";

        article.appendChild(image);

      }


      // Materie scolastiche
      if (block.subjects?.length) {

        const subjectContainer = document.createElement("div");

        subjectContainer.className = "block-subjects";

        block.subjects.forEach(subjectId => {

          const subjectData = subjects[subjectId];

          const tag = document.createElement("span");

          tag.className = "subject-tag";

          tag.textContent = subjectData
            ? subjectData.name
            : subjectId;

          subjectContainer.appendChild(tag);

        });

        article.appendChild(subjectContainer);

      }


      sectionElement.appendChild(article);

    });


    citySections.appendChild(sectionElement);

  });

}


/* ==========================================
   CITY SEARCH
========================================== */

function searchCity() {

  const query = searchInput.value.trim().toLowerCase();

  if (!query) {

    searchMessage.textContent = "Inserisci il nome di una città o di un Paese.";

    return;

  }


  const city = cities.find(item =>

    item.name.toLowerCase().includes(query) ||

    (item.country || "").toLowerCase().includes(query)

  );


  if (city) {

    selectCity(city.id);

  } else {

    searchMessage.textContent =
      "Nessun luogo trovato nell'atlante attuale.";

  }

}


/* ==========================================
   RETURN TO ATLAS
========================================== */

function backToWelcome() {

  cityInformation.classList.add("hidden");

  welcomePanel.classList.remove("hidden");

  searchInput.value = "";

  searchMessage.textContent = "";

}


/* ==========================================
   NAVIGATION
========================================== */

function initializeNavigation() {

  document.getElementById("searchButton")
    .addEventListener("click", searchCity);


  searchInput.addEventListener("keydown", event => {

    if (event.key === "Enter") {
      searchCity();
    }

  });


  document.getElementById("backButton")
    .addEventListener("click", backToWelcome);


  document.getElementById("exploreButton")
    .addEventListener("click", () => {

      document.getElementById("globe").scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

    });


  document.getElementById("routesButton")
    .addEventListener("click", () => {

      alert("I percorsi tematici saranno disponibili prossimamente.");

    });


  document.getElementById("aboutButton")
    .addEventListener("click", () => {

      alert(
        "HEALTH PLANET\n\n" +
        "Un atlante interattivo dedicato alla salute, " +
        "alla scienza, all'ambiente e alla società."
      );

    });

}


/* ==========================================
   GLOBE EVENTS
========================================== */

function initializeGlobeEvents() {

  window.addEventListener("citySelected", event => {

    selectCity(event.detail);

  });

}


/* ==========================================
   START APPLICATION
========================================== */

async function start() {

  try {

    initializeGlobe();

    await loadProject();

    initializeNavigation();

    initializeGlobeEvents();

  } catch (error) {

    console.error("HEALTH PLANET:", error);

    document.getElementById("welcomePanel").innerHTML = `
      <div class="panel-number">ERRORE DI CARICAMENTO</div>
      <h2>Impossibile caricare l'atlante.</h2>
      <p>Controlla la connessione e riprova.</p>
    `;

  }

}


start();
