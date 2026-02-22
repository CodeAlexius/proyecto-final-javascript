# ProyectoFinal

## 🍼 Luz de Abril

Este es un proyecto de Ecommerce desarrollado como Proyecto Final del curso de JavaScript.

La aplicación simula una tienda online de ropa para bebés donde el usuario puede registrarse, iniciar sesión, agregar productos al carrito y completar una compra mediante un proceso de checkout interactivo.

Los productos se cargan desde un archivo JSON y la información del usuario y carrito se almacena en LocalStorage.

---

## 🛠 Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript (ES6+)
- Fetch API
- LocalStorage
- SweetAlert2
- Toastify.js
- Live Server (para entorno local)

---

## ⚙ Funcionalidades

- Ver una lista de productos cargados dinámicamente desde JSON
- Crear cuenta e iniciar sesión
- Agregar productos al carrito
- Modificar cantidades
- Eliminar productos del carrito
- Persistencia del carrito en LocalStorage
- Finalizar compra con formulario de dirección y método de pago
- Confirmación de compra con SweetAlert
- Interfaz responsive con drawer de carrito en mobile
- Loader visual mientras cargan los productos

---

## 📦 Instalación

Para ejecutar la aplicación en tu máquina local:

1. Cloná el repositorio.
2. Abrí la carpeta del proyecto.
3. Ejecutá `index.html` con Live Server (recomendado).
4. También podés abrir el archivo directamente en el navegador.

---

## 📁 Estructura del proyecto

Proyecto Final CoderHouse
│
├── index.html
├── README.md
│
├── css/
│ └── style.css
│
├── js/
│ ├── carrito.js
│ └── main.js
│
├── data/
│ └── productos.json
│
└── assets/


---

## 🧠 Funcionamiento

1. Se cargan los productos desde `productos.json` mediante Fetch.
2. Los productos se renderizan dinámicamente en el DOM.
3. El usuario puede registrarse o iniciar sesión.
4. Se agregan productos al carrito.
5. Se calculan totales automáticamente.
6. Se simula el proceso de checkout en múltiples pasos.
7. Se confirma la compra y se vacía el carrito.

El proyecto simula el flujo completo de compra de un Ecommerce real.

---

## 📌 Requisitos cumplidos

- Uso de datos remotos simulados con JSON
- Renderizado dinámico desde JavaScript
- Uso de async / await
- Manejo de errores con try / catch / finally
- Uso de librerías externas en reemplazo de alert/prompt
- Código separado en múltiples archivos JS
- Simulación completa del proceso de compra

---

## 👨‍💻 Autor

Tejada Alejo Nicolas 
Proyecto Final - JavaScript  
Coderhouse
