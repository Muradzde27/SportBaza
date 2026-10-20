// ========== 1. Находим элементы на странице ==========
const themeBtn = document.querySelector("#themeBtn");
const welcome = document.querySelector("#welcome");
const breakServer = document.querySelector("#breakServer");
const loadBtn = document.querySelector("#loadBtn");
const statusText = document.querySelector("#status");
const catalog = document.querySelector("#catalog");
const cartList = document.querySelector("#cartList");
const totalText = document.querySelector("#total");
const clearBtn = document.querySelector("#clearBtn");


// ========== 2. Тёмная тема (localStorage) ==========
// При загрузке страницы проверяем, какую тему выбрали раньше
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
});


// ========== 3. Приветствие один раз (sessionStorage) ==========
if (!sessionStorage.getItem("welcomeShown")) {
  welcome.hidden = false;
  sessionStorage.setItem("welcomeShown", "yes");
}


// ========== 4. «Сервер» ==========
// Сервер присылает товары ТЕКСТОМ в формате JSON
const productsJson = `[
  { "title": "Футбольный мяч", "emoji": "⚽", "price": 35, "inStock": true },
  { "title": "Баскетбольный мяч", "emoji": "🏀", "price": 40, "inStock": true },
  { "title": "Теннисная ракетка", "emoji": "🎾", "price": 60, "inStock": false },
  { "title": "Боксёрские перчатки", "emoji": "🥊", "price": 55, "inStock": true },
  { "title": "Скейтборд", "emoji": "🛹", "price": 90, "inStock": true }
]`;

// Функция возвращает Promise: через 2 секунды
// придёт ответ (resolve) или ошибка (reject)
function getProductsFromServer() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (breakServer.checked) {
        reject(new Error("Сервер не отвечает"));
      } else {
        resolve(productsJson);
      }
    }, 2000);
  });
}


// ========== 5. Корзина (localStorage + JSON) ==========
// Достаём корзину. Если её нет — берём пустой массив
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function showCart() {
  cartList.innerHTML = "";
  let total = 0;

  cart.forEach((product) => {
    cartList.innerHTML += `<li>${product.title} — ${product.price} AZN</li>`;
    total += product.price;
  });

  totalText.textContent = total;
}

function addToCart(product) {
  cart.push(product);
  localStorage.setItem("cart", JSON.stringify(cart)); // массив → строка
  showCart();
}

clearBtn.addEventListener("click", () => {
  cart = [];
  localStorage.removeItem("cart");
  showCart();
});


// ========== 6. Рисуем карточки товаров ==========
function showProducts(products) {
  catalog.innerHTML = "";

  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="emoji">${product.emoji}</div>
      <h3>${product.title}</h3>
      <p class="price">${product.price} AZN</p>
      <p class="stock">${product.inStock ? "✅ В наличии" : "❌ Нет в наличии"}</p>
      <button>В корзину</button>
    `;

    const buyBtn = card.querySelector("button");
    buyBtn.disabled = !product.inStock;
    buyBtn.addEventListener("click", () => addToCart(product));

    catalog.append(card);
  });
}


// ========== 7. Загружаем товары (async / await) ==========
async function loadProducts() {
  statusText.textContent = "⏳ Загрузка...";
  statusText.className = "";
  catalog.innerHTML = "";
  loadBtn.disabled = true;

  try {
    const text = await getProductsFromServer(); // ждём ответ
    const products = JSON.parse(text);           // строка → массив
    showProducts(products);
    statusText.textContent = "";
  } catch (error) {
    statusText.textContent = "Ошибка: " + error.message;
    statusText.className = "error";
  } finally {
    loadBtn.disabled = false; // кнопка снова работает
  }
}

loadBtn.addEventListener("click", loadProducts);


// ========== 8. Старт ==========
showCart();
loadProducts();
