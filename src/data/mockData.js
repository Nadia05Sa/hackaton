// ============================================
// SISTEMA DE DATOS ESTÁTICOS CON PERSISTENCIA
// ============================================

// Imágenes de ejemplo (URLs públicas que funcionan)
const IMAGENES = {
  productos: [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
    "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400",
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400",
  ],
  turisticos: [
    "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=400",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
  ],
  trueque: [
    "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400",
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400",
    "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=400",
    "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=400",
    "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400",
  ],
};

// Datos iniciales
const datosIniciales = {
  productos: [
    { id: 1, nombre: "iPhone 13 Pro", descripcion: "iPhone 13 Pro en excelente estado, 256GB, color grafito. Incluye cargador original y caja.", categoria: "Electrónica", categoriaId: 1, estado: "Como nuevo", estadoId: 2, intercambioPor: "MacBook o iPad Pro", ubicacion: "CDMX", usuario: "Carlos García", imagen: IMAGENES.productos[0], activo: true, fechaCreacion: "2024-03-10" },
    { id: 2, nombre: "Bicicleta de Montaña Trek", descripcion: "Bicicleta MTB Trek Marlin 7, rodada 29, frenos hidráulicos. Perfecta para trails.", categoria: "Deportes", categoriaId: 2, estado: "Buen estado", estadoId: 4, intercambioPor: "Equipo de fotografía", ubicacion: "Guadalajara", usuario: "Ana Martínez", imagen: IMAGENES.productos[1], activo: true, fechaCreacion: "2024-03-09" },
    { id: 3, nombre: "Cámara Canon EOS R6", descripcion: "Cámara mirrorless full frame con lente 24-105mm f/4. Ideal para video y foto.", categoria: "Fotografía", categoriaId: 5, estado: "Excelente", estadoId: 3, intercambioPor: "Laptop gaming o consola PS5", ubicacion: "Monterrey", usuario: "Roberto Sánchez", imagen: IMAGENES.productos[2], activo: true, fechaCreacion: "2024-03-08" },
    { id: 4, nombre: "Audífonos Sony WH-1000XM5", descripcion: "Audífonos inalámbricos con cancelación de ruido activa. Batería de 30 horas.", categoria: "Electrónica", categoriaId: 1, estado: "Nuevo", estadoId: 1, intercambioPor: "AirPods Max o equivalente", ubicacion: "Puebla", usuario: "María López", imagen: IMAGENES.productos[3], activo: true, fechaCreacion: "2024-03-07" },
    { id: 5, nombre: "Nintendo Switch OLED", descripcion: "Consola Nintendo Switch modelo OLED con 5 juegos físicos. Incluye dock y controles.", categoria: "Videojuegos", categoriaId: 4, estado: "Como nuevo", estadoId: 2, intercambioPor: "Steam Deck o tablet", ubicacion: "Querétaro", usuario: "Diego Fernández", imagen: IMAGENES.productos[4], activo: true, fechaCreacion: "2024-03-06" },
    { id: 6, nombre: "Guitarra Fender Stratocaster", descripcion: "Guitarra eléctrica Fender Player Stratocaster. Color sunburst, mástil de maple.", categoria: "Música", categoriaId: 3, estado: "Buen estado", estadoId: 4, intercambioPor: "Teclado o equipo de audio", ubicacion: "CDMX", usuario: "Laura Torres", imagen: IMAGENES.productos[5], activo: true, fechaCreacion: "2024-03-05" },
    { id: 7, nombre: "MacBook Air M2", descripcion: "MacBook Air con chip M2, 8GB RAM, 256GB SSD. Color medianoche.", categoria: "Electrónica", categoriaId: 1, estado: "Excelente", estadoId: 3, intercambioPor: "PC gaming de escritorio", ubicacion: "Tijuana", usuario: "Pedro Ramírez", imagen: IMAGENES.productos[6], activo: false, fechaCreacion: "2024-03-04" },
    { id: 8, nombre: "Reloj Apple Watch Series 9", descripcion: "Apple Watch Series 9 GPS + Cellular, 45mm. Correa deportiva incluida.", categoria: "Electrónica", categoriaId: 1, estado: "Nuevo", estadoId: 1, intercambioPor: "Garmin o reloj de lujo", ubicacion: "León", usuario: "Sofía Mendoza", imagen: IMAGENES.productos[7], activo: true, fechaCreacion: "2024-03-03" },
  ],
  lugaresTuristicos: [
    { id: 1, nombre: "Zona Arqueológica de Teotihuacán", descripcion: "Impresionante sitio arqueológico con las pirámides del Sol y la Luna. Patrimonio de la Humanidad.", ubicacion: "Estado de México", direccion: "San Juan Teotihuacán", categoria: "Arqueológico", categoriaId: 1, horario: "9:00 AM - 5:00 PM", costoEntrada: 85, imagen: IMAGENES.turisticos[0], calificacion: 4.8, numResenas: 1250, activo: true },
    { id: 2, nombre: "Cascadas de Hierve el Agua", descripcion: "Formaciones rocosas naturales con cascadas petrificadas y pozas naturales para nadar.", ubicacion: "Oaxaca", direccion: "San Lorenzo Albarradas", categoria: "Natural", categoriaId: 2, horario: "8:00 AM - 6:00 PM", costoEntrada: 50, imagen: IMAGENES.turisticos[1], calificacion: 4.6, numResenas: 856, activo: true },
    { id: 3, nombre: "Museo Nacional de Antropología", descripcion: "El museo más importante de México con colecciones prehispánicas únicas.", ubicacion: "CDMX", direccion: "Paseo de la Reforma, Chapultepec", categoria: "Cultural", categoriaId: 3, horario: "9:00 AM - 7:00 PM", costoEntrada: 85, imagen: IMAGENES.turisticos[2], calificacion: 4.9, numResenas: 2100, activo: true },
    { id: 4, nombre: "Cenote Ik Kil", descripcion: "Espectacular cenote sagrado maya con aguas cristalinas para nadar.", ubicacion: "Yucatán", direccion: "Carretera Mérida-Valladolid", categoria: "Natural", categoriaId: 2, horario: "8:00 AM - 5:00 PM", costoEntrada: 150, imagen: IMAGENES.turisticos[3], calificacion: 4.7, numResenas: 980, activo: true },
    { id: 5, nombre: "Basílica de Guadalupe", descripcion: "El santuario mariano más visitado del mundo. Arquitectura moderna y colonial.", ubicacion: "CDMX", direccion: "Plaza de las Américas, Villa de Guadalupe", categoria: "Religioso", categoriaId: 5, horario: "6:00 AM - 9:00 PM", costoEntrada: 0, imagen: IMAGENES.turisticos[4], calificacion: 4.8, numResenas: 3500, activo: true },
    { id: 6, nombre: "Xochimilco", descripcion: "Paseo en trajineras por los canales aztecas. Patrimonio de la Humanidad.", ubicacion: "CDMX", direccion: "Embarcadero Cuemanco", categoria: "Recreativo", categoriaId: 6, horario: "9:00 AM - 6:00 PM", costoEntrada: 0, imagen: IMAGENES.turisticos[5], calificacion: 4.5, numResenas: 1800, activo: false },
  ],
  lugaresTrueque: [
    { id: 1, nombre: "Tianguis del Chopo", descripcion: "El tianguis cultural más famoso de México. Rock, punk, alternativo y coleccionables.", ubicacion: "CDMX", direccion: "Calle Aldama, Col. Guerrero", tipo: "Tianguis Cultural", tipoId: 3, horario: "Sábados 10:00 AM - 5:00 PM", imagen: IMAGENES.trueque[0], activo: true },
    { id: 2, nombre: "Mercado de Sonora", descripcion: "Mercado tradicional con artículos esotéricos, plantas y animales.", ubicacion: "CDMX", direccion: "Fray Servando Teresa de Mier", tipo: "Mercado", tipoId: 2, horario: "Lunes a Domingo 9:00 AM - 7:00 PM", imagen: IMAGENES.trueque[1], activo: true },
    { id: 3, nombre: "Tianguis de Coyoacán", descripcion: "Artesanías, antigüedades y productos orgánicos en el corazón de Coyoacán.", ubicacion: "CDMX", direccion: "Plaza Hidalgo, Coyoacán", tipo: "Tianguis", tipoId: 1, horario: "Fines de semana 10:00 AM - 6:00 PM", imagen: IMAGENES.trueque[2], activo: true },
    { id: 4, nombre: "Mercado de Artesanías La Ciudadela", descripcion: "El mejor lugar para encontrar artesanías mexicanas de todo el país.", ubicacion: "CDMX", direccion: "Plaza de la Ciudadela", tipo: "Mercado", tipoId: 2, horario: "Lunes a Sábado 10:00 AM - 7:00 PM", imagen: IMAGENES.trueque[3], activo: true },
    { id: 5, nombre: "Parque México Swap Meet", descripcion: "Punto de encuentro para intercambio de libros, vinilos y artículos vintage.", ubicacion: "CDMX", direccion: "Parque México, Condesa", tipo: "Parque", tipoId: 5, horario: "Domingos 11:00 AM - 4:00 PM", imagen: IMAGENES.trueque[4], activo: false },
  ],
  categorias: [
    { id: 1, nombre: "Electrónica", descripcion: "Dispositivos electrónicos y gadgets", activo: true },
    { id: 2, nombre: "Deportes", descripcion: "Artículos deportivos y fitness", activo: true },
    { id: 3, nombre: "Música", descripcion: "Instrumentos y equipos de audio", activo: true },
    { id: 4, nombre: "Videojuegos", descripcion: "Consolas, juegos y accesorios", activo: true },
    { id: 5, nombre: "Fotografía", descripcion: "Cámaras y equipo fotográfico", activo: true },
    { id: 6, nombre: "Hogar", descripcion: "Artículos para el hogar", activo: true },
    { id: 7, nombre: "Ropa", descripcion: "Vestimenta y accesorios", activo: true },
    { id: 8, nombre: "Libros", descripcion: "Libros, revistas y cómics", activo: true },
  ],
  estadosProducto: [
    { id: 1, nombre: "Nuevo", descripcion: "Producto sin usar, en empaque original", activo: true },
    { id: 2, nombre: "Como nuevo", descripcion: "Usado pocas veces, excelente condición", activo: true },
    { id: 3, nombre: "Excelente", descripcion: "Muy buen estado, mínimos signos de uso", activo: true },
    { id: 4, nombre: "Buen estado", descripcion: "Funciona perfectamente, uso normal", activo: true },
    { id: 5, nombre: "Usado", descripcion: "Signos visibles de uso pero funcional", activo: true },
  ],
  tiposLugarTrueque: [
    { id: 1, nombre: "Tianguis", descripcion: "Mercado ambulante tradicional", activo: true },
    { id: 2, nombre: "Mercado", descripcion: "Mercado establecido", activo: true },
    { id: 3, nombre: "Tianguis Cultural", descripcion: "Mercado de artículos culturales", activo: true },
    { id: 4, nombre: "Plaza Comercial", descripcion: "Centro comercial", activo: true },
    { id: 5, nombre: "Parque", descripcion: "Espacio público abierto", activo: true },
    { id: 6, nombre: "Otro", descripcion: "Otro tipo de lugar", activo: true },
  ],
  categoriasTuristicas: [
    { id: 1, nombre: "Arqueológico", descripcion: "Sitios arqueológicos e históricos", activo: true },
    { id: 2, nombre: "Natural", descripcion: "Paisajes y reservas naturales", activo: true },
    { id: 3, nombre: "Cultural", descripcion: "Museos, teatros y centros culturales", activo: true },
    { id: 4, nombre: "Gastronómico", descripcion: "Restaurantes y mercados de comida", activo: true },
    { id: 5, nombre: "Religioso", descripcion: "Templos e iglesias", activo: true },
    { id: 6, nombre: "Recreativo", descripcion: "Parques y centros de entretenimiento", activo: true },
  ],
  propuestas: [
    { id: 1, productoOfrecidoId: 1, productoSolicitadoId: 3, mensaje: "Me interesa tu cámara, te ofrezco mi iPhone", estado: "PENDIENTE", fecha: "2024-03-12", usuarioOfrecido: "Carlos García", usuarioSolicitado: "Roberto Sánchez" },
    { id: 2, productoOfrecidoId: 2, productoSolicitadoId: 6, mensaje: "¿Te interesa cambiar tu guitarra por mi bicicleta?", estado: "ACEPTADO", fecha: "2024-03-10", usuarioOfrecido: "Ana Martínez", usuarioSolicitado: "Laura Torres" },
  ],
  resenas: [
    { id: 1, lugarTuristicoId: 1, usuario: "María López", calificacion: 5, comentario: "Increíble experiencia, las pirámides son impresionantes.", fecha: "2024-03-01" },
    { id: 2, lugarTuristicoId: 1, usuario: "Pedro Ramírez", calificacion: 4, comentario: "Muy bonito pero hace mucho calor, lleven agua.", fecha: "2024-02-28" },
    { id: 3, lugarTuristicoId: 3, usuario: "Laura Torres", calificacion: 5, comentario: "El mejor museo de México, sin duda.", fecha: "2024-03-05" },
  ],
  estadisticas: {
    totalTrueques: 547,
    truequesCompletados: 423,
    truequesPendientes: 89,
    totalProductos: 8,
    totalUsuarios: 892,
    totalLugaresTuristicos: 6,
    totalLugaresTrueque: 5,
  },
};

// ============================================
// FUNCIONES DE PERSISTENCIA
// ============================================

const STORAGE_KEY = 'almaViajera_data';

// Inicializar o cargar datos
export const initializeData = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(datosIniciales));
    return datosIniciales;
  }
  return JSON.parse(stored);
};

// Guardar datos
const saveData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Obtener todos los datos
export const getData = () => {
  return initializeData();
};

// ============================================
// API MOCK - PRODUCTOS
// ============================================

export const mockProductosApi = {
  listar: (incluirInactivos = false) => {
    const data = getData();
    const productos = incluirInactivos 
      ? data.productos 
      : data.productos.filter(p => p.activo);
    return { success: true, data: productos };
  },
  
  obtenerPorId: (id) => {
    const data = getData();
    const producto = data.productos.find(p => p.id === parseInt(id));
    return producto 
      ? { success: true, data: producto }
      : { success: false, message: "Producto no encontrado" };
  },
  
  crear: (productoData) => {
    const data = getData();
    const nuevoId = Math.max(...data.productos.map(p => p.id), 0) + 1;
    const nuevoProducto = {
      id: nuevoId,
      ...productoData,
      imagen: productoData.imagen || IMAGENES.productos[nuevoId % IMAGENES.productos.length],
      activo: true,
      fechaCreacion: new Date().toISOString().split('T')[0],
    };
    data.productos.push(nuevoProducto);
    saveData(data);
    return { success: true, data: nuevoProducto, message: "Producto creado" };
  },
  
  actualizar: (id, productoData) => {
    const data = getData();
    const index = data.productos.findIndex(p => p.id === parseInt(id));
    if (index !== -1) {
      data.productos[index] = { ...data.productos[index], ...productoData };
      saveData(data);
      return { success: true, data: data.productos[index] };
    }
    return { success: false, message: "Producto no encontrado" };
  },
  
  eliminar: (id) => {
    const data = getData();
    data.productos = data.productos.filter(p => p.id !== parseInt(id));
    saveData(data);
    return { success: true, message: "Producto eliminado" };
  },
  
  cambiarEstado: (id) => {
    const data = getData();
    const producto = data.productos.find(p => p.id === parseInt(id));
    if (producto) {
      producto.activo = !producto.activo;
      saveData(data);
      return { success: true, data: producto };
    }
    return { success: false, message: "Producto no encontrado" };
  },
  
  misProductos: (usuario) => {
    const data = getData();
    const productos = data.productos.filter(p => p.usuario === usuario || true); // Por ahora devuelve todos
    return { success: true, data: productos };
  },
};

// ============================================
// API MOCK - LUGARES TURÍSTICOS
// ============================================

export const mockLugaresTuristicosApi = {
  listar: (incluirInactivos = false) => {
    const data = getData();
    const lugares = incluirInactivos 
      ? data.lugaresTuristicos 
      : data.lugaresTuristicos.filter(l => l.activo);
    return { success: true, data: lugares };
  },
  
  listarActivos: () => {
    const data = getData();
    return { success: true, data: data.lugaresTuristicos.filter(l => l.activo) };
  },
  
  obtenerPorId: (id) => {
    const data = getData();
    const lugar = data.lugaresTuristicos.find(l => l.id === parseInt(id));
    return lugar 
      ? { success: true, data: lugar }
      : { success: false, message: "Lugar no encontrado" };
  },
  
  crear: (lugarData) => {
    const data = getData();
    const nuevoId = Math.max(...data.lugaresTuristicos.map(l => l.id), 0) + 1;
    const nuevoLugar = {
      id: nuevoId,
      ...lugarData,
      imagen: lugarData.imagen || IMAGENES.turisticos[nuevoId % IMAGENES.turisticos.length],
      calificacion: 0,
      numResenas: 0,
      activo: true,
    };
    data.lugaresTuristicos.push(nuevoLugar);
    saveData(data);
    return { success: true, data: nuevoLugar, message: "Lugar turístico creado" };
  },
  
  actualizar: (id, lugarData) => {
    const data = getData();
    const index = data.lugaresTuristicos.findIndex(l => l.id === parseInt(id));
    if (index !== -1) {
      data.lugaresTuristicos[index] = { ...data.lugaresTuristicos[index], ...lugarData };
      saveData(data);
      return { success: true, data: data.lugaresTuristicos[index] };
    }
    return { success: false, message: "Lugar no encontrado" };
  },
  
  eliminar: (id) => {
    const data = getData();
    data.lugaresTuristicos = data.lugaresTuristicos.filter(l => l.id !== parseInt(id));
    saveData(data);
    return { success: true, message: "Lugar eliminado" };
  },
  
  cambiarEstado: (id) => {
    const data = getData();
    const lugar = data.lugaresTuristicos.find(l => l.id === parseInt(id));
    if (lugar) {
      lugar.activo = !lugar.activo;
      saveData(data);
      return { success: true, data: lugar };
    }
    return { success: false, message: "Lugar no encontrado" };
  },
  
  obtenerResenas: (id) => {
    const data = getData();
    const resenas = data.resenas.filter(r => r.lugarTuristicoId === parseInt(id));
    return { success: true, data: resenas };
  },
  
  crearResena: (id, resenaData) => {
    const data = getData();
    const nuevoId = Math.max(...data.resenas.map(r => r.id), 0) + 1;
    const nuevaResena = {
      id: nuevoId,
      lugarTuristicoId: parseInt(id),
      ...resenaData,
      fecha: new Date().toISOString().split('T')[0],
    };
    data.resenas.push(nuevaResena);
    saveData(data);
    return { success: true, data: nuevaResena };
  },
};

// ============================================
// API MOCK - LUGARES DE TRUEQUE
// ============================================

export const mockLugaresTruequeApi = {
  listar: (incluirInactivos = false) => {
    const data = getData();
    const lugares = incluirInactivos 
      ? data.lugaresTrueque 
      : data.lugaresTrueque.filter(l => l.activo);
    return { success: true, data: lugares };
  },
  
  listarActivos: () => {
    const data = getData();
    return { success: true, data: data.lugaresTrueque.filter(l => l.activo) };
  },
  
  obtenerPorId: (id) => {
    const data = getData();
    const lugar = data.lugaresTrueque.find(l => l.id === parseInt(id));
    return lugar 
      ? { success: true, data: lugar }
      : { success: false, message: "Lugar no encontrado" };
  },
  
  crear: (lugarData) => {
    const data = getData();
    const nuevoId = Math.max(...data.lugaresTrueque.map(l => l.id), 0) + 1;
    const nuevoLugar = {
      id: nuevoId,
      ...lugarData,
      imagen: lugarData.imagen || IMAGENES.trueque[nuevoId % IMAGENES.trueque.length],
      activo: true,
    };
    data.lugaresTrueque.push(nuevoLugar);
    saveData(data);
    return { success: true, data: nuevoLugar, message: "Lugar de trueque creado" };
  },
  
  actualizar: (id, lugarData) => {
    const data = getData();
    const index = data.lugaresTrueque.findIndex(l => l.id === parseInt(id));
    if (index !== -1) {
      data.lugaresTrueque[index] = { ...data.lugaresTrueque[index], ...lugarData };
      saveData(data);
      return { success: true, data: data.lugaresTrueque[index] };
    }
    return { success: false, message: "Lugar no encontrado" };
  },
  
  eliminar: (id) => {
    const data = getData();
    data.lugaresTrueque = data.lugaresTrueque.filter(l => l.id !== parseInt(id));
    saveData(data);
    return { success: true, message: "Lugar eliminado" };
  },
  
  cambiarEstado: (id) => {
    const data = getData();
    const lugar = data.lugaresTrueque.find(l => l.id === parseInt(id));
    if (lugar) {
      lugar.activo = !lugar.activo;
      saveData(data);
      return { success: true, data: lugar };
    }
    return { success: false, message: "Lugar no encontrado" };
  },
};

// ============================================
// API MOCK - CATÁLOGOS
// ============================================

export const mockCategoriasApi = {
  listar: () => {
    const data = getData();
    return { success: true, data: data.categorias };
  },
  listarActivas: () => {
    const data = getData();
    return { success: true, data: data.categorias.filter(c => c.activo) };
  },
  crear: (categoriaData) => {
    const data = getData();
    const nuevoId = Math.max(...data.categorias.map(c => c.id), 0) + 1;
    const nuevaCategoria = { id: nuevoId, ...categoriaData, activo: true };
    data.categorias.push(nuevaCategoria);
    saveData(data);
    return { success: true, data: nuevaCategoria };
  },
  actualizar: (id, categoriaData) => {
    const data = getData();
    const index = data.categorias.findIndex(c => c.id === parseInt(id));
    if (index !== -1) {
      data.categorias[index] = { ...data.categorias[index], ...categoriaData };
      saveData(data);
      return { success: true, data: data.categorias[index] };
    }
    return { success: false, message: "Categoría no encontrada" };
  },
  eliminar: (id) => {
    const data = getData();
    data.categorias = data.categorias.filter(c => c.id !== parseInt(id));
    saveData(data);
    return { success: true };
  },
};

export const mockEstadosProductoApi = {
  listar: () => {
    const data = getData();
    return { success: true, data: data.estadosProducto };
  },
  listarActivos: () => {
    const data = getData();
    return { success: true, data: data.estadosProducto.filter(e => e.activo) };
  },
  crear: (estadoData) => {
    const data = getData();
    const nuevoId = Math.max(...data.estadosProducto.map(e => e.id), 0) + 1;
    const nuevoEstado = { id: nuevoId, ...estadoData, activo: true };
    data.estadosProducto.push(nuevoEstado);
    saveData(data);
    return { success: true, data: nuevoEstado };
  },
  actualizar: (id, estadoData) => {
    const data = getData();
    const index = data.estadosProducto.findIndex(e => e.id === parseInt(id));
    if (index !== -1) {
      data.estadosProducto[index] = { ...data.estadosProducto[index], ...estadoData };
      saveData(data);
      return { success: true, data: data.estadosProducto[index] };
    }
    return { success: false, message: "Estado no encontrado" };
  },
  eliminar: (id) => {
    const data = getData();
    data.estadosProducto = data.estadosProducto.filter(e => e.id !== parseInt(id));
    saveData(data);
    return { success: true };
  },
};

export const mockTiposLugarTruequeApi = {
  listar: () => {
    const data = getData();
    return { success: true, data: data.tiposLugarTrueque };
  },
  listarActivos: () => {
    const data = getData();
    return { success: true, data: data.tiposLugarTrueque.filter(t => t.activo) };
  },
  crear: (tipoData) => {
    const data = getData();
    const nuevoId = Math.max(...data.tiposLugarTrueque.map(t => t.id), 0) + 1;
    const nuevoTipo = { id: nuevoId, ...tipoData, activo: true };
    data.tiposLugarTrueque.push(nuevoTipo);
    saveData(data);
    return { success: true, data: nuevoTipo };
  },
  actualizar: (id, tipoData) => {
    const data = getData();
    const index = data.tiposLugarTrueque.findIndex(t => t.id === parseInt(id));
    if (index !== -1) {
      data.tiposLugarTrueque[index] = { ...data.tiposLugarTrueque[index], ...tipoData };
      saveData(data);
      return { success: true, data: data.tiposLugarTrueque[index] };
    }
    return { success: false, message: "Tipo no encontrado" };
  },
  eliminar: (id) => {
    const data = getData();
    data.tiposLugarTrueque = data.tiposLugarTrueque.filter(t => t.id !== parseInt(id));
    saveData(data);
    return { success: true };
  },
};

export const mockCategoriasTuristicasApi = {
  listar: () => {
    const data = getData();
    return { success: true, data: data.categoriasTuristicas };
  },
  listarActivas: () => {
    const data = getData();
    return { success: true, data: data.categoriasTuristicas.filter(c => c.activo) };
  },
  crear: (categoriaData) => {
    const data = getData();
    const nuevoId = Math.max(...data.categoriasTuristicas.map(c => c.id), 0) + 1;
    const nuevaCategoria = { id: nuevoId, ...categoriaData, activo: true };
    data.categoriasTuristicas.push(nuevaCategoria);
    saveData(data);
    return { success: true, data: nuevaCategoria };
  },
  actualizar: (id, categoriaData) => {
    const data = getData();
    const index = data.categoriasTuristicas.findIndex(c => c.id === parseInt(id));
    if (index !== -1) {
      data.categoriasTuristicas[index] = { ...data.categoriasTuristicas[index], ...categoriaData };
      saveData(data);
      return { success: true, data: data.categoriasTuristicas[index] };
    }
    return { success: false, message: "Categoría no encontrada" };
  },
  eliminar: (id) => {
    const data = getData();
    data.categoriasTuristicas = data.categoriasTuristicas.filter(c => c.id !== parseInt(id));
    saveData(data);
    return { success: true };
  },
};

// ============================================
// API MOCK - PROPUESTAS
// ============================================

export const mockPropuestasApi = {
  recibidas: () => {
    const data = getData();
    return { success: true, data: data.propuestas };
  },
  enviadas: () => {
    const data = getData();
    return { success: true, data: data.propuestas };
  },
  crear: (propuestaData) => {
    const data = getData();
    const nuevoId = Math.max(...data.propuestas.map(p => p.id), 0) + 1;
    const nuevaPropuesta = {
      id: nuevoId,
      ...propuestaData,
      estado: "PENDIENTE",
      fecha: new Date().toISOString().split('T')[0],
    };
    data.propuestas.push(nuevaPropuesta);
    saveData(data);
    return { success: true, data: nuevaPropuesta };
  },
  aceptar: (id) => {
    const data = getData();
    const propuesta = data.propuestas.find(p => p.id === parseInt(id));
    if (propuesta) {
      propuesta.estado = "ACEPTADO";
      saveData(data);
      return { success: true, data: propuesta };
    }
    return { success: false, message: "Propuesta no encontrada" };
  },
  rechazar: (id) => {
    const data = getData();
    const propuesta = data.propuestas.find(p => p.id === parseInt(id));
    if (propuesta) {
      propuesta.estado = "RECHAZADO";
      saveData(data);
      return { success: true, data: propuesta };
    }
    return { success: false, message: "Propuesta no encontrada" };
  },
};

// ============================================
// API MOCK - ESTADÍSTICAS
// ============================================

export const mockEstadisticasApi = {
  resumen: () => {
    const data = getData();
    return {
      success: true,
      data: {
        totalTrueques: data.propuestas.length * 50,
        truequesCompletados: data.propuestas.filter(p => p.estado === "ACEPTADO").length * 40,
        truequesPendientes: data.propuestas.filter(p => p.estado === "PENDIENTE").length * 10,
        totalProductos: data.productos.length,
        totalUsuarios: 892,
        totalLugaresTuristicos: data.lugaresTuristicos.filter(l => l.activo).length,
        totalLugaresTrueque: data.lugaresTrueque.filter(l => l.activo).length,
      },
    };
  },
  truequesPorMes: () => {
    return {
      success: true,
      data: [
        { mes: "Ene", cantidad: 45 },
        { mes: "Feb", cantidad: 52 },
        { mes: "Mar", cantidad: 68 },
        { mes: "Abr", cantidad: 74 },
        { mes: "May", cantidad: 89 },
        { mes: "Jun", cantidad: 95 },
      ],
    };
  },
  categoriasPopulares: () => {
    return {
      success: true,
      data: [
        { categoria: "Electrónica", cantidad: 156 },
        { categoria: "Deportes", cantidad: 98 },
        { categoria: "Música", cantidad: 87 },
        { categoria: "Videojuegos", cantidad: 72 },
        { categoria: "Fotografía", cantidad: 65 },
      ],
    };
  },
  lugaresActivos: () => {
    const data = getData();
    return {
      success: true,
      data: data.lugaresTrueque.filter(l => l.activo).map(l => ({
        nombre: l.nombre,
        trueques: Math.floor(Math.random() * 100) + 20,
      })),
    };
  },
  ultimosTrueques: () => {
    const data = getData();
    return {
      success: true,
      data: data.propuestas.slice(0, 5).map(p => {
        const prodOfrecido = data.productos.find(pr => pr.id === p.productoOfrecidoId);
        const prodSolicitado = data.productos.find(pr => pr.id === p.productoSolicitadoId);
        return {
          id: p.id,
          producto1: prodOfrecido?.nombre || "Producto",
          producto2: prodSolicitado?.nombre || "Producto",
          usuario1: p.usuarioOfrecido,
          usuario2: p.usuarioSolicitado,
          fecha: p.fecha,
          estado: p.estado.toLowerCase(),
        };
      }),
    };
  },
};

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
  productos: mockProductosApi,
  lugaresTuristicos: mockLugaresTuristicosApi,
  lugaresTrueque: mockLugaresTruequeApi,
  categorias: mockCategoriasApi,
  estadosProducto: mockEstadosProductoApi,
  tiposLugarTrueque: mockTiposLugarTruequeApi,
  categoriasTuristicas: mockCategoriasTuristicasApi,
  propuestas: mockPropuestasApi,
  estadisticas: mockEstadisticasApi,
};

