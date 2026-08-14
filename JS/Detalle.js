"use strict";

const rutaJSON = "./Data/Productos.json";
const carpetaImagenes = "./img/";

const loadingMessage = document.getElementById("loadingMessage");
const errorMessage = document.getElementById("errorMessage");
const productDetail = document.getElementById("productDetail");

const breadcrumbProduct = document.getElementById("breadcrumbProduct");
const mainProductImage = document.getElementById("mainProductImage");
const thumbnailList = document.getElementById("thumbnailList");

const categoryTag = document.getElementById("categoryTag");
const productCode = document.getElementById("productCode");
const productTitle = document.getElementById("productTitle");
const productMeta = document.getElementById("productMeta");
const productDescription = document.getElementById("productDescription");

const standardsSection = document.getElementById("standardsSection");
const standardsList = document.getElementById("standardsList");

const benefitsSection = document.getElementById("benefitsSection");
const benefitsGrid = document.getElementById("benefitsGrid");

const detailGallery =
  document.querySelector(".detail-gallery");

const stickyMainImage =
  document.getElementById("stickyMainImage");

const stopStickyGallery =
  stickyMainImage
    ? stickyMainImage.querySelector("#stopStickyGallery")
    : null;

const applicationsSection =
  document.getElementById("applicationsSection");

const applicationsList =
  document.getElementById("applicationsList");

const technicalSection =
  document.getElementById("technicalSection");

const technicalTableHead =
  document.getElementById("technicalTableHead");

const technicalTableBody =
  document.getElementById("technicalTableBody");

const technicalNote =
  document.getElementById("technicalNote");

const technicalTableScroll =
  document.getElementById("technicalTableScroll");

const technicalScrollHint =
  document.getElementById("technicalScrollHint");

const logisticsSection =
  document.getElementById("logisticsSection");

const logisticsGrid =
  document.getElementById("logisticsGrid");

const quoteButton =
  document.getElementById("quoteButton");

const whatsappButton =
  document.getElementById("whatsappButton");

const shareButton =
  document.getElementById("shareButton");

const downloadButton =
  document.getElementById("downloadButton");

let productoActual = null;

document.addEventListener("DOMContentLoaded", iniciarFicha);

async function iniciarFicha() {
  const idProducto = obtenerIdProducto();

  if (!idProducto) {
    mostrarError();
    return;
  }

  try {
    const respuesta = await fetch(rutaJSON);

    if (!respuesta.ok) {
      throw new Error(
        `No se pudo cargar el JSON. Estado: ${respuesta.status}`
      );
    }

    const productos = await respuesta.json();

    if (!Array.isArray(productos)) {
      throw new Error(
        "Productos.json debe contener un arreglo de productos."
      );
    }

    const producto = productos.find(
      item => Number(item.id) === Number(idProducto)
    );

    if (!producto) {
      mostrarError();
      return;
    }

    productoActual = producto;

    renderizarProducto(producto);

    loadingMessage.classList.add("hidden");
    productDetail.classList.remove("hidden");

    requestAnimationFrame(() => {
      configurarSeguimientoEstable();
    });

  } catch (error) {
    console.error("Error cargando la ficha:", error);
    mostrarError();
  }
}

function obtenerIdProducto() {
  const parametros = new URLSearchParams(
    window.location.search
  );

  return parametros.get("id");
}

function mostrarError() {
  loadingMessage.classList.add("hidden");
  productDetail.classList.add("hidden");
  errorMessage.classList.remove("hidden");
}

function configurarSeguimientoEstable() {
  if (!stickyMainImage || !stopStickyGallery) {
    console.error(
      "No se encontró #stickyMainImage o #stopStickyGallery"
    );
    return;
  }

  if (stickyMainImage.dataset.followReady === "true") {
    return;
  }

  stickyMainImage.dataset.followReady = "true";

  const placeholder = document.createElement("div");
  placeholder.className = "image-follow-placeholder";

  stickyMainImage.insertAdjacentElement(
    "afterend",
    placeholder
  );

  let seguimientoActivo = true;
  let limiteActivacion = 0;
  let alturaOriginal = 0;
  let framePendiente = false;

  function medirPosicionOriginal() {
    stickyMainImage.classList.remove("is-following");
    placeholder.classList.remove("active");
    placeholder.style.height = "0px";

    const rect =
      stickyMainImage.getBoundingClientRect();

    limiteActivacion =
      rect.top + window.scrollY;

    alturaOriginal =
      stickyMainImage.offsetHeight;
  }

  function aplicarEstadoSeguimiento() {
    framePendiente = false;

    if (!seguimientoActivo) {
      stickyMainImage.classList.remove("is-following");
      return;
    }

    const header =
      document.querySelector(".detail-header");

    const alturaHeader =
      header ? header.offsetHeight : 76;

    const debeSeguir =
      window.scrollY + alturaHeader + 10 >=
      limiteActivacion;

    if (debeSeguir) {
      placeholder.style.height =
        `${alturaOriginal}px`;

      placeholder.classList.add("active");
      stickyMainImage.classList.add("is-following");
    } else {
      stickyMainImage.classList.remove("is-following");
      placeholder.classList.remove("active");
      placeholder.style.height = "0px";
    }
  }

  function solicitarActualizacion() {
    if (framePendiente || !seguimientoActivo) {
      return;
    }

    framePendiente = true;

    requestAnimationFrame(
      aplicarEstadoSeguimiento
    );
  }

  function detenerSeguimiento(evento) {
    if (evento) {
      evento.preventDefault();
      evento.stopPropagation();

      if (
        typeof evento.stopImmediatePropagation ===
        "function"
      ) {
        evento.stopImmediatePropagation();
      }
    }

    if (!seguimientoActivo) {
      return;
    }

    seguimientoActivo = false;
    framePendiente = false;

    stickyMainImage.classList.remove("is-following");
    stickyMainImage.classList.add("follow-disabled");

    placeholder.classList.remove("active");
    placeholder.style.height = "0px";

    window.removeEventListener(
      "scroll",
      solicitarActualizacion
    );

    stopStickyGallery.setAttribute(
      "aria-label",
      "Seguimiento desactivado"
    );

    stopStickyGallery.style.display = "none";
  }

  /*
    Evento directo del botón.
  */
  stopStickyGallery.onclick = detenerSeguimiento;

  /*
    Respaldo en fase de captura:
    funciona aunque otro elemento o script intercepte el clic.
  */
  document.addEventListener(
    "click",
    evento => {
      const boton = evento.target.closest(
        "#stopStickyGallery"
      );

      if (boton) {
        detenerSeguimiento(evento);
      }
    },
    true
  );

  /*
    Respaldo adicional para celulares.
  */
  document.addEventListener(
    "pointerup",
    evento => {
      const boton = evento.target.closest(
        "#stopStickyGallery"
      );

      if (boton) {
        detenerSeguimiento(evento);
      }
    },
    true
  );

  window.addEventListener(
    "scroll",
    solicitarActualizacion,
    { passive: true }
  );

  window.addEventListener("resize", () => {
    if (!seguimientoActivo) {
      return;
    }

    requestAnimationFrame(() => {
      medirPosicionOriginal();
      aplicarEstadoSeguimiento();
    });
  });

  medirPosicionOriginal();
  aplicarEstadoSeguimiento();
}

function renderizarProducto(producto) {
  document.title =
    `${producto.nombre || "Producto"} | Grupo Taiplast`;

  breadcrumbProduct.textContent =
    producto.nombre || "Ficha técnica";

  productTitle.textContent =
    producto.nombre || "Producto sin nombre";

  productCode.textContent =
    producto.codigo
      ? `Código: ${producto.codigo}`
      : "";

  productDescription.textContent =
    producto.descripcion || "";

  categoryTag.textContent = construirEtiquetaCategoria(
    producto
  );

  renderizarMetadatos(producto);
  renderizarGaleria(producto);
  renderizarNormas(producto.normas);
  renderizarBeneficios(producto.beneficios);
  renderizarAplicaciones(producto.aplicaciones);

  renderizarTablaTecnica(
    producto.tablaTecnica,
    producto.notaTecnica
  );

  renderizarLogistica(producto.logistica);
  configurarAcciones(producto);
}

function construirEtiquetaCategoria(producto) {
  const categoria = producto.categoria || "Producto";
  const linea = producto.linea || "";

  return linea
    ? `≋ ${categoria} | ${linea}`
    : `≋ ${categoria}`;
}

function renderizarMetadatos(producto) {
  const datos = [
    producto.diametro
      ? `Ø ${producto.diametro}`
      : null,

    producto.serie || null,

    producto.tipo || null
  ].filter(Boolean);

  productMeta.innerHTML = "";

  datos.forEach(dato => {
    const span = document.createElement("span");
    span.textContent = dato;

    productMeta.appendChild(span);
  });
}

function obtenerImagenes(producto) {
  if (
    Array.isArray(producto.imagenes) &&
    producto.imagenes.length > 0
  ) {
    return producto.imagenes.filter(Boolean);
  }

  if (producto.imagen) {
    return [producto.imagen];
  }

  return [];
}

function construirRutaImagen(nombreImagen) {
  if (!nombreImagen) {
    return "";
  }

  if (
    nombreImagen.startsWith("http://") ||
    nombreImagen.startsWith("https://") ||
    nombreImagen.startsWith("./") ||
    nombreImagen.startsWith("/")
  ) {
    return nombreImagen;
  }

  return `${carpetaImagenes}${nombreImagen}`;
}

function renderizarGaleria(producto) {
  const imagenes = obtenerImagenes(producto);

  thumbnailList.innerHTML = "";

  if (imagenes.length === 0) {
    mainProductImage.src =
      "./img/producto-sin-imagen.png";

    mainProductImage.alt =
      "Producto sin imagen disponible";

    return;
  }

  cambiarImagenPrincipal(
    imagenes[0],
    producto.nombre
  );

  imagenes.forEach((imagen, indice) => {
    const boton = document.createElement("button");

    boton.type = "button";
    boton.className =
      indice === 0
        ? "thumbnail active"
        : "thumbnail";

    const miniatura = document.createElement("img");

    miniatura.src = construirRutaImagen(imagen);
    miniatura.alt =
      `${producto.nombre} - imagen ${indice + 1}`;

    miniatura.addEventListener("error", () => {
      miniatura.src =
        "./img/producto-sin-imagen.png";
    });

    boton.appendChild(miniatura);

    boton.addEventListener("click", () => {
      cambiarImagenPrincipal(
        imagen,
        producto.nombre
      );

      document
        .querySelectorAll(".thumbnail")
        .forEach(elemento => {
          elemento.classList.remove("active");
        });

      boton.classList.add("active");
    });

    thumbnailList.appendChild(boton);
  });
}

function cambiarImagenPrincipal(imagen, nombreProducto) {
  mainProductImage.src =
    construirRutaImagen(imagen);

  mainProductImage.alt =
    nombreProducto || "Producto Taiplast";

  mainProductImage.onerror = () => {
    mainProductImage.onerror = null;

    mainProductImage.src =
      "./img/producto-sin-imagen.png";
  };
}

function renderizarNormas(normas) {
  standardsList.innerHTML = "";

  if (
    !Array.isArray(normas) ||
    normas.length === 0
  ) {
    standardsSection.classList.add("hidden");
    return;
  }

  standardsSection.classList.remove("hidden");

  normas.forEach(norma => {
    const span = document.createElement("span");
    span.textContent = norma;

    standardsList.appendChild(span);
  });
}

function renderizarBeneficios(beneficios) {
  benefitsGrid.innerHTML = "";

  if (
    !Array.isArray(beneficios) ||
    beneficios.length === 0
  ) {
    benefitsSection.classList.add("hidden");
    return;
  }

  benefitsSection.classList.remove("hidden");

  beneficios.forEach((beneficio, indice) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "benefit-card";

    const icono = document.createElement("div");
    icono.className = "benefit-icon";

    const iconos = ["◆", "≋", "◷", "⌁"];

    icono.textContent =
      iconos[indice % iconos.length];

    const texto = document.createElement("p");
    texto.textContent = beneficio;

    tarjeta.append(icono, texto);
    benefitsGrid.appendChild(tarjeta);
  });
}

function renderizarAplicaciones(aplicaciones) {
  applicationsList.innerHTML = "";

  if (
    !Array.isArray(aplicaciones) ||
    aplicaciones.length === 0
  ) {
    applicationsSection.classList.add("hidden");
    return;
  }

  applicationsSection.classList.remove("hidden");

  aplicaciones.forEach(aplicacion => {
    const li = document.createElement("li");

    li.textContent = aplicacion;

    applicationsList.appendChild(li);
  });
}

function renderizarTablaTecnica(
  tablaTecnica,
  nota
) {
  technicalTableHead.innerHTML = "";
  technicalTableBody.innerHTML = "";

  if (
    !tablaTecnica ||
    typeof tablaTecnica !== "object" ||
    Array.isArray(tablaTecnica) ||
    Object.keys(tablaTecnica).length === 0
  ) {
    technicalSection.classList.add("hidden");
    return;
  }

  technicalSection.classList.remove("hidden");

  const encabezados = Object.keys(tablaTecnica);
  const valores = Object.values(tablaTecnica);

  const filaEncabezados = document.createElement("tr");
  const filaValores = document.createElement("tr");

  encabezados.forEach(encabezado => {
    const th = document.createElement("th");
    th.textContent = encabezado;
    filaEncabezados.appendChild(th);
  });

  valores.forEach(valor => {
    const td = document.createElement("td");

    td.textContent =
      valor !== null &&
      valor !== undefined &&
      valor !== ""
        ? valor
        : "—";

    filaValores.appendChild(td);
  });

  technicalTableHead.appendChild(filaEncabezados);
  technicalTableBody.appendChild(filaValores);


  prepararDesplazamientoTablaTecnica();
}

function prepararDesplazamientoTablaTecnica() {
  if (!technicalTableScroll) {
    return;
  }

  technicalTableScroll.scrollLeft = 0;

  requestAnimationFrame(() => {
    actualizarIndicadorTablaTecnica();
  });

  technicalTableScroll.removeEventListener(
    "scroll",
    controlarDesplazamientoTabla
  );

  technicalTableScroll.addEventListener(
    "scroll",
    controlarDesplazamientoTabla,
    { passive: true }
  );

  activarArrastreConMouse(technicalTableScroll);
}

function actualizarIndicadorTablaTecnica() {
  if (
    !technicalTableScroll ||
    !technicalScrollHint
  ) {
    return;
  }

  const tieneDesplazamiento =
    technicalTableScroll.scrollWidth >
    technicalTableScroll.clientWidth + 2;

  if (!tieneDesplazamiento) {
    technicalScrollHint.classList.add("hidden");
    return;
  }

  if (technicalTableScroll.scrollLeft > 8) {
    technicalScrollHint.classList.add("hidden");
  } else {
    technicalScrollHint.classList.remove("hidden");
  }
}

function controlarDesplazamientoTabla() {
  actualizarIndicadorTablaTecnica();
}

function activarArrastreConMouse(contenedor) {
  if (
    !contenedor ||
    contenedor.dataset.dragActivo === "true"
  ) {
    return;
  }

  contenedor.dataset.dragActivo = "true";

  let estaArrastrando = false;
  let posicionInicialX = 0;
  let desplazamientoInicial = 0;

  contenedor.addEventListener("mousedown", evento => {
    if (evento.button !== 0) {
      return;
    }

    estaArrastrando = true;
    posicionInicialX = evento.pageX;
    desplazamientoInicial = contenedor.scrollLeft;

    contenedor.classList.add("dragging");
  });

  window.addEventListener("mousemove", evento => {
    if (!estaArrastrando) {
      return;
    }

    evento.preventDefault();

    const diferencia =
      evento.pageX - posicionInicialX;

    contenedor.scrollLeft =
      desplazamientoInicial - diferencia;
  });

  window.addEventListener("mouseup", () => {
    estaArrastrando = false;
    contenedor.classList.remove("dragging");
  });

  contenedor.addEventListener("mouseleave", () => {
    if (!estaArrastrando) {
      return;
    }

    estaArrastrando = false;
    contenedor.classList.remove("dragging");
  });
}

window.addEventListener("resize", () => {
  requestAnimationFrame(() => {
    actualizarIndicadorTablaTecnica();
  });
});

function renderizarLogistica(logistica) {
  logisticsGrid.innerHTML = "";

  if (
    !logistica ||
    typeof logistica !== "object" ||
    Array.isArray(logistica)
  ) {
    logisticsSection.classList.add("hidden");
    return;
  }

  const campos = [
    {
      propiedad: "tamanoCaja",
      etiqueta: "Tamaño de caja"
    },
    {
      propiedad: "volumen",
      etiqueta: "Volumen"
    },
    {
      propiedad: "pesoBruto",
      etiqueta: "Peso bruto"
    },
    {
      propiedad: "pesoNeto",
      etiqueta: "Peso neto"
    },
    {
      propiedad: "unidadesCaja",
      etiqueta: "Unidades por caja"
    },
    {
      propiedad: "embalaje",
      etiqueta: "Embalaje"
    }
  ];

  const camposDisponibles = campos.filter(campo => {
    const valor = logistica[campo.propiedad];

    return (
      valor !== null &&
      valor !== undefined &&
      valor !== ""
    );
  });

  if (camposDisponibles.length === 0) {
    logisticsSection.classList.add("hidden");
    return;
  }

  logisticsSection.classList.remove("hidden");

  camposDisponibles.forEach(campo => {
    const tarjeta =
      document.createElement("article");

    tarjeta.className = "logistics-card";

    const etiqueta =
      document.createElement("span");

    etiqueta.className = "logistics-label";
    etiqueta.textContent = campo.etiqueta;

    const valor =
      document.createElement("strong");

    valor.textContent =
      logistica[campo.propiedad];

    tarjeta.append(etiqueta, valor);
    logisticsGrid.appendChild(tarjeta);
  });
}

function configurarAcciones(producto) {
  const numeroWhatsApp = "51998244444";

  const nombreProducto =
    producto && producto.nombre
      ? producto.nombre.trim()
      : "producto Taiplast";

  const codigoProducto =
    producto && producto.codigo
      ? String(producto.codigo).trim()
      : "";

  const mensajeCotizacion =
    `Hola, quiero cotizar el ${nombreProducto} TAIPLAST.` +
    `${codigoProducto ? ` Código: ${codigoProducto}.` : ""}`;

  const mensajeInformacion =
    `Hola, quisiera recibir información sobre el ` +
    `${nombreProducto} TAIPLAST.` +
    `${codigoProducto ? ` Código: ${codigoProducto}.` : ""}`;

  const enlaceCotizacion =
    `https://wa.me/${numeroWhatsApp}` +
    `?text=${encodeURIComponent(mensajeCotizacion)}`;

  const enlaceInformacion =
    `https://wa.me/${numeroWhatsApp}` +
    `?text=${encodeURIComponent(mensajeInformacion)}`;

  if (quoteButton) {
    quoteButton.href = enlaceCotizacion;
  }

  if (whatsappButton) {
    whatsappButton.href = enlaceInformacion;
  }

  if (shareButton) {
    shareButton.addEventListener(
      "click",
      compartirProducto
    );
  }

  if (downloadButton) {
    downloadButton.addEventListener(
      "click",
      () => window.print()
    );
  }
}

async function compartirProducto() {
  if (!productoActual) {
    return;
  }

  const datosCompartir = {
    title: productoActual.nombre,
    text:
      `Ficha técnica de ${productoActual.nombre}`,
    url: window.location.href
  };

  try {
    if (navigator.share) {
      await navigator.share(datosCompartir);
      return;
    }

    await navigator.clipboard.writeText(
      window.location.href
    );

    alert("Enlace copiado");

  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(
        "No se pudo compartir:",
        error
      );
    }
  }
}