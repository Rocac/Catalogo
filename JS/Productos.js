"use strict";

document.addEventListener("DOMContentLoaded", () => {
  let productos = [];

  /* =========================================
     ELEMENTOS DEL HTML
  ========================================= */

  const filtersForm = document.getElementById("filtersForm");
  const productSearch = document.getElementById("productSearch");
  const categoryFilter = document.getElementById("categoryFilter");
  const typeFilter = document.getElementById("typeFilter");
  const standardFilter = document.getElementById("standardFilter");

  const initialMessage = document.getElementById("initialMessage");
  const resultsText = document.getElementById("resultsText");
  const noResultsMessage = document.getElementById("noResultsMessage");
  const errorMessage = document.getElementById("errorMessage");
  const productsGrid = document.getElementById("productsGrid");

  const menuBtn = document.getElementById("menuBtn");
  const closeMenu = document.getElementById("closeMenu");
  const sideMenu = document.getElementById("sideMenu");
  const menuOverlay = document.getElementById("menuOverlay");

  /* =========================================
     VALIDAR ELEMENTOS
  ========================================= */

  if (
    !filtersForm ||
    !productSearch ||
    !categoryFilter ||
    !typeFilter ||
    !productsGrid
  ) {
    console.error(
      "Faltan elementos necesarios en productos.html. Revisa los IDs."
    );

    return;
  }

  /* =========================================
     UTILIDADES
  ========================================= */

  function normalizar(texto) {
    return String(texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[”“"]/g, "")
      .replace(/½/g, "1/2")
      .replace(/\s+/g, " ")
      .trim();
  }

  function escaparHTML(valor) {
    return String(valor ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function obtenerRutaImagen(producto) {
    if (!producto.imagen) {
      return "";
    }

    const imagen = String(producto.imagen);

    if (
      imagen.startsWith("http://") ||
      imagen.startsWith("https://") ||
      imagen.startsWith("./") ||
      imagen.startsWith("/")
    ) {
      return imagen;
    }

    return `./img/${imagen}`;
  }

  function obtenerClaseCategoria(categoria) {
    const categoriaNormalizada = normalizar(categoria);

    switch (categoriaNormalizada) {
      case "agua":
        return "product-category-tag--agua";

      case "alcantarillado":
        return "product-category-tag--alcantarillado";

      case "electrico":
      case "electrica":
        return "product-category-tag--electrico";

      case "desague":
      default:
        return "product-category-tag--desague";
    }
  }

  function obtenerIconoCategoria(categoria) {
    const categoriaNormalizada = normalizar(categoria);

    switch (categoriaNormalizada) {
      case "agua":
        return "≋";

      case "alcantarillado":
        return "⌞";

      case "electrico":
      case "electrica":
        return "⚡";

      case "desague":
      default:
        return "≋";
    }
  }

  /* =========================================
     ESTADOS
  ========================================= */

  function mostrarEstadoInicial() {
    productsGrid.innerHTML = "";

    if (initialMessage) {
      initialMessage.hidden = false;
      initialMessage.style.display = "";
    }

    if (resultsText) {
      resultsText.hidden = true;
      resultsText.textContent = "";
    }

    if (noResultsMessage) {
      noResultsMessage.hidden = true;
    }

    if (errorMessage) {
      errorMessage.hidden = true;
    }
  }

  function mostrarError(mensaje) {
    productsGrid.innerHTML = "";

    if (initialMessage) {
      initialMessage.hidden = true;
    }

    if (resultsText) {
      resultsText.hidden = true;
    }

    if (noResultsMessage) {
      noResultsMessage.hidden = true;
    }

    if (errorMessage) {
      errorMessage.hidden = false;

      errorMessage.innerHTML = `
        <h2>No se pudieron cargar los productos</h2>
        <p>${escaparHTML(mensaje)}</p>
      `;
    }
  }

  /* =========================================
     CARGAR PRODUCTOS
  ========================================= */

  async function cargarProductos() {
    try {
      const respuesta = await fetch("./Data/Productos.json");

      if (!respuesta.ok) {
        throw new Error(
          `No se encontró Productos.json. Código ${respuesta.status}.`
        );
      }

      const datos = await respuesta.json();

      if (!Array.isArray(datos)) {
        throw new Error(
          "Productos.json debe contener una lista de productos."
        );
      }

      productos = datos;

      console.log(
        `Se cargaron ${productos.length} productos.`,
        productos
      );

      aplicarFiltrosDesdeURL();
    } catch (error) {
      console.error("Error cargando productos:", error);
      mostrarError(error.message);
    }
  }

  /* =========================================
   FILTROS RECIBIDOS DESDE LA URL
========================================= */

function aplicarFiltrosDesdeURL() {
  const parametrosURL = new URLSearchParams(
    window.location.search
  );

  const categoriaURL = parametrosURL.get("categoria");
  const busquedaURL = parametrosURL.get("buscar");
  const tipoURL = parametrosURL.get("tipo");
  const normaURL = parametrosURL.get("norma");

  let hayFiltrosEnURL = false;

  if (categoriaURL && categoryFilter) {
    const opcionCategoria = Array.from(
      categoryFilter.options
    ).find((opcion) => {
      return normalizar(opcion.value) ===
        normalizar(categoriaURL);
    });

    if (opcionCategoria) {
      categoryFilter.value = opcionCategoria.value;
      hayFiltrosEnURL = true;
    }
  }

  if (busquedaURL && productSearch) {
    productSearch.value = busquedaURL;
    hayFiltrosEnURL = true;
  }

  if (tipoURL && typeFilter) {
    const opcionTipo = Array.from(
      typeFilter.options
    ).find((opcion) => {
      return normalizar(opcion.value) ===
        normalizar(tipoURL);
    });

    if (opcionTipo) {
      typeFilter.value = opcionTipo.value;
      hayFiltrosEnURL = true;
    }
  }

  if (normaURL && standardFilter) {
    const opcionNorma = Array.from(
      standardFilter.options
    ).find((opcion) => {
      return normalizar(opcion.value) ===
        normalizar(normaURL);
    });

    if (opcionNorma) {
      standardFilter.value = opcionNorma.value;
      hayFiltrosEnURL = true;
    }
  }

  if (hayFiltrosEnURL) {
    filtersForm.requestSubmit();
  } else {
    mostrarEstadoInicial();
  }
}

  /* =========================================
     FILTRO DE CATEGORÍA
  ========================================= */

  function coincideCategoria(producto, categoriaSeleccionada) {
    if (!categoriaSeleccionada) {
      return true;
    }

    const categoriaProducto = normalizar(producto.categoria);
    const lineaProducto = normalizar(producto.linea);

    if (categoriaSeleccionada === "desague") {
      return categoriaProducto === "desague";
    }

    if (categoriaSeleccionada === "alcantarillado") {
      return categoriaProducto === "alcantarillado";
    }

    if (categoriaSeleccionada === "agua-inyectados") {
      return (
        categoriaProducto === "agua" &&
        ["in", "iny", "inyectado", "inyectados"].includes(
          lineaProducto
        )
      );
    }

    if (categoriaSeleccionada === "electrico-inyectados") {
      return (
        ["electrico", "electrica"].includes(categoriaProducto) &&
        ["in", "iny", "inyectado", "inyectados"].includes(
          lineaProducto
        )
      );
    }

    if (categoriaSeleccionada === "agua-termoformados") {
      return (
        categoriaProducto === "agua" &&
        (
          lineaProducto === "ter" ||
          lineaProducto.includes("termoformado")
        )
      );
    }

    if (categoriaSeleccionada === "electrico-termoformados") {
      return (
        ["electrico", "electrica"].includes(categoriaProducto) &&
        (
          lineaProducto === "ter" ||
          lineaProducto.includes("termoformado")
        )
      );
    }

    return categoriaProducto === categoriaSeleccionada;
  }

  /* =========================================
     FILTRO DE TIPO
  ========================================= */

  function obtenerTipoNormalizado(producto) {
    const tipo = normalizar(producto.tipo);
    const nombre = normalizar(producto.nombre);

    if (
      tipo.includes("tee sanitaria") ||
      nombre.includes("tee sanitaria")
    ) {
      return "tee-sanitaria";
    }

    if (
      tipo.includes("sombrero de ventilacion") ||
      nombre.includes("sombrero de ventilacion")
    ) {
      return "sombrero-de-ventilacion";
    }

    if (
      tipo.includes("codo ventilacion") ||
      nombre.includes("codo ventilacion")
    ) {
      return "codo";
    }

    if (tipo.includes("reduccion")) {
      return "reduccion";
    }

    if (tipo.includes("tapon")) {
      return "tapon";
    }

    if (tipo.includes("union")) {
      return "union";
    }

    if (tipo.includes("yee")) {
      return "yee";
    }

    if (tipo.includes("tee")) {
      return "tee";
    }

    if (tipo.includes("codo")) {
      return "codo";
    }

    if (tipo.includes("adaptador")) {
      return "adaptador";
    }

    if (tipo.includes("conector")) {
      return "conector";
    }

    if (tipo.includes("curva")) {
      return "curva";
    }

    if (tipo.includes("caja")) {
      return "caja";
    }

    return tipo;
  }

  function coincideTipo(producto, tipoSeleccionado) {
    if (!tipoSeleccionado) {
      return true;
    }

    return obtenerTipoNormalizado(producto) === tipoSeleccionado;
  }

  /* =========================================
     FILTRO DE NORMA
  ========================================= */

  function coincideNorma(producto, normaSeleccionada) {
    if (!normaSeleccionada) {
      return true;
    }

    const normasProducto = Array.isArray(producto.normas)
      ? producto.normas.join(" ")
      : producto.norma ||
        producto.estandar ||
        producto.standard ||
        "";

    return normalizar(normasProducto).includes(normaSeleccionada);
  }

  /* =========================================
     BUSCAR PRODUCTOS
  ========================================= */

  function buscarProductos(evento) {
    evento.preventDefault();

    if (productos.length === 0) {
      mostrarError(
        "No hay productos cargados. Revisa Productos.json."
      );

      return;
    }

    const textoBuscado = normalizar(productSearch.value);
    const categoriaSeleccionada = normalizar(
      categoryFilter.value
    );
    const tipoSeleccionado = normalizar(typeFilter.value);
    const normaSeleccionada = standardFilter
      ? normalizar(standardFilter.value)
      : "";

    const resultados = productos.filter((producto) => {
      const contenidoProducto = normalizar(
        [
          producto.nombre,
          producto.descripcion,
          producto.tipo,
          producto.categoria,
          producto.codigo,
          producto.diametro,
          producto.serie
        ].join(" ")
      );

      const coincideTexto =
        textoBuscado === "" ||
        contenidoProducto.includes(textoBuscado);

      return (
        coincideTexto &&
        coincideCategoria(
          producto,
          categoriaSeleccionada
        ) &&
        coincideTipo(producto, tipoSeleccionado) &&
        coincideNorma(producto, normaSeleccionada)
      );
    });

    mostrarProductos(resultados);
  }

  /* =========================================
     MOSTRAR PRODUCTOS
  ========================================= */

  function mostrarProductos(resultados) {
    productsGrid.innerHTML = "";

    if (initialMessage) {
      initialMessage.hidden = true;
      initialMessage.style.display = "none";
    }

    if (errorMessage) {
      errorMessage.hidden = true;
    }

    if (resultsText) {
      resultsText.hidden = false;
      resultsText.style.display = "block";
      resultsText.textContent =
        `${resultados.length} producto(s) encontrado(s)`;
    }

    if (resultados.length === 0) {
      if (noResultsMessage) {
        noResultsMessage.hidden = false;
      } else {
        productsGrid.innerHTML = `
          <div class="no-results-message">
            <h2>No encontramos productos</h2>
            <p>Prueba cambiando los filtros.</p>
          </div>
        `;
      }

      return;
    }

    if (noResultsMessage) {
      noResultsMessage.hidden = true;
    }

    resultados.forEach((producto) => {
      productsGrid.appendChild(
        crearTarjetaProducto(producto)
      );
    });

    productsGrid.style.display = "grid";
  }

  /* =========================================
     CREAR TARJETA DEL PRODUCTO
  ========================================= */

  function crearTarjetaProducto(producto) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "product-card";

    const id = producto.id;
    const nombre = producto.nombre || "Producto";
    const codigo = producto.codigo || "";
    const descripcion = producto.descripcion || "";
    const categoria = producto.categoria || "";
    const linea = producto.linea || "";
    const diametro = producto.diametro || "";
    const serie = producto.serie || producto.tipo || "";
    const rutaImagen = obtenerRutaImagen(producto);
    const claseCategoria = obtenerClaseCategoria(categoria);
    const iconoCategoria = obtenerIconoCategoria(categoria);

    const enlaceDetalle =
      `./detalle.html?id=${encodeURIComponent(id)}`;

    tarjeta.innerHTML = `
      <div class="product-tags">
        <span class="product-category-tag ${claseCategoria}">
          <span class="category-icon">
            ${iconoCategoria}
          </span>

          <span>
            ${escaparHTML(categoria)}
          </span>

          ${
            linea
              ? `
                <span class="category-line">
                  ${escaparHTML(linea)}
                </span>
              `
              : ""
          }
        </span>
      </div>

      <div class="product-image-container">
        ${
          rutaImagen
            ? `
              <img
                src="${escaparHTML(rutaImagen)}"
                alt="${escaparHTML(nombre)}"
                class="product-image"
                loading="lazy"
              >
            `
            : `
              <span class="product-image-placeholder">
                Imagen no disponible
              </span>
            `
        }
      </div>

      <div class="product-content">

        ${
          codigo
            ? `
              <span class="product-code">
                ${escaparHTML(codigo)}
              </span>
            `
            : ""
        }

        <h3 class="product-name">
          ${escaparHTML(nombre)}
        </h3>

        ${
          diametro || serie
            ? `
              <div class="product-meta">
                ${
                  diametro
                    ? `
                      <span class="product-diameter">
                        Ø ${escaparHTML(diametro)}
                      </span>
                    `
                    : ""
                }

                ${
                  diametro && serie
                    ? `<span class="meta-dot"></span>`
                    : ""
                }

                ${
                  serie
                    ? `
                      <span class="product-series">
                        ${escaparHTML(serie)}
                      </span>
                    `
                    : ""
                }
              </div>
            `
            : ""
        }

        <p class="product-description">
          ${escaparHTML(descripcion)}
        </p>

        <a
          href="${enlaceDetalle}"
          class="product-link"
          aria-label="Ver ficha técnica de ${escaparHTML(nombre)}"
        >
          Ver ficha técnica
          <span class="product-link-arrow">→</span>
        </a>

      </div>
    `;

    const imagen = tarjeta.querySelector(".product-image");

    if (imagen) {
      imagen.addEventListener("error", () => {
        const contenedor = imagen.closest(
          ".product-image-container"
        );

        contenedor.innerHTML = `
          <span class="product-image-placeholder">
            Imagen no disponible
          </span>
        `;
      });
    }

    return tarjeta;
  }

  /* =========================================
     EVENTOS
  ========================================= */

  filtersForm.addEventListener("submit", buscarProductos);

  productSearch.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") {
      evento.preventDefault();
      filtersForm.requestSubmit();
    }
  });

  /* =========================================
     MENÚ LATERAL
  ========================================= */

  function abrirMenu() {
    if (sideMenu) {
      sideMenu.classList.add("active");
      sideMenu.setAttribute("aria-hidden", "false");
    }

    if (menuOverlay) {
      menuOverlay.classList.add("active");
      menuOverlay.setAttribute("aria-hidden", "false");
    }

    if (menuBtn) {
      menuBtn.setAttribute("aria-expanded", "true");
    }
  }

  function cerrarMenuLateral() {
    if (sideMenu) {
      sideMenu.classList.remove("active");
      sideMenu.setAttribute("aria-hidden", "true");
    }

    if (menuOverlay) {
      menuOverlay.classList.remove("active");
      menuOverlay.setAttribute("aria-hidden", "true");
    }

    if (menuBtn) {
      menuBtn.setAttribute("aria-expanded", "false");
    }
  }

  if (menuBtn) {
    menuBtn.addEventListener("click", abrirMenu);
  }

  if (closeMenu) {
    closeMenu.addEventListener(
      "click",
      cerrarMenuLateral
    );
  }

  if (menuOverlay) {
    menuOverlay.addEventListener(
      "click",
      cerrarMenuLateral
    );
  }

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
      cerrarMenuLateral();
    }
  });

  /* =========================================
     INICIAR
  ========================================= */

  cargarProductos();
});