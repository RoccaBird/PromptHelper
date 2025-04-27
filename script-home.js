// Tabs wechseln
function showTab(tabName) {
  const favoritenTab = document.getElementById("favoritenTab");
  const historieTab = document.getElementById("historieTab");
  const favoritenBereich = document.getElementById("favoritenBereich");
  const historieBereich = document.getElementById("historieBereich");

  if (tabName === "favoriten") {
    favoritenTab.classList.add("active");
    historieTab.classList.remove("active");
    favoritenBereich.classList.remove("hidden");
    historieBereich.classList.add("hidden");
  } else {
    favoritenTab.classList.remove("active");
    historieTab.classList.add("active");
    favoritenBereich.classList.add("hidden");
    historieBereich.classList.remove("hidden");
  }
}

// Historie laden
function loadHistorie() {
  const historie = JSON.parse(localStorage.getItem("historie") || "[]");
  const favoriten = JSON.parse(localStorage.getItem("favoriten") || "[]");

  const favoritenListe = document.getElementById("favoritenListe");
  const historieListe = document.getElementById("historieListe");

  favoritenListe.innerHTML = "";
  historieListe.innerHTML = "";

  favoriten.forEach((entry) => {
    const li = document.createElement("li");

    const textSpan = document.createElement("span");
    textSpan.textContent = entry.text; // 🔥 GANZER Text sichtbar, nicht abgeschnitten

    const copyButton = document.createElement("button");
    copyButton.textContent = "📋";
    copyButton.onclick = () => copyTextToClipboard(entry.text);

    li.appendChild(textSpan);
    li.appendChild(copyButton);

    favoritenListe.appendChild(li);
  });

  historie.forEach((entry, index) => {
    const li = document.createElement("li");

    const textSpan = document.createElement("span");
    textSpan.textContent =
      entry.text.length > 60 ? entry.text.slice(0, 60) + "..." : entry.text;

    const favButton = document.createElement("button");
    favButton.textContent = "★";
    favButton.onclick = () => toggleFavorite(entry.text);

    const delButton = document.createElement("button");
    delButton.textContent = "🗑️";
    delButton.onclick = () => deleteEntry(index);

    li.appendChild(textSpan);
    li.appendChild(favButton);
    li.appendChild(delButton);

    historieListe.appendChild(li);
  });
}

function copyTextToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showSnackbar("✅ Prompt kopiert!");
      })
      .catch((err) => {
        console.error("Fehler beim Kopieren:", err);
        fallbackCopyText(text);
      });
  } else {
    fallbackCopyText(text);
  }
}

// Fallback-Methode
function fallbackCopyText(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed"; // Vermeidet Scrollen
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand("copy");
    showSnackbar("✅ Prompt kopiert!");
  } catch (err) {
    console.error("Fallback Copy fehlgeschlagen:", err);
  }
  document.body.removeChild(textarea);
}

// Favoriten toggeln
function toggleFavorite(promptText) {
  const favoriten = JSON.parse(localStorage.getItem("favoriten") || "[]");

  // Prüfen: existiert dieser Prompt schon in Favoriten?
  const alreadyFavorite = favoriten.some((fav) => fav.text === promptText);

  if (!alreadyFavorite) {
    favoriten.unshift({ text: promptText });
    localStorage.setItem("favoriten", JSON.stringify(favoriten));
    showSnackbar("✅ Favorit gespeichert!");
  } else {
    if (confirm("⚠️ Möchtest du diesen Favoriten wirklich entfernen?")) {
      const updatedFavoriten = favoriten.filter(
        (fav) => fav.text !== promptText
      );
      localStorage.setItem("favoriten", JSON.stringify(updatedFavoriten));
      showSnackbar("❌ Favorit entfernt.");
    }
  }

  loadHistorie(); // Ansicht neu laden
}

function toggleFavorite(promptText) {
  const favoriten = JSON.parse(localStorage.getItem("favoriten") || "[]");

  // Prüfen: existiert dieser Prompt schon in Favoriten?
  const alreadyFavorite = favoriten.some((fav) => fav.text === promptText);

  if (!alreadyFavorite) {
    favoriten.unshift({ text: promptText });
    localStorage.setItem("favoriten", JSON.stringify(favoriten));
    showSnackbar("✅ Favorit gespeichert!");
  } else {
    if (confirm("⚠️ Möchtest du diesen Favoriten wirklich entfernen?")) {
      const updatedFavoriten = favoriten.filter(
        (fav) => fav.text !== promptText
      );
      localStorage.setItem("favoriten", JSON.stringify(updatedFavoriten));
      showSnackbar("❌ Favorit entfernt.");
    }
  }

  loadHistorie(); // Ansicht neu laden
}

// Eintrag löschen
function deleteEntry(index) {
  const historie = JSON.parse(localStorage.getItem("historie") || "[]");
  if (historie[index]) {
    historie.splice(index, 1);
    localStorage.setItem("historie", JSON.stringify(historie));
    loadHistorie();
  }
}

// Live-Suche in aktueller Liste
function filterList() {
  const input = document.getElementById("suchfeld").value.toLowerCase();
  const favoritenBereich = document.getElementById("favoritenBereich");
  const historieBereich = document.getElementById("historieBereich");

  let items;
  if (!favoritenBereich.classList.contains("hidden")) {
    items = favoritenBereich.getElementsByTagName("li");
  } else {
    items = historieBereich.getElementsByTagName("li");
  }

  Array.from(items).forEach((item) => {
    const text = item.innerText.toLowerCase();
    if (text.includes(input)) {
      item.style.display = "";
    } else {
      item.style.display = "none";
    }
  });
}

// Neuen Prompt erstellen
function startPromptGenerator() {
  window.location.href = "stepper.html"; // Zur Generator-Seite springen
}

function showSnackbar(message) {
  const snackbar = document.getElementById("snackbar");
  snackbar.innerText = message;
  snackbar.className = "show";
  setTimeout(() => {
    snackbar.className = snackbar.className.replace("show", "");
  }, 2000);
}

// Alles nach Laden der Seite binden
document.addEventListener("DOMContentLoaded", () => {
  loadHistorie();
  showTab("favoriten");

  const startButton = document.getElementById("startGeneratorButton");
  if (startButton) {
    startButton.addEventListener("click", startPromptGenerator);
  }
});
