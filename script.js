const nameInput = document.getElementById("name");
const daySelect = document.getElementById("day");
const memoryInput = document.getElementById("memory");
const placeInput = document.getElementById("place");
const moodSelect = document.getElementById("mood");
const ratingInput = document.getElementById("rating");
const addBtn = document.getElementById("addBtn");
const clearBtn = document.getElementById("clearBtn");
const memoriesList = document.getElementById("memoriesList");
const total = document.getElementById("total");
const average = document.getElementById("average");
const daysFilter = document.querySelector(".days-filter");

let memories = JSON.parse(localStorage.getItem("espagneMemories")) || [];
let currentFilter = "all";

for (let i = 1; i <= 14; i++) {
  const option = document.createElement("option");
  option.value = `Jour ${i}`;
  option.textContent = `Jour ${i}`;
  daySelect.appendChild(option);

  const btn = document.createElement("button");
  btn.className = "day-btn";
  btn.dataset.day = `Jour ${i}`;
  btn.textContent = `Jour ${i}`;
  daysFilter.appendChild(btn);
}

function saveMemories() {
  localStorage.setItem("espagneMemories", JSON.stringify(memories));
}

function getFilteredMemories() {
  if (currentFilter === "all") return memories;
  return memories.filter(memory => memory.day === currentFilter);
}

function updateStats() {
  total.textContent = memories.length;

  if (memories.length > 0) {
    const sum = memories.reduce((acc, item) => acc + Number(item.rating), 0);
    average.textContent = (sum / memories.length).toFixed(1);
  } else {
    average.textContent = "0";
  }
}

function renderMemories() {
  memoriesList.innerHTML = "";

  const filteredMemories = getFilteredMemories();

  if (filteredMemories.length === 0) {
    memoriesList.innerHTML = `<p class="empty">Aucun souvenir ici pour le moment 🌴</p>`;
  }

  filteredMemories.forEach((memory) => {
    const realIndex = memories.indexOf(memory);

    const card = document.createElement("article");
    card.className = "memory-card";

    card.innerHTML = `
      <div class="memory-top">
        <h3>${memory.mood} ${memory.name}</h3>
        <strong>${memory.rating}/10</strong>
      </div>

      <p>${memory.text}</p>

      <div class="badges">
        <span class="badge">${memory.day}</span>
        <span class="badge">📍 ${memory.place || "Lieu inconnu"}</span>
        <span class="badge">📅 ${memory.date}</span>
      </div>

      <button class="delete-btn" onclick="deleteMemory(${realIndex})">
        Supprimer
      </button>
    `;

    memoriesList.prepend(card);
  });

  updateStats();
}

function addMemory() {
  const name = nameInput.value.trim();
  const day = daySelect.value;
  const text = memoryInput.value.trim();
  const place = placeInput.value.trim();
  const mood = moodSelect.value;
  const rating = ratingInput.value;

  if (!name || !day || !text || rating === "") {
    alert("Remplis au minimum le prénom, le jour, le souvenir et la note !");
    return;
  }

  if (rating < 0 || rating > 10) {
    alert("La note doit être entre 0 et 10 !");
    return;
  }

  memories.push({
    name,
    day,
    text,
    place,
    mood,
    rating,
    date: new Date().toLocaleDateString("fr-FR")
  });

  saveMemories();

  currentFilter = day;
  document.querySelectorAll(".day-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.day === currentFilter);
  });

  renderMemories();

  nameInput.value = "";
  daySelect.value = "";
  memoryInput.value = "";
  placeInput.value = "";
  ratingInput.value = "";
}

function deleteMemory(index) {
  memories.splice(index, 1);
  saveMemories();
  renderMemories();
}

function clearAllMemories() {
  if (confirm("Tu veux vraiment tout supprimer ?")) {
    memories = [];
    saveMemories();
    renderMemories();
  }
}

daysFilter.addEventListener("click", (event) => {
  if (!event.target.classList.contains("day-btn")) return;

  currentFilter = event.target.dataset.day;

  document.querySelectorAll(".day-btn").forEach(btn => {
    btn.classList.remove("active");
  });

  event.target.classList.add("active");

  renderMemories();
});

addBtn.addEventListener("click", addMemory);
clearBtn.addEventListener("click", clearAllMemories);

renderMemories();