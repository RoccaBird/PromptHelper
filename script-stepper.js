let need = "";

const bereiche = {
  IT: [
    "Microsoft",
    "Security",
    "On-Premise IT",
    "Cloud allgemein",
    "IT-Strategie",
  ],
  Marketing: [
    "Social Media",
    "SEO / SEA",
    "Kampagnenplanung",
    "Branding / Design",
    "Content Marketing",
  ],
  Business: [
    "Prozessoptimierung",
    "Projektmanagement",
    "Vertrieb",
    "Personalmanagement",
    "Business-Strategie",
  ],
  Kreativ: [
    "Grafikdesign",
    "Storytelling",
    "Ideenfindung",
    "Content-Erstellung",
    "Markenaufbau",
  ],
  Coding: [
    "Webentwicklung allgemein",
    "App-Entwicklung",
    "Scripting & Automatisierung",
    "API-Integration",
    "Datenverarbeitung",
  ],
};

document.addEventListener("DOMContentLoaded", function () {
  try {
    // Auto-Save-Setup laden
    loadAutoSavedData();
    setupAutoSave();

    // 🚀 NEU: Bedarf aus Startseite prüfen
    const selectedNeed = localStorage.getItem("selectedNeed");
    if (selectedNeed) {
      need = selectedNeed;
      localStorage.removeItem("selectedNeed"); // aufräumen
      goToStep(2);
      updateSubbereich();
    }
  } catch (e) {
    console.error("Fehler beim Autosave oder Need-Übergabe:", e);
  }
});

// Bedarf dynamisch erfassen
document.addEventListener("DOMContentLoaded", () => {
  updateProgressBar(1);
  const buttonContainer = document.getElementById("bedarf-buttons");

  buttonContainer.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON" && e.target.hasAttribute("data-need")) {
      need = e.target.getAttribute("data-need");
      goToStep(2);
    }
  });
});

function updateProgressBar(stepNumber) {
  const progress = document.getElementById("progress-bar");
  const totalSteps = document.querySelectorAll(".stepper li").length; // Automatisch zählen!
  const percentage = (stepNumber / totalSteps) * 100;

  // Sanfte Animation
  progress.style.transition = "width 0.5s ease";
  progress.style.width = percentage + "%";

  // Step-Zähler aktualisieren (neu!)
  const stepCounter = document.getElementById("step-counter");
  if (stepCounter) {
    stepCounter.textContent = `Schritt ${stepNumber} von ${totalSteps}`;
  }
}

function selectNeed(selection) {
  need = selection;
  goToStep(2);
  updateSubbereich();
}

function goToStep(stepNumber) {
  for (let i = 1; i <= 4; i++) {
    document.getElementById("step" + i).classList.add("hidden");
    document.getElementById("stepIndicator" + i).classList.remove("active");
  }

  document.getElementById("step" + stepNumber).classList.remove("hidden");
  document.getElementById("stepIndicator" + stepNumber).classList.add("active");

  updateProgressBar(stepNumber);

  if (stepNumber === 2) {
    updateSubbereich(); // genügt völlig
  }

  if (stepNumber === 3) {
    adjustDetailFieldsByNeed();
  }
}

function updateSubbereich() {
  const unterbereich = document.getElementById("unterbereich");
  const bereich = document.getElementById("bereich").value;

  if (!bereich) return; // Falls nichts gewählt ist, abbrechen

  unterbereich.innerHTML = ""; // Vorherige Optionen löschen

  if (bereiche[bereich]) {
    bereiche[bereich].forEach((sub) => {
      const option = document.createElement("option");
      option.value = sub;
      option.textContent = sub;
      unterbereich.appendChild(option);
    });

    // NEU: Sofort erste Unterkategorie setzen
    unterbereich.selectedIndex = 0;

    // NEU: Expertenrolle automatisch setzen
    setDefaultRole();
  }
}

function setDefaultRole() {
  const bereich = document.getElementById("bereich").value;
  const unterbereich = document.getElementById("unterbereich").value;
  const rolleField = document.getElementById("rolle");

  if (bereich && unterbereich) {
    rolleField.value = `${bereich}-Experte für ${unterbereich}`;
  }
}

function adjustFieldsByNeed() {
  const zielContainer = document.getElementById("ziel-container");
  const rahmenMussContainer = document.getElementById("rahmen-muss-container");
  const rahmenVermeidenContainer = document.getElementById(
    "rahmen-vermeiden-container"
  );
  const beispieleContainer = document.getElementById("beispiele-container");
  const hinweiseContainer = document.getElementById("hinweise-container");

  if (need === "schnell" || need === "egal") {
    zielContainer.style.display = "none";
    rahmenMussContainer.style.display = "none";
    rahmenVermeidenContainer.style.display = "none";
    beispieleContainer.style.display = "none";
    hinweiseContainer.style.display = "none";
  } else {
    zielContainer.style.display = "block";
    rahmenMussContainer.style.display = "block";
    rahmenVermeidenContainer.style.display = "block";
    beispieleContainer.style.display = "block";
    hinweiseContainer.style.display = "block";
  }
}

function generatePrompt() {
  const generateButton = document.querySelector(
    'button[onclick="generatePrompt()"]'
  );
  generateButton.innerText = "Erstelle Prompt...";
  generateButton.disabled = true;

  setTimeout(() => {
    const rolle = document.getElementById("rolle").value.trim();
    const aufgabe = document.getElementById("aufgabe").value.trim();
    const ziel = document.getElementById("ziel").value.trim();
    const formatOptions = Array.from(
      document.querySelectorAll('input[name="format"]:checked')
    )
      .map((opt) => opt.value)
      .join(", ");
    const rahmenMuss = document.getElementById("rahmen-muss")?.value.trim();
    const rahmenVermeiden = document
      .getElementById("rahmen-vermeiden")
      ?.value.trim();
    const beispiele = document.getElementById("beispiele").value.trim();
    const hinweise = document.getElementById("hinweise").value.trim();

    let prompt = "";

    if (rolle) prompt += `Rolle: ${rolle}\n\n`;
    if (aufgabe) prompt += `Aufgabe: ${aufgabe}\n\n`;
    if (formatOptions) prompt += `Format: ${formatOptions}\n\n`;
    if (ziel) prompt += `Ziel: ${ziel}\n\n`;
    if (rahmenMuss)
      prompt += `Rahmenbedingungen (MUSS verwendet werden): ${rahmenMuss}\n\n`;
    if (rahmenVermeiden)
      prompt += `Rahmenbedingungen (VERMEIDEN): ${rahmenVermeiden}\n\n`;
    if (beispiele) prompt += `Beispiele: ${beispiele}\n\n`;
    if (hinweise) prompt += `Wichtige Hinweise: ${hinweise}\n\n`;

    document.getElementById("fertigerPrompt").value = prompt.trim();

    // ✅ Jetzt erst speichern, wenn der Prompt fertig ist
    savePromptToHistorie(prompt.trim());

    generateButton.innerText = "Prompt erstellen";
    generateButton.disabled = false;

    // Jetzt auf Vorschau wechseln:
    goToStep(4);
  }, 500);
}

function savePromptToHistorie(promptText) {
  let historie = JSON.parse(localStorage.getItem("historie") || "[]");

  if (promptText.trim() !== "") {
    const newEntry = {
      text: promptText,
      isFavorite: false,
    };
    historie.unshift(newEntry);
    if (historie.length > 10) {
      historie = historie.slice(0, 10);
    }
    localStorage.setItem("historie", JSON.stringify(historie));
  }
}

function savePromptAsFile() {
  const text = document.getElementById("fertigerPrompt").value;
  const date = new Date();
  const filename = `Prompt_${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.txt`;

  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

function copyPrompt() {
  const fertigerPrompt = document.getElementById("fertigerPrompt");
  fertigerPrompt.select();
  document.execCommand("copy");

  const snackbar = document.getElementById("snackbar");
  snackbar.classList.add("show");

  setTimeout(() => {
    snackbar.classList.remove("show");
  }, 3000); // 3 Sekunden sichtbar
}

/* 🚀 Snackbar anzeigen bei Copy */
function showSnackbar() {
  const snackbar = document.getElementById("snackbar");
  snackbar.className = "show";
  setTimeout(() => {
    snackbar.className = snackbar.className.replace("show", "");
  }, 2000);
}

/* 🚀 Auto-Save Funktionen */
function setupAutoSave() {
  const fields = [
    "rolle",
    "aufgabe",
    "ziel",
    "rahmen",
    "beispiele",
    "hinweise",
  ];

  fields.forEach((id) => {
    const element = document.getElementById(id);
    if (
      element &&
      (element.tagName === "INPUT" || element.tagName === "TEXTAREA")
    ) {
      element.addEventListener("input", () => {
        localStorage.setItem(id, element.value);
      });
    }
  });

  const formatCheckboxes = document.querySelectorAll('input[name="format"]');
  formatCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const selectedFormats = Array.from(formatCheckboxes)
        .filter((cb) => cb.checked)
        .map((cb) => cb.value);
      localStorage.setItem("format", JSON.stringify(selectedFormats));
    });
  });
}

function loadAutoSavedData() {
  const fields = [
    "rolle",
    "aufgabe",
    "ziel",
    "rahmen",
    "beispiele",
    "hinweise",
  ];

  fields.forEach((id) => {
    const saved = localStorage.getItem(id);
    if (saved) {
      const element = document.getElementById(id);
      if (element) {
        element.value = saved;
      }
    }
  });

  const savedFormats = JSON.parse(localStorage.getItem("format") || "[]");
  savedFormats.forEach((val) => {
    const checkbox = document.querySelector(
      `input[name="format"][value="${val}"]`
    );
    if (checkbox) {
      checkbox.checked = true;
    }
  });
}

/* 🚀 LocalStorage beim Neustart löschen */
function resetAll() {
  window.location.href = "stepper.html"; // neu laden, aber nicht den localStorage löschen
}

/* 🚀 Beim Laden Setup */
document.addEventListener("DOMContentLoaded", function () {
  try {
    loadAutoSavedData();
    setupAutoSave();
  } catch (e) {
    console.error("Fehler beim Autosave-Setup:", e);
  }
});
