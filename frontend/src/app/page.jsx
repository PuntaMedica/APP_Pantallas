"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";

export default function Home() {
  const [hora, setHora] = useState("");
  const [fecha, setFecha] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [todosRegistros, setTodosRegistros] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [showBusqueda, setShowBusqueda] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNombre, setSelectedNombre] = useState("");
  const [selectedApPaterno, setSelectedApPaterno] = useState("");
  const [selectedApMaterno, setSelectedApMaterno] = useState("");

  const wrapperRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const croquis = ["/croquis1.webp", "/croquis2.webp", "/croquis3.webp"];
  const [croquisZoom, setCroquisZoom] = useState(null);

  // ============================
  // Banner rotation
  // ============================
  const banners = ["/banner1.webp", "/banner2.webp", "/banner3.webp"];
  const [bannerIndex, setBannerIndex] = useState(0);

  // Imágenes rotatorias para el fondo inferior
  const lowerImages = [
    "/fondoinferior1.webp",
    "/fondoinferior2.webp",
    "/fondoinferior3.webp",
    "/fondoinferior4.webp",
    "/fondoinferior5.webp",
  ];
  const [lowerIndex, setLowerIndex] = useState(0);

  // Modal Mapa
  const [showMapaModal, setShowMapaModal] = useState(false);
  function abrirMapaModal() {
    setShowMapaModal(true);
  }
  function cerrarMapaModal() {
    setShowMapaModal(false);
  }
  function highlight(text, term) {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, "gi");
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <span key={i} style={{ backgroundColor: "yellow" }}>{part}</span>
      ) : (
        part
      )
    );
  }
  const fadeDuration = 0.8;
  const transitionDuration = 0.5;

  // Precarga de imágenes
  const allImagesToPreload = [
    ...banners,
    ...lowerImages,
    "/flecha.png",
    "/fondoModal.webp",
    "/mapa.jpg",
  ];
  useEffect(() => {
    allImagesToPreload.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // ============================
  // EFECTOS
  // ============================
  // Actualizar fecha y hora cada minuto
  useEffect(() => {
    function actualizarFechaHora() {
      const ahora = new Date();
      let hrs = ahora.getHours();
      const mins = ahora.getMinutes().toString().padStart(2, "0");
      const ampm = hrs >= 12 ? "PM" : "AM";
      hrs = hrs % 12 || 12;
      setHora(`${hrs}:${mins} ${ampm}`);
      setFecha(ahora.toLocaleDateString());
    }
    actualizarFechaHora();
    const t = setInterval(actualizarFechaHora, 60000);
    return () => clearInterval(t);
  }, []);

  // Fetch de registros y categorías
  useEffect(() => {
    fetch("http://10.236.203.221:5900/medicos")
      .then((res) => res.json())
      .then((data) => {
        setTodosRegistros(data);
        const unicas = [...new Set(data.map((item) => item.Categorias))].filter(Boolean);
        unicas.sort();
        setCategorias(unicas);
      })
      .catch((err) => console.error(err));
  }, []);

  // Banner rotatorio cada 10 segundos
  useEffect(() => {
    const id = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % banners.length);
    }, 10000);
    return () => clearInterval(id);
  }, [banners.length]);

  // Fondo inferior rotatorio cada 8 segundos
  useEffect(() => {
    const id = setInterval(() => {
      setLowerIndex((prev) => (prev + 1) % lowerImages.length);
    }, 8000);
    return () => clearInterval(id);
  }, [lowerImages.length]);

  useEffect(() => {
    const el = wrapperRef.current;
    const update = () => {
      if (!el) return;
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollWidth > el.clientWidth + el.scrollLeft);
    };
    update();
    el?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      el?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [categorias]);

  // ============================
  // MANEJO DE EVENTOS
  // ============================
  function abrirModal(cat) {
    setCategoriaSeleccionada(cat);
    setShowModal(true);
  }
  function cerrarModal() {
    setShowModal(false);
    setCategoriaSeleccionada("");
  }

  function abrirBusqueda() {
    setShowBusqueda(true);
    setSearchTerm("");
    setSelectedNombre("");
    setSelectedApPaterno("");
    setSelectedApMaterno("");
  }
  function cerrarBusqueda() {
    setShowBusqueda(false);
  }

  function limpiarFiltros() {
    setSearchTerm("");
    setSelectedNombre("");
    setSelectedApPaterno("");
    setSelectedApMaterno("");
  }

  // ============================
  // FILTROS DINÁMICOS
  // ============================
  const filteredForNombres = todosRegistros.filter((med) => {
    return (
      (selectedApPaterno ? med["Apellido Paterno"] === selectedApPaterno : true) &&
      (selectedApMaterno ? med["Apellido Materno"] === selectedApMaterno : true)
    );
  });
  const uniqueNombres = Array.from(new Set(filteredForNombres.map((m) => m.Nombre || "")))
    .filter(Boolean)
    .sort();

  const filteredForApPaternos = todosRegistros.filter((med) => {
    return (
      (selectedNombre ? med.Nombre === selectedNombre : true) &&
      (selectedApMaterno ? med["Apellido Materno"] === selectedApMaterno : true)
    );
  });
  const uniqueApPaternos = Array.from(new Set(filteredForApPaternos.map((m) => m["Apellido Paterno"] || "")))
    .filter(Boolean)
    .sort();

  const filteredForApMaternos = todosRegistros.filter((med) => {
    return (
      (selectedNombre ? med.Nombre === selectedNombre : true) &&
      (selectedApPaterno ? med["Apellido Paterno"] === selectedApPaterno : true)
    );
  });
  const uniqueApMaternos = Array.from(new Set(filteredForApMaternos.map((m) => m["Apellido Materno"] || "")))
    .filter(Boolean)
    .sort();

  // ============================
  // BÚSQUEDA LIBRE + COMBOS
  // ============================
  const filteredMedicosBusqueda = todosRegistros.filter((med) => {
    const term = searchTerm.trim().toLowerCase();
    const matchTerm =
      !term ||
      med.Nombre.toLowerCase().includes(term) ||
      med["Apellido Paterno"].toLowerCase().includes(term) ||
      med["Apellido Materno"].toLowerCase().includes(term);
    return (
      matchTerm &&
      (selectedNombre ? med.Nombre === selectedNombre : true) &&
      (selectedApPaterno ? med["Apellido Paterno"] === selectedApPaterno : true) &&
      (selectedApMaterno ? med["Apellido Materno"] === selectedApMaterno : true)
    );
  });
  const anyFilterSelected = searchTerm || selectedNombre || selectedApPaterno || selectedApMaterno;

  const registrosFiltrados = todosRegistros.filter((reg) => reg.Categorias === categoriaSeleccionada);

    // Después de definir registrosFiltrados, añade:
  const priorityNames = [
    "Rodrigo Silva Martínez",
    "Sara Olivia Ramos Romero"
  ];

  const sortedRegistros = [...registrosFiltrados].sort((a, b) => {
    const nameA = `${a.Nombre} ${a["Apellido Paterno"]} ${a["Apellido Materno"]}`;
    const nameB = `${b.Nombre} ${b["Apellido Paterno"]} ${b["Apellido Materno"]}`;
    const idxA = priorityNames.indexOf(nameA);
    const idxB = priorityNames.indexOf(nameB);

    if (idxA !== -1 || idxB !== -1) {
      if (idxA === -1) return 1;    // b es prioritario → b primero
      if (idxB === -1) return -1;   // a es prioritario → a primero
      return idxA - idxB;           // ambos prioritarios → orden definido en el array
    }
    return 0; // ninguno prioritario → mantienen orden original
  });

  // Construir ruta de foto
  function fotoPerfil(medico) {
    const nombre = (medico.Nombre || "").replaceAll(" ", "").toLowerCase();
    const apPat = (medico["Apellido Paterno"] || "").replaceAll(" ", "").toLowerCase();
    const apMat = (medico["Apellido Materno"] || "").replaceAll(" ", "").toLowerCase();
    return `/Medicos/${nombre}_${apPat}_${apMat}.webp`;
  }

  // ============================
  // CONTENIDO PRINCIPAL
  // ============================
  const MainContent = (
    <div style={{ position: "relative", minHeight: "100vh", width: "100%", overflow: "hidden" }}>
      {/* Fondo */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: 'url("/imagen_13.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: -10,
        }}
      />

      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Passion+One:wght@700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          .passion-regular {
            font-family: "Passion One", sans-serif;
            font-weight: 700;
          }
        `}</style>
      </Head>

      {/* Logo esquina */}
      <div style={{ position: "absolute", top: "1rem", left: "1rem", zIndex: 9999 }}>
        <img src="/logo.png" alt="Logo" style={{ width: "100px" }} />
      </div>

      {/* Banner */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "300px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "2px solid #333",
          backgroundColor: "#fff",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={banners[bannerIndex]}
            src={banners[bannerIndex]}
            alt="Banner"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: fadeDuration }}
          />
        </AnimatePresence>

        <h1
          className="passion-regular"
          style={{
            position: "relative",
            zIndex: 2,
            color: "#00C1d5",
            fontSize: "3.2rem",
            textAlign: "center",
            textShadow: "2px 2px #000",
            lineHeight: 1.4,
            marginTop: "2rem",
            padding: "0 1rem",
          }}
        >
          Bienvenidos
          <br />
          Hospital Punta Médica
          <span style={{ fontSize: "2rem", display: "block", marginTop: "1rem" }}>
            PRIMERO, TU VIDA
          </span>
        </h1>
      </div>

      {/* DIRECTORIO */}
      <div style={{ position: "relative", padding: "1rem" }}>
        <h1
          style={{
            textAlign: "center",
            fontSize: "4rem",
            fontWeight: "bold",
            textShadow: "2px 2px #000",
            marginBottom: "2rem",
            color: "#364153",
          }}
        >
          Directorio Médico
        </h1>

  {/* Categorías */}
<div style={{ position: "relative", margin: "1rem 0" }}>
  {/* Flecha izquierda */}
  {canScrollLeft && (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: "2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        background: "linear-gradient(to right, rgb(173, 173, 173), rgba(209, 209, 209, 0)",
        zIndex: 2,
      }}
    >
      ◀
    </div>
  )}

  {/* Wrapper con scroll horizontal */}
  <div
    ref={wrapperRef}
    style={{
      overflowX: categorias.length > 16 ? "auto" : "hidden",
      overflowY: "visible",
      padding: "1rem 0",
    }}
  >
    <div
      style={{
        display: "grid",
        gridAutoFlow: "column",
        gridTemplateRows: "repeat(4, 200px)",
        gridAutoColumns: "calc((100% - 3rem) / 4)",
        gap: "1rem",
        justifyItems: "center",
      }}
    >
      {categorias.map((cat, i) => (
        <button
          key={i}
          onClick={() => abrirModal(cat)}
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={`/${i + 1}.png`}
            alt={`Imagen ${i + 1}`}
            style={{ maxWidth: "80%", maxHeight: "80%" }}
          />
          <div style={{ marginTop: "0.5rem", fontSize: "1.6rem", textAlign: "center", color: "#364153", whiteSpace: "nowrap"}}>
            {cat}
          </div>
        </button>
      ))}
    </div>
  </div>

  {/* Flecha derecha */}
  {canScrollRight && (
    <div
      style={{
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        width: "2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        background: "linear-gradient(to left, rgb(173, 173, 173), rgba(209, 209, 209, 0))",
        zIndex: 2,
      }}
    >
      ▶
    </div>
  )}
</div>

        {/* Dos botones */}
        <div style={{ display: "flex", margin: "2rem 0" }}>
          <div
            onClick={abrirBusqueda}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
              cursor: "pointer",
              border: "2px solid #333",
              borderRadius: "8px",
              padding: "1rem",
              boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
              backgroundColor: "#fff",
              marginRight: "1rem",
            }}
          >
            <img src="/lupa2.png" alt="Lupa" style={{ width: "30px" }} />
            <h2 style={{ fontSize: "2.4rem", margin: 0, color: "#333" }}>
              Encuentra a tu médico
            </h2>
            <img src="/lupa2.png" alt="Lupa" style={{ width: "30px" }} />
          </div>

          <div
            onClick={abrirMapaModal}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
              cursor: "pointer",
              border: "2px solid #333",
              borderRadius: "8px",
              padding: "1rem",
              boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
              backgroundColor: "#fff",
            }}
          >
            <h2 style={{ fontSize: "2.4rem", margin: 0, color: "#333" }}>Ubícame</h2>
            <img src="/mapa4.png" alt="Mapa" style={{ width: "50px" }} />
          </div>
        </div>

        {/* MODALES (solo cubren DIRECTORIO) */}
        <AnimatePresence>
          {/* Modal Categoría */}
          {showModal && (
            <motion.div
              key="modalCategoria"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: transitionDuration }}
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 9999,
                display: "flex",
                flexDirection: "column",
                padding: "1rem",
                backgroundColor: "#8cb3f5",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: 'url("/fondoModal.webp")',
                  backgroundSize: "cover",
                  opacity: 0.25,
                  zIndex: -1,
                }}
              />
              <motion.div
                onClick={cerrarModal}
                whileHover={{ scale: 1.1 }}
                style={{ width: "8rem", height: "8rem", cursor: "pointer" }}
              >
                <img src="/flecha.png" alt="Cerrar" style={{ width: "100%" }} />
              </motion.div>
              <motion.h2
                style={{
                  textAlign: "center",
                  fontSize: "3rem",
                  color: "#333",
                  textShadow: "2px 2px #aaa",
                  margin: "1rem 0",
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: transitionDuration }}
              >
                {categoriaSeleccionada}
              </motion.h2>
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                {registrosFiltrados.length === 0 ? (
                  <p>No hay datos registrados</p>
                ) : (
                  sortedRegistros.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        width: "80%",
                        maxWidth: "500px",
                        backgroundColor: "#fff",
                        padding: "0.5rem",
                        borderRadius: "4px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        display: "flex",
                        gap: "1rem",
                        alignItems: "center",
                      }}
                    >
                      <img
                        src={fotoPerfil(item)}
                        onError={(e) => (e.currentTarget.src = "/persona.png")}
                        alt="Médico"
                        style={{
                          width: "120px",
                          height: "120px",
                          objectFit: "cover",
                          borderRadius: "50%",
                          border: "1px solid #999",
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: "bold", margin: 0 }}>
                          {item.Nombre} {item["Apellido Paterno"]} {item["Apellido Materno"]}
                        </p>
                        <p style={{ margin: "0.2rem 0" }}>
                          <strong>Especialidad:</strong> {item.Especialidad}
                        </p>
                        {item.Subespecialidad && (
                          <p style={{ fontSize: "0.9rem", color: "#555", margin: "0.2rem 0" }}>
                            <strong>Subesp:</strong> {item.Subespecialidad}
                          </p>
                        )}
                        {item.Extensión && (
                          <p style={{ fontSize: "0.9rem", color: "#555", margin: "0.2rem 0" }}>
                            <strong>Extensión:</strong> {item.Extensión}
                          </p>
                        )}
                        {item.Piso && (
                          <p style={{ fontSize: "0.9rem", color: "#555", margin: "0.2rem 0" }}>
                            <strong>Piso:</strong> {item.Piso}
                          </p>
                        )}
                        {item.Consultorio && (
                          <p style={{ fontSize: "0.9rem", color: "#555", margin: "0.2rem 0" }}>
                            <strong>Consultorio:</strong> {item.Consultorio}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* Modal Búsqueda */}
          {showBusqueda && (
            <motion.div
              key="modalBusqueda"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: transitionDuration }}
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "#8cb3f5",
                zIndex: 9999,
                display: "flex",
                flexDirection: "column",
                padding: "1rem",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: 'url("/fondoModal.jpg")',
                  backgroundSize: "cover",
                  opacity: 0.25,
                  zIndex: -1,
                }}
              />
              <motion.div
                onClick={cerrarBusqueda}
                whileHover={{ scale: 1.1 }}
                style={{ width: "8rem", height: "8rem", cursor: "pointer" }}
              >
                <img src="/flecha.png" alt="Cerrar" style={{ width: "100%" }} />
              </motion.div>
              <motion.h2
                style={{
                  textAlign: "center",
                  fontSize: "3rem",
                  color: "#333",
                  textShadow: "2px 2px #aaa",
                  margin: "1rem 0",
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: transitionDuration }}
              >
                Selecciona a tu médico
              </motion.h2>

              {/* Campo de búsqueda libre */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
                <input
                  type="text"
                  placeholder="Buscar por nombre o apellidos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    padding: "0.5rem",
                    width: "60%",
                    border: "1px solid #333",
                    borderRadius: "4px",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "1rem",
                  marginBottom: "1rem",
                  marginTop: "2rem",
                }}
              >
                <select
                  value={selectedNombre}
                  onChange={(e) => setSelectedNombre(e.target.value)}
                  style={{ padding: "0.5rem", border: "1px solid #333", borderRadius: "4px" }}
                >
                  <option value="">Todos los nombres</option>
                  {uniqueNombres.map((n, i) => (
                    <option key={i} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedApPaterno}
                  onChange={(e) => setSelectedApPaterno(e.target.value)}
                  style={{ padding: "0.5rem", border: "1px solid #333", borderRadius: "4px" }}
                >
                  <option value="">Todos los apellidos paternos</option>
                  {uniqueApPaternos.map((ap, i) => (
                    <option key={i} value={ap}>
                      {ap}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedApMaterno}
                  onChange={(e) => setSelectedApMaterno(e.target.value)}
                  style={{ padding: "0.5rem", border: "1px solid #333", borderRadius: "4px" }}
                >
                  <option value="">Todos los apellidos maternos</option>
                  {uniqueApMaternos.map((am, i) => (
                    <option key={i} value={am}>
                      {am}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                <button
                  onClick={limpiarFiltros}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid #333",
                    borderRadius: "4px",
                    backgroundColor: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Limpiar Filtros
                </button>
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {!anyFilterSelected ? (
                  <p style={{ color: "#666" }}>Escribe o selecciona algún filtro para ver resultados</p>
                ) : filteredMedicosBusqueda.length === 0 ? (
                  <p>No hay médicos que coincidan</p>
                ) : (
                  filteredMedicosBusqueda.map((med, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: "80%",
                        maxWidth: "500px",
                        marginBottom: "1rem",
                        backgroundColor: "#fff",
                        padding: "0.5rem",
                        borderRadius: "4px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        display: "flex",
                        gap: "1rem",
                        alignItems: "center",
                      }}
                    >
                      <img
                        src={fotoPerfil(med)}
                        onError={(e) => (e.currentTarget.src = "/persona.png")}
                        alt="Foto Medico"
                        style={{
                          width: "120px",
                          height: "120px",
                          objectFit: "cover",
                          borderRadius: "50%",
                          border: "1px solid #999",
                        }}
                      />
                      <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: "bold" }}>
                          {highlight(
                            `${med.Nombre} ${med["Apellido Paterno"]} ${med["Apellido Materno"]}`,
                            searchTerm.trim()
                          )}
                        </p>
                        <p style={{ margin: "0.2rem 0" }}>
                          <strong>Especialidad:</strong> {med.Especialidad}
                        </p>
                        {med.Subespecialidad && (
                          <p style={{ fontSize: "0.9rem", color: "#555", margin: "0.2rem 0" }}>
                            <strong>Subesp:</strong> {med.Subespecialidad}
                          </p>
                        )}
                        {med.Extensión && (
                          <p style={{ fontSize: "0.9rem", color: "#555", margin: "0.2rem 0" }}>
                            <strong>Extensión:</strong> {med.Extensión}
                          </p>
                        )}
                        {med.Piso && (
                          <p style={{ fontSize: "0.9rem", color: "#555", margin: "0.2rem 0" }}>
                            <strong>Piso:</strong> {med.Piso}
                          </p>
                        )}
                        {med.Consultorio && (
                          <p style={{ fontSize: "0.9rem", color: "#555", margin: "0.2rem 0" }}>
                            <strong>Consultorio:</strong> {med.Consultorio}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* Modal Mapa */}
          {showMapaModal && (
            <motion.div
              key="modalMapaLocal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: transitionDuration }}
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 9999,
                display: "flex",
                flexDirection: "column",
                padding: "1rem",
                backgroundColor: "#8cb3f5",
              }}
            >
              {/* fondo semitransparente igual que antes */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: 'url("/fondoModal.jpg")',
                  backgroundSize: "cover",
                  opacity: 0.25,
                  zIndex: -1,
                }}
              />
              <motion.div
                onClick={cerrarMapaModal}
                whileHover={{ scale: 1.1 }}
                style={{ width: "8rem", height: "8rem", cursor: "pointer" }}
              >
                <img src="/flecha.png" alt="Cerrar" style={{ width: "100%" }} />
              </motion.div>
              <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "1rem" }}>
                {croquis.map((src,i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`Croquis ${i+1}`}
                    style={{ width: "80px", height: "80px", cursor: "pointer", borderRadius: "4px", objectFit: "cover" }}
                    onClick={() => setCroquisZoom(src)}
                  />
                ))}
              </div>

              <motion.h2
                style={{
                  textAlign: "center",
                  fontSize: "3rem",
                  color: "#333",
                  textShadow: "2px 2px #aaa",
                  margin: "1rem 0",
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: transitionDuration }}
              >
                Rutas alternas
              </motion.h2>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {croquisZoom && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "rgba(0,0,0,0.7)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 10000,
                      cursor: "pointer"
                    }}
                    onClick={() => setCroquisZoom(null)}
                  >
                    <img
                      src={croquisZoom}
                      alt="Croquis ampliado"
                      style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: "8px" }}
                    />
                  </motion.div>
                )}

                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3655.4819778837486!2d-99.24139777883715!3d19.429861490201027!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d2035aa2b93a85%3A0xee5db7813eb0a150!2sHospital%20Punta%20M%C3%A9dica%20Alta%20Especialidad!5e0!3m2!1ses!2smx!4v1747166897167!5m2!1ses!2smx"
                  width="100%"
                  height="100%"
                  style={{ border: 0, borderRadius: "8px" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* SECCIÓN INFERIOR con fondo rotatorio */}
      <div
        style={{
          display: "flex",
          width: "100%",
          minHeight: "250px",
          position: "relative",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            backgroundColor: "#003366",
            color: "#fff",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            fontSize: "1.7rem",
            zIndex: 1,
          }}
        >
          {fecha} || {hora}
        </div>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: -1 }}>
          <AnimatePresence mode="wait">
            <motion.img
              key={lowerImages[lowerIndex]}
              src={lowerImages[lowerIndex]}
              alt="Fondo inferior"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: fadeDuration }}
            />
          </AnimatePresence>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <img src="/QR.jpg" alt="QR" style={{ width: 160 }} />
          <div style={{ fontSize: "1.2rem", color: "#fff", textShadow: "2px 2px 4px #000" }}>
            www.puntamedica.com
          </div>
          <div style={{ fontSize: "1.2rem", color: "#fff", textShadow: "2px 2px 4px #000" }}>
            <strong>Horarios</strong>
            <br />
            08:00 am - 10:00 pm
            <br />
            Av. Del Conscripto N. 402, Naucalpan Mex.
            <br />
            PRIMERO, TU VIDA.
          </div>
        </div>
        <img
          src="/logo.png"
          alt="Logo"
          style={{ width: "50px", position: "absolute", bottom: "1rem", right: "1rem" }}
        />
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
      </Head>
      {MainContent}
    </>
  );
}
