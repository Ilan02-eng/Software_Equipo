let currentLanguage = "en";

const TRAD_ENG = [
  "Come spend a cozy afternoon at our catcafe, where delicious drinks, sweet treats, and adorable cats are waiting for you! Whether you want to relax, study, read a book, or simply enjoy the company of friendly cats, our café is the perfect place to unwind.",
  "Every visit helps support the well-being of our resident cats and gives them a safe, loving environment while they wait for their forever homes. Bring your friends and experience a warm atmosphere!",
  "Our Socials:",
  "☕ WELCOME TO OUR CATCAFE ☕",
  "Menu of the Day",
  "Meet Our Resident Cats",
  "Whiskey",
  "Calm & Affectionate",
  "3 years",
  "Shadow",
  "Mysterious & Playful",
  "1 year",
  "Bigotes",
  "Chatty & Energetic",
  "4 years",
  "Fluffy",
  "Sweet & Curious",
  "6 months",
  "Mango",
  "Gentle & Shy",
  "2 years",
  "Age",
  "Character",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TRAD_ESP = [
  "¡Ven a pasar una tarde acogedora en nuestra cafetería de gatos, donde te esperan deliciosas bebidas, dulces y adorables gatitos! Ya sea que quieras relajarte, estudiar, leer un libro o simplemente disfrutar de la compañía de gatos amigables, nuestra cafetería es el lugar perfecto para desconectar.",
  "Cada visita contribuye al bienestar de nuestros gatos residentes y les brinda un entorno seguro y cariñoso mientras esperan encontrar un hogar definitivo. ¡Trae a tus amigos y vive un ambiente cálido!",
  "Nuestras Redes Sociales:",
  "☕ BIENVENIDOS A NUESTRO CATCAFE ☕",
  "Menú del Día",
  "Conoce a Nuestros Gatos",
  "Whiskey",
  "Tranquilo & Cariñoso",
  "3 años",
  "Shadow",
  "Misterioso & Juguetón",
  "1 año",
  "Bigotes",
  "Platicador & Energético",
  "4 años",
  "Fluffy",
  "Dulce & Curiosa",
  "6 meses",
  "Mango",
  "Gentil & Tímido",
  "2 años",
  "Edad",
  "Carácter",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

function english() {
  currentLanguage = "en";
  const ids = [
    "paragraph_1",
    "paragraph_2",
    "socials",
    "titulo",
    "menu_title",
    "cats_title",
  ];
  ids.forEach((id, i) => (document.getElementById(id).innerHTML = TRAD_ENG[i]));

  document.getElementById("cat1_name").innerText = TRAD_ENG[6];
  document.getElementById("cat1_char").innerText = TRAD_ENG[7];
  document.getElementById("cat1_age").innerText = TRAD_ENG[8];
  document.getElementById("cat2_name").innerText = TRAD_ENG[9];
  document.getElementById("cat2_char").innerText = TRAD_ENG[10];
  document.getElementById("cat2_age").innerText = TRAD_ENG[11];
  document.getElementById("cat3_name").innerText = TRAD_ENG[12];
  document.getElementById("cat3_char").innerText = TRAD_ENG[13];
  document.getElementById("cat3_age").innerText = TRAD_ENG[14];
  document.getElementById("cat4_name").innerText = TRAD_ENG[15];
  document.getElementById("cat4_char").innerText = TRAD_ENG[16];
  document.getElementById("cat4_age").innerText = TRAD_ENG[17];
  document.getElementById("cat5_name").innerText = TRAD_ENG[18];
  document.getElementById("cat5_char").innerText = TRAD_ENG[19];
  document.getElementById("cat5_age").innerText = TRAD_ENG[20];

  for (let i = 1; i <= 5; i++) {
    document.getElementById("label_age" + i).innerText = TRAD_ENG[21];
    document.getElementById("label_char" + i).innerText = TRAD_ENG[22];
  }

  for (let i = 1; i <= 7; i++) {
    document.getElementById("day_" + i).innerText = TRAD_ENG[22 + i];
  }

  updateMenu();
}

function español() {
  currentLanguage = "es";
  const ids = [
    "paragraph_1",
    "paragraph_2",
    "socials",
    "titulo",
    "menu_title",
    "cats_title",
  ];
  ids.forEach((id, i) => (document.getElementById(id).innerHTML = TRAD_ESP[i]));

  document.getElementById("cat1_name").innerText = TRAD_ESP[6];
  document.getElementById("cat1_char").innerText = TRAD_ESP[7];
  document.getElementById("cat1_age").innerText = TRAD_ESP[8];
  document.getElementById("cat2_name").innerText = TRAD_ESP[9];
  document.getElementById("cat2_char").innerText = TRAD_ESP[10];
  document.getElementById("cat2_age").innerText = TRAD_ESP[11];
  document.getElementById("cat3_name").innerText = TRAD_ESP[12];
  document.getElementById("cat3_char").innerText = TRAD_ESP[13];
  document.getElementById("cat3_age").innerText = TRAD_ESP[14];
  document.getElementById("cat4_name").innerText = TRAD_ESP[15];
  document.getElementById("cat4_char").innerText = TRAD_ESP[16];
  document.getElementById("cat4_age").innerText = TRAD_ESP[17];
  document.getElementById("cat5_name").innerText = TRAD_ESP[18];
  document.getElementById("cat5_char").innerText = TRAD_ESP[19];
  document.getElementById("cat5_age").innerText = TRAD_ESP[20];

  for (let i = 1; i <= 5; i++) {
    document.getElementById("label_age" + i).innerText = TRAD_ESP[21];
    document.getElementById("label_char" + i).innerText = TRAD_ESP[22];
  }

  for (let i = 1; i <= 7; i++) {
    document.getElementById("day_" + i).innerText = TRAD_ESP[22 + i];
  }

  updateMenu();
}

const DEFAULT_IMG =
  "https://digisap.com/wp-content/uploads/2025/07/Transformacion-digital-en-restaurantes_-del-menu-fisico-a-la-automatizacion-1-1024x671.jpg";

const dailyMenus = {
  monday: [
    {
      name_en: "Matcha Latte",
      name_es: "Latte de Matcha",
      price: "$59",
      img: "https://www.recetasnestlecam.com/sites/default/files/srh_recipes/d25b198c592bdad94cf2902ff4e5634d.jpg",
    },
    {
      name_en: "Tuna Sandwich",
      name_es: "Sándwich de Atún",
      price: "$99",
      img: "https://mojo.generalmills.com/api/public/content/iCXFwJd80U6TMhTZKYyA-w_gmi_hi_res_jpeg.jpeg?v=86a29367&t=466b54bb264e48b199fc8e83ef1136b4",
    },
    {
      name_en: "Chocolate Milkshake",
      name_es: "Malteada de Chocolate",
      price: "$65",
      img: "https://cdn7.kiwilimon.com/recetaimagen/37834/640x640/48042.jpg.jpg",
    },
  ],
  tuesday: [
    {
      name_en: "Pancakes",
      name_es: "Panqueques",
      price: "$89",
      img: "https://assets.tmecosys.com/image/upload/t_web_rdp_recipe_584x480_1_5x/img/recipe/ras/Assets/4c0b128e-9851-4c56-84bd-e8368157948c/Derivates/130a57d2-0318-4dea-83e0-a3e908e67133.jpg",
    },
    {
      name_en: "Espresso",
      name_es: "Cafe Espresso",
      price: "$55",
      img: "https://www.sharmispassions.com/wp-content/uploads/2012/07/espresso-coffee-recipe04-500x375.jpg",
    },
    {
      name_en: "Chocolate Chip Cookie",
      name_es: "Galleta de Chispas de Chocolate",
      price: "$29",
      img: "https://cdn7.kiwilimon.com/recetaimagen/3329/960x640/38990.jpg.jpg",
    },
  ],
  wednesday: [
    {
      name_en: "Macarons",
      name_es: "Macarrones",
      price: "$49",
      img: "https://imgmedia.buenazo.pe/970x533/buenazo/original/2020/10/26/5f970a772f64783bc0287eba.webp",
    },
    {
      name_en: "Tea",
      name_es: "Té",
      price: "$30",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxhrNf622wZbBDsr2xkujdCHZOW4nuGLF7-Q&s",
    },
    {
      name_en: "Cheescake",
      name_es: "Pastel de Queso",
      price: "$79",
      img: "https://i.blogs.es/550ed3/cheesecake/450_1000.jpg",
    },
  ],
  thursday: [
    {
      name_en: "Croissant",
      name_es: "Croissant",
      price: "$39",
      img: "https://es.cravingsjournal.com/wp-content/uploads/2024/04/croissant-tiramisu-1.jpg",
    },
    {
      name_en: "Vanilla Milkshake",
      name_es: "Malteada de Vainilla",
      price: "$65",
      img: "https://dgari.com/wp-content/uploads/2024/04/malteada-de-vainilla-y-caramelo.jpg",
    },
    {
      name_en: "Avocado Toast",
      name_es: "tostada de Aguacate",
      price: "$59",
      img: "https://www.rootsandradishes.com/wp-content/uploads/2017/08/avocado-toast-with-everything-bagel-seasoning-feat.jpg",
    },
  ],
  friday: [
    {
      name_en: "Waffles",
      name_es: "Waffles",
      price: "$79",
      img: "https://assets.tmecosys.com/image/upload/t_web_rdp_recipe_584x480/img/recipe/ras/Assets/c6ea15c4-52ab-4119-b886-a7fb1d052f45/Derivates/b18fcddc-3b31-4ae9-9cd1-5a81751d91b3.jpg",
    },
    {
      name_en: "Cat-puccino",
      name_es: "Cat-puccino",
      price: "$59",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSW8xHOZA9fxl5Sc0JxaRcRFNbKQVJBhEGfug&s",
    },
    {
      name_en: "French Toast",
      name_es: "Pan Francés",
      price: "$39",
      img: "https://www.chilitochoc.com/wp-content/uploads/2025/04/buttermilk-french-toast-recipe-500x375.jpg",
    },
  ],
  saturday: [
    {
      name_en: "Chocolate Cake",
      name_es: "Pastel de Chocolate",
      price: "$89",
      img: "https://www.cocinadelirante.com/sites/default/files/images/2020/03/como-hacer-pastel-de-chocolate-con-cerveza-y-betun.jpg",
    },
    {
      name_en: "Strawberry Lemonade",
      name_es: "Limonada de Fresa",
      price: "$35",
      img: "https://i.ytimg.com/vi/IGPMktOdlT8/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLClvN1caJQDQwYx2wFFIa7d30n6Ng",
    },
    {
      name_en: "Lemonade",
      name_es: "Limonada",
      price: "$35",
      img: "https://www.texanerin.com/content/uploads/2014/08/honey-lemonade-2.jpg",
    },
  ],
  sunday: [
    {
      name_en: "Brownie with Icecream",
      name_es: "Brownie con Helado",
      price: "$60",
      img: "https://mandolina.co/wp-content/uploads/2020/11/brownie-con-helado-destacada.jpg",
    },
    {
      name_en: "Hot Chocolate",
      name_es: "Chocolate Caliente",
      price: "$49",
      img: "https://www.novachef.es/media/images/chocolate-caliente-especias.jpg",
    },
    {
      name_en: "Manju",
      name_es: "Manju",
      price: "$35",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSg2Q0aLUXtJKVCXecsPWl2arVD1vbWdD6R4A&s",
    },
  ],
};

function updateMenu() {
  const day = document.getElementById("daySelector").value || "monday";
  const container = document.getElementById("menuContainer");
  const imageDisplay = document.getElementById("menu-image-display");

  container.innerHTML = "";

  imageDisplay.src = DEFAULT_IMG;

  dailyMenus[day].forEach((item) => {
    const menuItem = document.createElement("div");
    menuItem.className = "menu-item fade-in";

    const itemName = currentLanguage === "es" ? item.name_es : item.name_en;
    menuItem.innerHTML = `<span>• ${itemName}</span><span class="dashed"></span><span>${item.price}</span>`;

    menuItem.addEventListener("mouseover", () => {
      imageDisplay.src = item.img;
    });

    menuItem.addEventListener("mouseout", () => {
      imageDisplay.src = DEFAULT_IMG;
    });

    container.appendChild(menuItem);
  });
}

window.onload = updateMenu;
