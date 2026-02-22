/* ==========================================
   MAIN.JS 
========================================== */

const STORAGE_USER = "user_registrado";
const STORAGE_SESSION = "session_activa";

let productos = [];
let modoAuth = "login";

function toast(texto) {
  if (typeof Toastify === "undefined") return;
  Toastify({
    text: texto,
    duration: 1600,
    gravity: "top",
    position: "right",
    close: true
  }).showToast();
}

function leerJSONStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function escribirJSONStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getSession() { return leerJSONStorage(STORAGE_SESSION); }
function setSession(s) { escribirJSONStorage(STORAGE_SESSION, s); }
function clearSession() { localStorage.removeItem(STORAGE_SESSION); }

window.estaLogueado = function () {
  const s = getSession();
  return !!(s && s.email);
};

function actualizarHeaderAuth() {
  const saludo = document.getElementById("user-saludo");
  const btnLogout = document.getElementById("btn-logout");
  const authActions = document.getElementById("auth-actions");

  if (window.estaLogueado()) {
    const s = getSession();
    if (saludo) saludo.textContent = s.email;
    if (btnLogout) btnLogout.classList.remove("hidden");
    if (authActions) authActions.classList.add("hidden");
  } else {
    if (saludo) saludo.textContent = "Invitado";
    if (btnLogout) btnLogout.classList.add("hidden");
    if (authActions) authActions.classList.remove("hidden");
  }
}

function abrirModalAuth(modo) {
  modoAuth = modo;

  const modal = document.getElementById("modal-auth");
  const title = document.getElementById("modal-title");
  const help = document.getElementById("auth-help");
  const submit = document.getElementById("auth-submit");
  const email = document.getElementById("auth-email");
  const pass = document.getElementById("auth-pass");

  if (!modal || !title || !help || !submit || !email || !pass) {
    toast("Falta el modal de autenticación");
    return;
  }

  const user = leerJSONStorage(STORAGE_USER);
  email.value = user?.email ? user.email : "";
  pass.value = "";

  if (modoAuth === "register") {
    title.textContent = "Crear cuenta";
    submit.textContent = "Crear cuenta";
    help.textContent = "Creá tu cuenta para poder comprar.";
  } else {
    title.textContent = "Ingresar";
    submit.textContent = "Ingresar";
    help.textContent = "Ingresá para continuar con tu compra.";
  }

  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}

function cerrarModalAuth() {
  const modal = document.getElementById("modal-auth");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

function validarEmailPass(email, pass) {
  if (!email || !pass) return "Completá email y contraseña.";
  if (!email.includes("@")) return "Ingresá un email válido.";
  if (pass.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
  return "";
}

async function procesarAuth(email, pass) {
  const error = validarEmailPass(email, pass);
  if (error) { toast(error); return false; }

  const user = leerJSONStorage(STORAGE_USER);

  if (modoAuth === "register") {
    if (user && user.email === email) {
      if (typeof Swal !== "undefined") {
        await Swal.fire({ icon: "error", title: "Email ya registrado", text: "Probá ingresando." });
      } else {
        toast("Email ya registrado");
      }
      return false;
    }

    escribirJSONStorage(STORAGE_USER, { email, pass });
    setSession({ email });

    if (typeof Swal !== "undefined") {
      await Swal.fire({ icon: "success", title: "Cuenta creada", text: "Ya podés comprar." });
    } else {
      toast("Cuenta creada");
    }

    actualizarHeaderAuth();
    return true;
  }

  // login
  if (!user || user.email !== email || user.pass !== pass) {
    if (typeof Swal !== "undefined") {
      await Swal.fire({ icon: "error", title: "Datos incorrectos", text: "Revisá email y contraseña." });
    } else {
      toast("Datos incorrectos");
    }
    return false;
  }

  setSession({ email });

  if (typeof Swal !== "undefined") {
    await Swal.fire({ icon: "success", title: "¡Bienvenido!", text: "Sesión iniciada." });
  } else {
    toast("Sesión iniciada");
  }

  actualizarHeaderAuth();
  return true;
}

function crearCardProducto(p) {
  const card = document.createElement("article");
  card.className = "card";

  // Si la imagen no existe, queda el fondo gris (sin onerror)
  const imgSrc = (p.imagen && p.imagen.trim()) ? p.imagen : "";

  card.innerHTML = `
    <img src="${imgSrc}" alt="${p.nombre}">
    <h3>${p.nombre}</h3>
    <p>$${p.precio}</p>
    <button class="btn-agregar" data-id="${p.id}">Agregar al carrito</button>
  `;

  return card;
}

function renderProductos(lista) {
  const cont = document.getElementById("lista-productos");
  if (!cont) return;

  cont.innerHTML = "";
  const frag = document.createDocumentFragment();

  lista.forEach((p) => frag.appendChild(crearCardProducto(p)));

  cont.appendChild(frag);
}

async function obtenerProductos() {
  const cont = document.getElementById("lista-productos");
  if (!cont) return;

  cont.innerHTML = `<p style="color:#6b7280;font-weight:900;">Cargando productos...</p>`;

  try {
    const res = await fetch("data/productos.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("JSON inválido");

    productos = data;
    renderProductos(productos);

  } catch (err) {
    cont.innerHTML = `
      <div style="background:#fff;border-radius:16px;padding:16px;box-shadow:0 10px 30px rgba(0,0,0,0.06);font-weight:900;">
        No se pudo cargar el catálogo.
      </div>
    `;
  } finally {
  }
}

function activarEventosProductos() {
  const cont = document.getElementById("lista-productos");
  if (!cont) return;

  cont.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    if (!t.classList.contains("btn-agregar")) return;

    if (!window.estaLogueado()) {
      toast("Ingresá o creá una cuenta para comprar");
      abrirModalAuth("login");
      return;
    }

    if (typeof agregarAlCarrito !== "function") {
      toast("No se cargó el carrito");
      return;
    }

    const id = Number(t.getAttribute("data-id"));
    const prod = productos.find((p) => p.id === id);
    if (!prod) return;

    agregarAlCarrito(prod);
    toast("Producto agregado 🍼");
  });
}

function activarEventosAuth() {
  const btnLogin = document.getElementById("btn-login");
  const btnRegister = document.getElementById("btn-register");
  const btnLogout = document.getElementById("btn-logout");

  const close = document.getElementById("modal-close");
  const backdrop = document.getElementById("modal-backdrop");
  const form = document.getElementById("form-auth");

  if (btnLogin) btnLogin.addEventListener("click", () => abrirModalAuth("login"));
  if (btnRegister) btnRegister.addEventListener("click", () => abrirModalAuth("register"));

  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      clearSession();
      actualizarHeaderAuth();
      toast("Sesión cerrada");
    });
  }

  if (close) close.addEventListener("click", cerrarModalAuth);
  if (backdrop) backdrop.addEventListener("click", cerrarModalAuth);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarModalAuth();
  });

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("auth-email")?.value.trim();
      const pass = document.getElementById("auth-pass")?.value;
      const ok = await procesarAuth(email, pass);
      if (ok) cerrarModalAuth();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  actualizarHeaderAuth();

  activarEventosAuth();
  activarEventosProductos();

  if (typeof initCarrito === "function") initCarrito();

  obtenerProductos();
});

// expongo funciones por si carrito.js necesita abrir modal
window.abrirModalAuth = abrirModalAuth;