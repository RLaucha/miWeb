/* ===== Datos de productos (puedes ampliarlos o cargarlos desde JSON) ===== */
const PRODUCTOS = [
  {
    id: "x1",
    nombre: "Paleta Pro X1",
    descripcion: "Potencia y control para jugadores avanzados.",
    precio: 45000,
    img: "img/pro-x1.png.png"
  },
  {
    id: "ls",
    nombre: "Paleta Light Speed",
    descripcion: "Ligera y manejable, ideal para principiantes.",
    precio: 30000,
    img: "img/light-speed.png.png"
  },
  {
    id: "cp",
    nombre: "Paleta Carbon Pro",
    descripcion: "Construcción de carbono para máxima durabilidad.",
    precio: 50000,
    img: "img/pro-x1.png.png"
  },
  {
    id: "cm",
    nombre: "Paleta Control Max",
    descripcion: "Precisión y control en cada golpe.",
    precio: 40000,
    img: "img/light-speed.png.png"
  }
];


/* ===== Helpers de localStorage ===== */
function leerCarrito(){
  return JSON.parse(localStorage.getItem("carrito_v1")) || [];
}
function guardarCarrito(carrito){
  localStorage.setItem("carrito_v1", JSON.stringify(carrito));
}

/* ===== Contador en el header ===== */
function actualizarBadge(){
  const carrito = leerCarrito();
  const count = carrito.reduce((s, it) => s + (it.cantidad || 1), 0);
  const el = document.querySelectorAll(".cart-count");
  el.forEach(e => e.innerText = count);
}

/* ===== Funciones para tienda ===== */
function agregarAlCarrito(productId, cantidad = 1){
  let carrito = leerCarrito();
  const prod = PRODUCTOS.find(p => p.id === productId);
  if(!prod) return;
  // si ya existe, sumar cantidad
  const idx = carrito.findIndex(i => i.id === productId);
  if(idx >= 0){
    carrito[idx].cantidad = (carrito[idx].cantidad || 1) + Number(cantidad);
  } else {
    carrito.push({
      id: prod.id,
      nombre: prod.nombre,
      precio: prod.precio,
      img: prod.img,
      cantidad: Number(cantidad)
    });
  }
  guardarCarrito(carrito);
  actualizarBadge();
  // feedback más amigable que alert
  toast(`${prod.nombre} agregado al carrito`);
}

/* ===== Mostrar Toaster pequeño ===== */
function toast(msg){
  const t = document.createElement("div");
  t.innerText = msg;
  t.style.position = "fixed";
  t.style.right = "20px";
  t.style.bottom = "20px";
  t.style.background = "rgba(2,6,23,0.9)";
  t.style.color = "white";
  t.style.padding = "10px 14px";
  t.style.borderRadius = "10px";
  t.style.zIndex = 9999;
  t.style.boxShadow = "0 6px 20px rgba(2,6,23,0.16)";
  document.body.appendChild(t);
  setTimeout(()=> t.remove(),1800);
}

/* ===== Render tienda (si existe contenedor) ===== */
function renderTienda(){
  const cont = document.getElementById("productos-grid");
  if(!cont) return;
  cont.innerHTML = "";
  PRODUCTOS.forEach(p => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <img src="${p.img}" alt="${p.nombre}">
      <div>
        <h3 style="margin:8px 0 6px 0">${p.nombre}</h3>
        <p class="small">${p.descripcion}</p>
        <div class="meta" style="margin-top:8px">
          <div class="price">$${p.precio.toLocaleString('es-AR')}</div>
        </div>
      </div>

      <div style="display:flex;gap:8px;align-items:center;margin-top:10px">
        <input type="number" min="1" value="1" id="qty-${p.id}" style="width:80px;padding:8px;border-radius:8px;border:1px solid #e6eef0">
        <button class="btn" onclick="agregarAlCarrito('${p.id}', document.getElementById('qty-${p.id}').value)">Agregar</button>
      </div>
    `;
    cont.appendChild(div);
  });
}

/* ===== Carrito: render, modificar cantidades, eliminar ===== */
function renderCarrito(){
  const cont = document.getElementById("carrito-lista");
  if(!cont) return;
  const carrito = leerCarrito();
  cont.innerHTML = "";
  if(carrito.length === 0){
    cont.innerHTML = `<div class="card"><p>Tu carrito está vacío.</p></div>`;
    document.getElementById("carrito-total").innerText = "0";
    actualizarBadge();
    return;
  }

  let total = 0;
  carrito.forEach((item, index) => {
    total += (item.precio * item.cantidad);
    const node = document.createElement("div");
    node.className = "cart-item";
    node.innerHTML = `
      <div class="left">
        <img src="${item.img}" alt="${item.nombre}">
        <div>
          <div style="font-weight:700">${item.nombre}</div>
          <div class="small">$${item.precio.toLocaleString('es-AR')} c/u</div>
        </div>
      </div>

      <div style="display:flex;align-items:center;gap:12px">
        <input type="number" min="1" value="${item.cantidad}" class="qty-input" data-index="${index}">
        <div style="min-width:110px;text-align:right;font-weight:700">$${(item.precio*item.cantidad).toLocaleString('es-AR')}</div>
        <button class="btn secondary" data-remove="${index}">Eliminar</button>
      </div>
    `;
    cont.appendChild(node);
  });

  document.getElementById("carrito-total").innerText = total.toLocaleString('es-AR');

  // listeners para inputs y botones
  cont.querySelectorAll(".qty-input").forEach(inp => {
    inp.addEventListener("change", (e) => {
      const idx = Number(e.target.dataset.index);
      const val = Math.max(1, Number(e.target.value) || 1);
      const carrito = leerCarrito();
      carrito[idx].cantidad = val;
      guardarCarrito(carrito);
      renderCarrito();
      actualizarBadge();
    });
  });

  cont.querySelectorAll("[data-remove]").forEach(b => {
    b.addEventListener("click", (e) => {
      const idx = Number(e.target.dataset.remove);
      let carrito = leerCarrito();
      carrito.splice(idx,1);
      guardarCarrito(carrito);
      renderCarrito();
      actualizarBadge();
      toast("Producto eliminado");
    });
  });
}

/* ===== Vaciar carrito ===== */
function vaciarCarrito(){
  if(!confirm("¿Querés vaciar el carrito?")) return;
  localStorage.removeItem("carrito_v1");
  renderCarrito();
  actualizarBadge();
}

/* ===== Checkout: simular envío de orden ===== */
function enviarOrden(e){
  e.preventDefault();
  const nombre = document.getElementById("c-nombre").value.trim();
  const email  = document.getElementById("c-email").value.trim();
  const direccion = document.getElementById("c-direccion").value.trim();
  if(!nombre || !email){
    alert("Completá nombre y email para continuar.");
    return;
  }
  const carrito = leerCarrito();
  if(carrito.length === 0){
    alert("El carrito está vacío.");
    return;
  }
  const total = carrito.reduce((s,i) => s + i.precio*i.cantidad, 0);
  // guardamos orden en localStorage como simulación de backend
  const ordenes = JSON.parse(localStorage.getItem("ordenes_v1") || "[]");
  const nueva = {
    id: "ORD-" + Date.now(),
    nombre, email, direccion,
    items: carrito,
    total,
    fecha: new Date().toISOString()
  };
  ordenes.push(nueva);
  localStorage.setItem("ordenes_v1", JSON.stringify(ordenes));

  // vaciar carrito
  localStorage.removeItem("carrito_v1");
  actualizarBadge();
  // redirigir a página de gracias (o mostrar mensaje)
  window.location.href = "checkout.html?success=1&orderId=" + nueva.id;
}

/* ===== Mostrar resumen en checkout (lado derecho) ===== */
function renderResumenCheckout(){
  const cont = document.getElementById("resumen-pedido");
  if(!cont) return;
  const carrito = leerCarrito();
  if(carrito.length === 0){
    cont.innerHTML = `<div class="card"><p>No hay productos en el carrito.</p></div>`;
    document.getElementById("resumen-total") && (document.getElementById("resumen-total").innerText = "0");
    return;
  }
  let total = 0;
  cont.innerHTML = "";
  carrito.forEach(it => {
    total += it.precio * it.cantidad;
    const el = document.createElement("div");
    el.style.display = "flex";
    el.style.justifyContent = "space-between";
    el.style.marginBottom = "8px";
    el.innerHTML = `<div>${it.nombre} x${it.cantidad}</div><div>$${(it.precio*it.cantidad).toLocaleString('es-AR')}</div>`;
    cont.appendChild(el);
  });
  document.getElementById("resumen-total").innerText = total.toLocaleString('es-AR');
}

/* ===== Init: on DOM ready ===== */
document.addEventListener("DOMContentLoaded", () => {
  actualizarBadge();
  renderTienda();
  renderCarrito();
  renderResumenCheckout();

  // si estamos en checkout y viene success
  if(window.location.pathname.includes("checkout.html")){
    const params = new URLSearchParams(location.search);
    if(params.get("success") === "1"){
      const id = params.get("orderId");
      document.getElementById("checkout-main").innerHTML = `
        <div class="card">
          <h2>¡Gracias! Orden enviada</h2>
          <p>Tu orden <strong>${id}</strong> fue registrada. Te enviamos un email (simulado).</p>
          <p class="small">Pronto nos contactamos para coordinar envío/pago.</p>
          <a href="index.html" class="btn">Volver al inicio</a>
        </div>
      `;
    }
  }

  // hook formulario checkout
  const form = document.getElementById("checkout-form");
  if(form) form.addEventListener("submit", enviarOrden);

  // Vaciar carrito si hay botón con id vaciar
  const vacBtn = document.getElementById("vaciar-btn");
  if(vacBtn) vacBtn.addEventListener("click", vaciarCarrito);
});
