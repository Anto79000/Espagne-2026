import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCx3pfTeDECMqriAhCYX_b2q-6ZUDhsc8k",
  authDomain: "espagne-2026-3e5e7.firebaseapp.com",
  projectId: "espagne-2026-3e5e7",
  storageBucket: "espagne-2026-3e5e7.firebasestorage.app",
  messagingSenderId: "494751802499",
  appId: "1:494751802499:web:e936df63d25a5bd66667b6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const nameInput = document.getElementById("name");
const daySelect = document.getElementById("day");
const memoryInput = document.getElementById("memory");
const placeInput = document.getElementById("place");
const moodSelect = document.getElementById("mood");
const ratingInput = document.getElementById("rating");
const photoInput = document.getElementById("photo");
const addBtn = document.getElementById("addBtn");
const clearBtn = document.getElementById("clearBtn");
const memoriesList = document.getElementById("memoriesList");
const total = document.getElementById("total");
const average = document.getElementById("average");
const daysFilter = document.querySelector(".days-filter");

let memories = [];
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
    const card = document.createElement("article");
    card.className = "memory-card";

    card.innerHTML = `
      <div class="memory-top">
        <h3>${memory.mood} ${memory.name}</h3>
        <strong>${memory.rating}/10</strong>
      </div>

      ${memory.photo ? `<img class="memory-photo" src="${memory.photo}" alt="Photo souvenir">` : ""}

      <p>${memory.text}</p>

      <div class="badges">
        <span class="badge">${memory.day}</span>
        <span class="badge">📍 ${memory.place || "Lieu inconnu"}</span>
        <span class="badge">📅 ${memory.date}</span>
      </div>

      <button class="delete-btn" data-id="${memory.id}">
        Supprimer
      </button>
    `;

    memoriesList.prepend(card);
  });

  updateStats();
}

function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxWidth = 800;
        const ratio = maxWidth / img.width;

        canvas.width = maxWidth;
        canvas.height = img.height * ratio;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressedImage = canvas.toDataURL("image/jpeg", 0.65);
        resolve(compressedImage);
      };

      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
  });
}

async function addMemory() {
  const name = nameInput.value.trim();
  const day = daySelect.value;
  const text = memoryInput.value.trim();
  const place = placeInput.value.trim();
  const mood = moodSelect.value;
  const rating = ratingInput.value;
  const photoFile = photoInput.files[0];

  if (!name || !day || !text || rating === "") {
    alert("Remplis au minimum le prénom, le jour, le souvenir et la note !");
    return;
  }

  if (rating < 0 || rating > 10) {
    alert("La note doit être entre 0 et 10 !");
    return;
  }

  addBtn.disabled = true;
  addBtn.textContent = "Ajout en cours...";

  const photo = photoFile ? await compressImage(photoFile) : "";

  await addDoc(collection(db, "memories"), {
    name,
    day,
    text,
    place,
    mood,
    rating,
    photo,
    date: new Date().toLocaleDateString("fr-FR"),
    createdAt: serverTimestamp()
  });

  currentFilter = day;

  document.querySelectorAll(".day-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.day === currentFilter);
  });

  nameInput.value = "";
  daySelect.value = "";
  memoryInput.value = "";
  placeInput.value = "";
  ratingInput.value = "";
  photoInput.value = "";

  addBtn.disabled = false;
  addBtn.textContent = "Ajouter le souvenir";
}

async function deleteMemory(id) {
  await deleteDoc(doc(db, "memories", id));
}

async function clearAllMemories() {
  if (!confirm("Tu veux vraiment tout supprimer ?")) return;

  const snapshot = await getDocs(collection(db, "memories"));

  snapshot.forEach(async (item) => {
    await deleteDoc(doc(db, "memories", item.id));
  });
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

memoriesList.addEventListener("click", (event) => {
  if (!event.target.classList.contains("delete-btn")) return;
  deleteMemory(event.target.dataset.id);
});

addBtn.addEventListener("click", addMemory);
clearBtn.addEventListener("click", clearAllMemories);

const memoriesQuery = query(collection(db, "memories"), orderBy("createdAt", "asc"));

onSnapshot(memoriesQuery, (snapshot) => {
  memories = snapshot.docs.map(docItem => ({
    id: docItem.id,
    ...docItem.data()
  }));

  renderMemories();
});