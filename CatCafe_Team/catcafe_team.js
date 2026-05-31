let currentLanguage = "en";

const TRAD_ENG = [
  "Come spend a cozy afternoon at our catcafe, where delicious drinks, sweet treats, and adorable cats are waiting for you! Whether you want to relax, study, read a book, or simply enjoy the company of friendly cats, our café is the perfect place to unwind.",
  "Every visit helps support the well-being of our resident cats and gives them a safe, loving environment while they wait for their forever homes. Bring your friends and experience a warm atmosphere!",
  "Our Socials:",
  "☕ WELCOME TO OUR CATCAFE ☕",
  "Menu of the Day",
  "Meet Our Resident Cats",
  "Age", "Character",
  "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday",
];

const TRAD_ESP = [
  "¡Ven a pasar una tarde acogedora en nuestra cafetería de gatos, donde te esperan deliciosas bebidas, dulces y adorables gatitos! Ya sea que quieras relajarte, estudiar, leer un libro o simplemente disfrutar de la compañía de gatos amigables, nuestra cafetería es el lugar perfecto para desconectar.",
  "Cada visita contribuye al bienestar de nuestros gatos residentes y les brinda un entorno seguro y cariñoso mientras esperan encontrar un hogar definitivo. ¡Trae a tus amigos y vive un ambiente cálido!",
  "Nuestras Redes Sociales:",
  "☕ BIENVENIDOS A NUESTRO CATCAFE ☕",
  "Menú del Día",
  "Conoce a Nuestros Gatos",
  "Edad", "Carácter",
  "Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo",
];

function updateStaticText(trad) {
  const ids = ["paragraph_1","paragraph_2","socials","titulo","menu_title","cats_title"];
  ids.forEach((id, i) => (document.getElementById(id).innerHTML = trad[i]));
  for (let i = 1; i <= 7; i++) {
    document.getElementById("day_" + i).innerText = trad[7 + i]; 
  }
}

function english() {
  currentLanguage = "en";
  updateStaticText(TRAD_ENG);
  loadCats();
  updateMenu();
}

function español() {
  currentLanguage = "es";
  updateStaticText(TRAD_ESP);
  loadCats();
  updateMenu();
}


async function loadCats() {
  try {
    const res  = await fetch("http://localhost:3000/api/cats");
    const cats = await res.json();

    const lang     = currentLanguage === "es" ? "Español" : "English";
    const filtered = cats.filter(c => c.Idioma === lang);

    const grid = document.querySelector(".cat-grid");
    if (!grid) return;
    grid.innerHTML = "";

    const ageLabel  = currentLanguage === "es" ? "Edad"     : "Age";
    const charLabel = currentLanguage === "es" ? "Carácter" : "Character";

    filtered.forEach((cat, i) => {
      const n = i + 1;
      const card = document.createElement("div");
      card.className = "cat-card";
      card.innerHTML = `
        <img src="${cat.CatPicture}" alt="${cat.CatName}">
        <h3 id="cat${n}_name">${cat.CatName}</h3>
        <p><strong><span id="label_age${n}">${ageLabel}</span>:</strong> <span id="cat${n}_age">${cat.CatAge} ${currentLanguage === 'es' ? 'años' : 'years'}</span></p>
        <p><strong><span id="label_char${n}">${charLabel}</span>:</strong> <span id="cat${n}_char">${cat.CatCharacter}</span></p>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    console.error("Error al cargar los gatos:", err);
  }
}


const DEFAULT_IMG =
  "https://digisap.com/wp-content/uploads/2025/07/Transformacion-digital-en-restaurantes_-del-menu-fisico-a-la-automatizacion-1-1024x671.jpg";

let menuData = null;

async function fetchMenuData() {
  if (menuData) return menuData;
  try {
    const res = await fetch("http://localhost:3000/api/food");
    menuData = await res.json();
  } catch (err) {
    console.error("Error al cargar el menú:", err);
    menuData = { en: {}, es: {} };
  }
  return menuData;
}

async function updateMenu() {
  const day          = document.getElementById("daySelector").value || "monday";
  const container    = document.getElementById("menuContainer");
  const imageDisplay = document.getElementById("menu-image-display");

  container.innerHTML = "";
  imageDisplay.src = DEFAULT_IMG;

  const data  = await fetchMenuData();
  const lang  = currentLanguage;
  const items = (data[lang] && data[lang][day]) || [];

  if (items.length === 0) {
    container.innerHTML = "<p>No hay platillos para este día.</p>";
    return;
  }

  items.forEach((item) => {
    const menuItem = document.createElement("div");
    menuItem.className = "menu-item fade-in";
    menuItem.innerHTML = `<span>• ${item.name}</span><span class="dashed"></span><span>${item.price}</span>`;

    menuItem.addEventListener("mouseover", () => {
      imageDisplay.src = item.picture || DEFAULT_IMG;
    });
    menuItem.addEventListener("mouseout", () => {
      imageDisplay.src = DEFAULT_IMG;
    });

    container.appendChild(menuItem);
  });
}

window.onload = () => {
  loadCats();
  updateMenu();
};
