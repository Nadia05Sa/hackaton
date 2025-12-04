// ============================================
// DATOS ESTÁTICOS - Estado Global del Sistema
// ============================================

// Imágenes de placeholder válidas
const IMAGENES = {
  productos: [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=300&fit=crop",
  ],
  turisticos: [
    "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400&h=300&fit=crop",
  ],
  trueque: [
    "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&h=300&fit=crop",
  ],
  default: "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400&h=300&fit=crop",
};

// ============================================
// CATÁLOGOS
// ============================================
let categorias = [
  { id: 1, nombre: "Electrónica", descripcion: "Dispositivos electrónicos", activo: true },
  { id: 2, nombre: "Deportes", descripcion: "Artículos deportivos", activo: true },
  { id: 3, nombre: "Música", descripcion: "Instrumentos y equipos", activo: true },
  { id: 4, nombre: "Videojuegos", descripcion: "Consolas y juegos", activo: true },
  { id: 5, nombre: "Fotografía", descripcion: "Cámaras y accesorios", activo: true },
  { id: 6, nombre: "Hogar", descripcion: "Artículos para el hogar", activo: true },
  { id: 7, nombre: "Ropa", descripcion: "Vestimenta y accesorios", activo: true },
  { id: 8, nombre: "Libros", descripcion: "Libros y revistas", activo: true },
];

let estadosProducto = [
  { id: 1, nombre: "Nuevo", descripcion: "Sin usar", activo: true },
  { id: 2, nombre: "Como nuevo", descripcion: "Excelente condición", activo: true },
  { id: 3, nombre: "Buen estado", descripcion: "Uso normal", activo: true },
  { id: 4, nombre: "Usado", descripcion: "Signos de uso", activo: true },
];

let tiposLugarTrueque = [
  { id: 1, nombre: "Tianguis", descripcion: "Mercado ambulante", activo: true },
  { id: 2, nombre: "Mercado", descripcion: "Mercado establecido", activo: true },
  { id: 3, nombre: "Plaza Comercial", descripcion: "Centro comercial", activo: true },
  { id: 4, nombre: "Parque", descripcion: "Espacio público", activo: true },
];

let categoriasTuristicas = [
  { id: 1, nombre: "Arqueológico", descripcion: "Sitios históricos", activo: true },
  { id: 2, nombre: "Natural", descripcion: "Paisajes naturales", activo: true },
  { id: 3, nombre: "Cultural", descripcion: "Museos y centros culturales", activo: true },
  { id: 4, nombre: "Gastronómico", descripcion: "Comida típica", activo: true },
  { id: 5, nombre: "Religioso", descripcion: "Templos e iglesias", activo: true },
];

// ============================================
// PRODUCTOS
// ============================================
let productos = [
  {
    id: 1,
    nombre: "iPhone 13 Pro",
    descripcion: "iPhone 13 Pro en excelente estado, 256GB, color grafito. Incluye caja original y cargador.",
    imagen: IMAGENES.productos[0],
    categoria: "Electrónica",
    categoriaId: 1,
    estado: "Como nuevo",
    estadoId: 2,
    intercambioPor: "MacBook o iPad Pro",
    ubicacion: "Ciudad de México",
    usuario: "Carlos López",
    usuarioId: 2,
    activo: true,
    fechaCreacion: "2024-03-15",
  },
  {
    id: 2,
    nombre: "Bicicleta de Montaña Trek",
    descripcion: "Bicicleta MTB Trek rodada 29, frenos hidráulicos, suspensión delantera RockShox.",
    imagen: IMAGENES.productos[1],
    categoria: "Deportes",
    categoriaId: 2,
    estado: "Buen estado",
    estadoId: 3,
    intercambioPor: "Equipo de gimnasio o cámara",
    ubicacion: "Cuernavaca, Morelos",
    usuario: "Ana Martínez",
    usuarioId: 3,
    activo: true,
    fechaCreacion: "2024-03-14",
  },
  {
    id: 3,
    nombre: "Guitarra Fender Stratocaster",
    descripcion: "Guitarra eléctrica Fender Stratocaster American Professional, color sunburst.",
    imagen: IMAGENES.productos[2],
    categoria: "Música",
    categoriaId: 3,
    estado: "Como nuevo",
    estadoId: 2,
    intercambioPor: "Teclado o equipo de audio",
    ubicacion: "Guadalajara, Jalisco",
    usuario: "Roberto Sánchez",
    usuarioId: 4,
    activo: true,
    fechaCreacion: "2024-03-13",
  },
  {
    id: 4,
    nombre: "PlayStation 5",
    descripcion: "Consola PS5 versión disco con 2 controles y 5 juegos incluidos.",
    imagen: IMAGENES.productos[3],
    categoria: "Videojuegos",
    categoriaId: 4,
    estado: "Nuevo",
    estadoId: 1,
    intercambioPor: "Xbox Series X o PC Gamer",
    ubicacion: "Monterrey, NL",
    usuario: "Miguel Torres",
    usuarioId: 5,
    activo: true,
    fechaCreacion: "2024-03-12",
  },
  {
    id: 5,
    nombre: "Cámara Canon EOS R6",
    descripcion: "Cámara mirrorless full frame Canon EOS R6 con lente 24-105mm f/4.",
    imagen: IMAGENES.productos[4],
    categoria: "Fotografía",
    categoriaId: 5,
    estado: "Como nuevo",
    estadoId: 2,
    intercambioPor: "Drone o equipo de video",
    ubicacion: "Puebla",
    usuario: "Laura García",
    usuarioId: 6,
    activo: true,
    fechaCreacion: "2024-03-11",
  },
  {
    id: 6,
    nombre: "Sofá Seccional Moderno",
    descripcion: "Sofá seccional en forma de L, color gris, tela antimanchas. 3 metros de largo.",
    imagen: IMAGENES.productos[5],
    categoria: "Hogar",
    categoriaId: 6,
    estado: "Buen estado",
    estadoId: 3,
    intercambioPor: "Comedor o electrónicos",
    ubicacion: "Querétaro",
    usuario: "Sofia Ramírez",
    usuarioId: 7,
    activo: true,
    fechaCreacion: "2024-03-10",
  },
];

// ============================================
// LUGARES TURÍSTICOS
// ============================================
let lugaresTuristicos = [
  {
    id: 1,
    nombre: "Zona Arqueológica de Xochicalco",
    descripcion: "Impresionante sitio arqueológico con pirámides y observatorio astronómico. Patrimonio de la Humanidad.",
    imagen: IMAGENES.turisticos[0],
    ubicacion: "Morelos",
    direccion: "Carretera Xochicalco s/n, Miacatlán",
    categoria: "Arqueológico",
    categoriaId: 1,
    horario: "9:00 AM - 5:00 PM",
    costoEntrada: 80,
    calificacion: 4.8,
    numResenas: 156,
    activo: true,
  },
  {
    id: 2,
    nombre: "Cascadas de Agua Azul",
    descripcion: "Hermosas cascadas de agua turquesa en medio de la selva. Ideal para nadar y disfrutar la naturaleza.",
    imagen: IMAGENES.turisticos[1],
    ubicacion: "Chiapas",
    direccion: "Carretera a Palenque km 64",
    categoria: "Natural",
    categoriaId: 2,
    horario: "8:00 AM - 6:00 PM",
    costoEntrada: 50,
    calificacion: 4.9,
    numResenas: 289,
    activo: true,
  },
  {
    id: 3,
    nombre: "Museo Nacional de Antropología",
    descripcion: "El museo más importante de México con colecciones prehispánicas únicas en el mundo.",
    imagen: IMAGENES.turisticos[2],
    ubicacion: "Ciudad de México",
    direccion: "Av. Paseo de la Reforma, Bosque de Chapultepec",
    categoria: "Cultural",
    categoriaId: 3,
    horario: "9:00 AM - 7:00 PM",
    costoEntrada: 85,
    calificacion: 4.9,
    numResenas: 520,
    activo: true,
  },
  {
    id: 4,
    nombre: "Mercado de Coyoacán",
    descripcion: "Tradicional mercado con comida típica mexicana, artesanías y un ambiente único.",
    imagen: IMAGENES.turisticos[3],
    ubicacion: "Ciudad de México",
    direccion: "Ignacio Allende s/n, Coyoacán",
    categoria: "Gastronómico",
    categoriaId: 4,
    horario: "7:00 AM - 8:00 PM",
    costoEntrada: 0,
    calificacion: 4.6,
    numResenas: 342,
    activo: true,
  },
  {
    id: 5,
    nombre: "Basílica de Guadalupe",
    descripcion: "El santuario mariano más visitado del mundo. Arquitectura moderna y antigua.",
    imagen: IMAGENES.turisticos[4],
    ubicacion: "Ciudad de México",
    direccion: "Plaza de las Américas 1, Villa de Guadalupe",
    categoria: "Religioso",
    categoriaId: 5,
    horario: "6:00 AM - 9:00 PM",
    costoEntrada: 0,
    calificacion: 4.8,
    numResenas: 890,
    activo: true,
  },
];

// ============================================
// LUGARES DE TRUEQUE
// ============================================
let lugaresTrueque = [
  {
    id: 1,
    nombre: "Tianguis del Chopo",
    descripcion: "Legendario tianguis cultural donde se intercambia música, ropa alternativa y arte urbano.",
    imagen: IMAGENES.trueque[0],
    ubicacion: "Ciudad de México",
    direccion: "Aldama s/n, Col. Buenavista",
    tipo: "Tianguis Cultural",
    tipoId: 1,
    horario: "Sábados 10:00 AM - 5:00 PM",
    activo: true,
  },
  {
    id: 2,
    nombre: "Mercado de Sonora",
    descripcion: "Famoso mercado tradicional con gran variedad de productos para intercambio.",
    imagen: IMAGENES.trueque[1],
    ubicacion: "Ciudad de México",
    direccion: "Fray Servando Teresa de Mier 419",
    tipo: "Mercado",
    tipoId: 2,
    horario: "Lunes a Domingo 9:00 AM - 7:00 PM",
    activo: true,
  },
  {
    id: 3,
    nombre: "Plaza de la Tecnología",
    descripcion: "Centro comercial especializado en electrónicos, ideal para intercambio de gadgets.",
    imagen: IMAGENES.trueque[2],
    ubicacion: "Ciudad de México",
    direccion: "Eje Central Lázaro Cárdenas 11",
    tipo: "Plaza Comercial",
    tipoId: 3,
    horario: "Lunes a Sábado 10:00 AM - 8:00 PM",
    activo: true,
  },
  {
    id: 4,
    nombre: "Parque de los Venados",
    descripcion: "Espacio verde popular para encuentros de trueque los fines de semana.",
    imagen: IMAGENES.trueque[3],
    ubicacion: "Ciudad de México",
    direccion: "Av. División del Norte, Col. Portales",
    tipo: "Parque",
    tipoId: 4,
    horario: "Domingos 9:00 AM - 3:00 PM",
    activo: true,
  },
];

// ============================================
// PROPUESTAS DE TRUEQUE
// ============================================
let propuestas = [
  {
    id: 1,
    productoOfrecido: { id: 1, nombre: "iPhone 13 Pro", imagen: IMAGENES.productos[0] },
    productoSolicitado: { id: 4, nombre: "PlayStation 5", imagen: IMAGENES.productos[3] },
    usuarioOfrecido: "Carlos López",
    usuarioSolicitado: "Miguel Torres",
    mensaje: "¿Te interesa el intercambio? El iPhone está en perfectas condiciones.",
    estado: "PENDIENTE",
    fecha: "2024-03-15",
  },
  {
    id: 2,
    productoOfrecido: { id: 3, nombre: "Guitarra Fender", imagen: IMAGENES.productos[2] },
    productoSolicitado: { id: 5, nombre: "Cámara Canon EOS R6", imagen: IMAGENES.productos[4] },
    usuarioOfrecido: "Roberto Sánchez",
    usuarioSolicitado: "Laura García",
    mensaje: "Me gustaría intercambiar mi guitarra por tu cámara.",
    estado: "ACEPTADO",
    fecha: "2024-03-14",
  },
];

// ============================================
// RESEÑAS
// ============================================
let resenas = [
  { id: 1, lugarId: 1, usuario: "María G.", calificacion: 5, comentario: "Increíble lugar, muy bien conservado.", fecha: "2024-03-10" },
  { id: 2, lugarId: 1, usuario: "Pedro S.", calificacion: 4, comentario: "Muy interesante, recomendado.", fecha: "2024-03-08" },
  { id: 3, lugarId: 2, usuario: "Ana L.", calificacion: 5, comentario: "Las cascadas son espectaculares!", fecha: "2024-03-05" },
  { id: 4, lugarId: 3, usuario: "Luis R.", calificacion: 5, comentario: "El mejor museo de México.", fecha: "2024-03-01" },
];

// ============================================
// ESTADÍSTICAS (calculadas dinámicamente)
// ============================================
const getEstadisticas = () => ({
  totalTrueques: propuestas.length,
  truequesCompletados: propuestas.filter(p => p.estado === "ACEPTADO").length,
  truequesPendientes: propuestas.filter(p => p.estado === "PENDIENTE").length,
  truequesRechazados: propuestas.filter(p => p.estado === "RECHAZADO").length,
  totalProductos: productos.filter(p => p.activo).length,
  totalUsuarios: 12, // Usuarios simulados
  totalLugaresTuristicos: lugaresTuristicos.filter(l => l.activo).length,
  totalLugaresTrueque: lugaresTrueque.filter(l => l.activo).length,
});

// ============================================
// FUNCIONES CRUD
// ============================================

// Generar ID único
const generarId = (lista) => Math.max(...lista.map(item => item.id), 0) + 1;

// PRODUCTOS
export const productosData = {
  listar: () => [...productos],
  listarActivos: () => productos.filter(p => p.activo),
  obtenerPorId: (id) => productos.find(p => p.id === parseInt(id)),
  crear: (producto) => {
    const nuevo = {
      ...producto,
      id: generarId(productos),
      imagen: producto.imagen || IMAGENES.productos[Math.floor(Math.random() * IMAGENES.productos.length)],
      activo: true,
      fechaCreacion: new Date().toISOString().split('T')[0],
    };
    productos.push(nuevo);
    return nuevo;
  },
  actualizar: (id, datos) => {
    const index = productos.findIndex(p => p.id === parseInt(id));
    if (index !== -1) {
      productos[index] = { ...productos[index], ...datos };
      return productos[index];
    }
    return null;
  },
  eliminar: (id) => {
    productos = productos.filter(p => p.id !== parseInt(id));
    return true;
  },
  cambiarEstado: (id) => {
    const producto = productos.find(p => p.id === parseInt(id));
    if (producto) {
      producto.activo = !producto.activo;
      return producto;
    }
    return null;
  },
  misProductos: (usuarioId) => productos.filter(p => p.usuarioId === usuarioId),
};

// LUGARES TURÍSTICOS
export const lugaresTuristicosData = {
  listar: () => [...lugaresTuristicos],
  listarActivos: () => lugaresTuristicos.filter(l => l.activo),
  obtenerPorId: (id) => lugaresTuristicos.find(l => l.id === parseInt(id)),
  crear: (lugar) => {
    const nuevo = {
      ...lugar,
      id: generarId(lugaresTuristicos),
      imagen: lugar.imagen || IMAGENES.turisticos[Math.floor(Math.random() * IMAGENES.turisticos.length)],
      calificacion: 0,
      numResenas: 0,
      activo: true,
    };
    lugaresTuristicos.push(nuevo);
    return nuevo;
  },
  actualizar: (id, datos) => {
    const index = lugaresTuristicos.findIndex(l => l.id === parseInt(id));
    if (index !== -1) {
      lugaresTuristicos[index] = { ...lugaresTuristicos[index], ...datos };
      return lugaresTuristicos[index];
    }
    return null;
  },
  eliminar: (id) => {
    lugaresTuristicos = lugaresTuristicos.filter(l => l.id !== parseInt(id));
    return true;
  },
  cambiarEstado: (id) => {
    const lugar = lugaresTuristicos.find(l => l.id === parseInt(id));
    if (lugar) {
      lugar.activo = !lugar.activo;
      return lugar;
    }
    return null;
  },
  obtenerResenas: (id) => resenas.filter(r => r.lugarId === parseInt(id)),
  crearResena: (lugarId, resena) => {
    const nueva = {
      ...resena,
      id: generarId(resenas),
      lugarId: parseInt(lugarId),
      fecha: new Date().toISOString().split('T')[0],
    };
    resenas.push(nueva);
    // Actualizar calificación del lugar
    const lugar = lugaresTuristicos.find(l => l.id === parseInt(lugarId));
    if (lugar) {
      const resenasLugar = resenas.filter(r => r.lugarId === parseInt(lugarId));
      lugar.numResenas = resenasLugar.length;
      lugar.calificacion = resenasLugar.reduce((acc, r) => acc + r.calificacion, 0) / resenasLugar.length;
    }
    return nueva;
  },
};

// LUGARES DE TRUEQUE
export const lugaresTruequeData = {
  listar: () => [...lugaresTrueque],
  listarActivos: () => lugaresTrueque.filter(l => l.activo),
  obtenerPorId: (id) => lugaresTrueque.find(l => l.id === parseInt(id)),
  crear: (lugar) => {
    const nuevo = {
      ...lugar,
      id: generarId(lugaresTrueque),
      imagen: lugar.imagen || IMAGENES.trueque[Math.floor(Math.random() * IMAGENES.trueque.length)],
      activo: true,
    };
    lugaresTrueque.push(nuevo);
    return nuevo;
  },
  actualizar: (id, datos) => {
    const index = lugaresTrueque.findIndex(l => l.id === parseInt(id));
    if (index !== -1) {
      lugaresTrueque[index] = { ...lugaresTrueque[index], ...datos };
      return lugaresTrueque[index];
    }
    return null;
  },
  eliminar: (id) => {
    lugaresTrueque = lugaresTrueque.filter(l => l.id !== parseInt(id));
    return true;
  },
  cambiarEstado: (id) => {
    const lugar = lugaresTrueque.find(l => l.id === parseInt(id));
    if (lugar) {
      lugar.activo = !lugar.activo;
      return lugar;
    }
    return null;
  },
};

// CATÁLOGOS
export const catalogosData = {
  categorias: {
    listar: () => [...categorias],
    listarActivas: () => categorias.filter(c => c.activo),
    crear: (cat) => { const nuevo = { ...cat, id: generarId(categorias), activo: true }; categorias.push(nuevo); return nuevo; },
    actualizar: (id, datos) => { const i = categorias.findIndex(c => c.id === parseInt(id)); if (i !== -1) { categorias[i] = { ...categorias[i], ...datos }; return categorias[i]; } return null; },
    eliminar: (id) => { categorias = categorias.filter(c => c.id !== parseInt(id)); return true; },
  },
  estadosProducto: {
    listar: () => [...estadosProducto],
    listarActivos: () => estadosProducto.filter(e => e.activo),
    crear: (est) => { const nuevo = { ...est, id: generarId(estadosProducto), activo: true }; estadosProducto.push(nuevo); return nuevo; },
    actualizar: (id, datos) => { const i = estadosProducto.findIndex(e => e.id === parseInt(id)); if (i !== -1) { estadosProducto[i] = { ...estadosProducto[i], ...datos }; return estadosProducto[i]; } return null; },
    eliminar: (id) => { estadosProducto = estadosProducto.filter(e => e.id !== parseInt(id)); return true; },
  },
  tiposLugarTrueque: {
    listar: () => [...tiposLugarTrueque],
    listarActivos: () => tiposLugarTrueque.filter(t => t.activo),
    crear: (tipo) => { const nuevo = { ...tipo, id: generarId(tiposLugarTrueque), activo: true }; tiposLugarTrueque.push(nuevo); return nuevo; },
    actualizar: (id, datos) => { const i = tiposLugarTrueque.findIndex(t => t.id === parseInt(id)); if (i !== -1) { tiposLugarTrueque[i] = { ...tiposLugarTrueque[i], ...datos }; return tiposLugarTrueque[i]; } return null; },
    eliminar: (id) => { tiposLugarTrueque = tiposLugarTrueque.filter(t => t.id !== parseInt(id)); return true; },
  },
  categoriasTuristicas: {
    listar: () => [...categoriasTuristicas],
    listarActivas: () => categoriasTuristicas.filter(c => c.activo),
    crear: (cat) => { const nuevo = { ...cat, id: generarId(categoriasTuristicas), activo: true }; categoriasTuristicas.push(nuevo); return nuevo; },
    actualizar: (id, datos) => { const i = categoriasTuristicas.findIndex(c => c.id === parseInt(id)); if (i !== -1) { categoriasTuristicas[i] = { ...categoriasTuristicas[i], ...datos }; return categoriasTuristicas[i]; } return null; },
    eliminar: (id) => { categoriasTuristicas = categoriasTuristicas.filter(c => c.id !== parseInt(id)); return true; },
  },
};

// PROPUESTAS
export const propuestasData = {
  listar: () => [...propuestas],
  recibidas: () => propuestas.filter(p => p.estado === "PENDIENTE"),
  enviadas: () => propuestas,
  crear: (propuesta) => {
    const nueva = { ...propuesta, id: generarId(propuestas), estado: "PENDIENTE", fecha: new Date().toISOString().split('T')[0] };
    propuestas.push(nueva);
    return nueva;
  },
  aceptar: (id) => {
    const p = propuestas.find(prop => prop.id === parseInt(id));
    if (p) { p.estado = "ACEPTADO"; return p; }
    return null;
  },
  rechazar: (id) => {
    const p = propuestas.find(prop => prop.id === parseInt(id));
    if (p) { p.estado = "RECHAZADO"; return p; }
    return null;
  },
};

// ESTADÍSTICAS
export const estadisticasData = {
  resumen: () => getEstadisticas(),
  
  // Trueques por mes - basado en datos reales del sistema
  truequesPorMes: () => {
    const totalPropuestas = propuestas.length;
    // Distribución simulada basada en propuestas existentes
    return [
      { mes: "Ene", cantidad: Math.max(1, Math.floor(totalPropuestas * 0.1)) },
      { mes: "Feb", cantidad: Math.max(1, Math.floor(totalPropuestas * 0.12)) },
      { mes: "Mar", cantidad: Math.max(1, Math.floor(totalPropuestas * 0.15)) },
      { mes: "Abr", cantidad: Math.max(1, Math.floor(totalPropuestas * 0.18)) },
      { mes: "May", cantidad: Math.max(1, Math.floor(totalPropuestas * 0.2)) },
      { mes: "Jun", cantidad: Math.max(1, Math.floor(totalPropuestas * 0.25)) },
    ];
  },
  
  // Categorías populares - calculadas desde productos reales
  categoriasPopulares: () => {
    const conteo = {};
    productos.filter(p => p.activo).forEach(p => {
      conteo[p.categoria] = (conteo[p.categoria] || 0) + 1;
    });
    return Object.entries(conteo)
      .map(([categoria, cantidad]) => ({ categoria, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  },
  
  // Lugares activos con trueques simulados
  lugaresActivos: () => {
    const lugaresConTrueques = lugaresTrueque.filter(l => l.activo).map((l, index) => ({
      nombre: l.nombre,
      trueques: Math.max(1, propuestas.length + (4 - index)) // Valores basados en propuestas
    }));
    return lugaresConTrueques.sort((a, b) => b.trueques - a.trueques);
  },
  
  // Últimos trueques desde propuestas reales
  ultimosTrueques: () => propuestas.slice(0, 5).map(p => ({
    id: p.id,
    producto1: p.productoOfrecido?.nombre || "Producto",
    producto2: p.productoSolicitado?.nombre || "Producto",
    usuario1: p.usuarioOfrecido || "Usuario",
    usuario2: p.usuarioSolicitado || "Usuario",
    estado: p.estado,
    fecha: p.fecha,
  })),
};

// USUARIO (para perfil)
export const usuarioData = {
  obtenerPerfil: () => ({
    id: 1,
    username: "admin",
    nombre: "Administrador",
    apellidoPaterno: "Sistema",
    apellidoMaterno: "",
    email: "admin@almaviajera.com",
    telefono: "5551234567",
    rol: "ADMIN",
    activo: true,
  }),
  actualizar: (datos) => datos,
};

// Exportar imágenes para uso externo
export const IMAGENES_PLACEHOLDER = IMAGENES;

