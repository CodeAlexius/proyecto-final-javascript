/* ==========================================
   CARRITO.JS 
========================================== */

const STORAGE_CARRITO = "carrito_luzdeabril";

let carrito = [];

function leerCarrito() {
  try {
    const raw = localStorage.getItem(STORAGE_CARRITO);
    carrito = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(carrito)) carrito = [];
  } catch {
    carrito = [];
  }
}

function guardarCarrito() {
  localStorage.setItem(STORAGE_CARRITO, JSON.stringify(carrito));
}

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

function calcularTotal() {
  return carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
}

function calcularCantidadTotal() {
  return carrito.reduce((acc, item) => acc + item.cantidad, 0);
}

function actualizarTotalesUI() {
  const totalEl = document.getElementById("total");
  const contadorEl = document.getElementById("contador-carrito");
  if (totalEl) totalEl.textContent = calcularTotal();
  if (contadorEl) contadorEl.textContent = calcularCantidadTotal();
}

function renderCarrito() {
  const cont = document.getElementById("carrito-items");
  if (!cont) return;

  cont.innerHTML = "";

  if (carrito.length === 0) {
    cont.innerHTML = `<p class="carrito-vacio">El carrito está vacío</p>`;
    actualizarTotalesUI();
    return;
  }

  const frag = document.createDocumentFragment();

  carrito.forEach((item) => {
    const row = document.createElement("div");
    row.className = "item";
    row.dataset.id = item.id;

    row.innerHTML = `
      <div class="info">
        <span class="nombre">${item.nombre}</span>
        <span class="precio">$${item.precio}</span>
      </div>

      <div class="controls">
        <button class="ctrl btn-menos" type="button" aria-label="Quitar">-</button>
        <span class="qty">${item.cantidad}</span>
        <button class="ctrl btn-mas" type="button" aria-label="Sumar">+</button>
        <button class="remove btn-eliminar" type="button" aria-label="Eliminar">×</button>
      </div>

      <div class="subtotal">$${item.precio * item.cantidad}</div>
    `;

    frag.appendChild(row);
  });

  cont.appendChild(frag);
  actualizarTotalesUI();
}

function agregarAlCarrito(producto) {
  const encontrado = carrito.find((p) => p.id === producto.id);
  if (encontrado) {
    encontrado.cantidad += 1;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1
    });
  }

  guardarCarrito();
  renderCarrito();
}

function vaciarCarrito() {
  carrito = [];
  guardarCarrito();
  renderCarrito();
}

function eliminarItem(id) {
  carrito = carrito.filter((p) => p.id !== id);
  guardarCarrito();
  renderCarrito();
}

function sumarCantidad(id) {
  const item = carrito.find((p) => p.id === id);
  if (!item) return;
  item.cantidad += 1;
  guardarCarrito();
  renderCarrito();
}

function restarCantidad(id) {
  const item = carrito.find((p) => p.id === id);
  if (!item) return;

  item.cantidad -= 1;
  if (item.cantidad <= 0) {
    eliminarItem(id);
    return;
  }

  guardarCarrito();
  renderCarrito();
}

async function confirmarVaciar() {
  if (typeof Swal === "undefined") {
    vaciarCarrito();
    return;
  }

  const res = await Swal.fire({
    icon: "warning",
    title: "¿Vaciar carrito?",
    text: "Se eliminarán todos los productos.",
    showCancelButton: true,
    confirmButtonText: "Sí, vaciar",
    cancelButtonText: "Cancelar"
  });

  if (res.isConfirmed) {
    vaciarCarrito();
    toast("Carrito vaciado");
  }
}

async function finalizarCompra() {
  try {
    if (typeof window.estaLogueado === "function" && !window.estaLogueado()) {
      toast("Ingresá o creá una cuenta para comprar");
      if (typeof window.abrirModalAuth === "function") window.abrirModalAuth("login");
      return;
    }

    if (carrito.length === 0) {
      toast("Tu carrito está vacío");
      return;
    }

    const total = calcularTotal();

    if (typeof Swal === "undefined") {
      vaciarCarrito();
      toast("Compra finalizada");
      return;
    }

    const res = await Swal.fire({
      icon: "question",
      title: "Confirmar compra",
      html: `Total a pagar: <b>$${total}</b>`,
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar"
    });

    if (!res.isConfirmed) return;

    await Swal.fire({
      icon: "success",
      title: "¡Compra realizada!",
      text: "Gracias por tu compra 💖"
    });

    vaciarCarrito();

  } catch (err) {
    if (typeof Swal !== "undefined") {
      await Swal.fire({
        icon: "error",
        title: "Ocurrió un error",
        text: err?.message || "Error inesperado"
      });
    }
  } finally {
  }
}

function initCarrito() {
  leerCarrito();
  renderCarrito();

  const cont = document.getElementById("carrito-items");
  const btnVaciar = document.getElementById("vaciar-carrito");
  const btnFinalizar = document.getElementById("finalizar-compra");
  const btnAbrir = document.getElementById("btn-carrito");
  const btnCerrar = document.getElementById("cerrar-carrito");
  const panel = document.getElementById("panel-carrito");

  if (btnVaciar) btnVaciar.addEventListener("click", confirmarVaciar);
  if (btnFinalizar) btnFinalizar.addEventListener("click", finalizarCompra);

  if (btnAbrir && panel) btnAbrir.addEventListener("click", () => panel.scrollIntoView({ behavior: "smooth", block: "start" }));
  if (btnCerrar && panel) btnCerrar.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  if (cont) {
    cont.addEventListener("click", (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;

      const row = t.closest(".item");
      if (!row) return;

      const id = Number(row.dataset.id);

      if (t.classList.contains("btn-mas")) {
        sumarCantidad(id);
        return;
      }

      if (t.classList.contains("btn-menos")) {
        restarCantidad(id);
        return;
      }

      if (t.classList.contains("btn-eliminar")) {
        eliminarItem(id);
        toast("Producto eliminado");
        return;
      }
    });
  }
}