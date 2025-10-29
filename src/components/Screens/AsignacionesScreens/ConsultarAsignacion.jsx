import React, { useState, useEffect } from 'react';
import { Divider, Box, Button, Typography, InputAdornment, TextField, useTheme, useMediaQuery, IconButton, FormControl, TablePagination, Icon, List } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Paper, Tooltip, FormControlLabel } from '@mui/material';
import Switch from '@mui/material/Switch';
import { visuallyHidden } from '@mui/utils';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AspectRatio, FormLabel, Stack, Card, Input } from '@mui/joy';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { authService } from './../../../service/authService';

import axios from 'axios';
import Swal from 'sweetalert2';
import LockRoundedIcon from '@mui/icons-material/LockRounded';

//Iconos
import SearchIcon from '@mui/icons-material/Search';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import CachedIcon from '@mui/icons-material/Cached';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import UploadIcon from '@mui/icons-material/Upload';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import CircularProgress from '@mui/material/CircularProgress';

import iamaLogo from './../../../assets/fondo-iama-informes-vertical.jpg';
import ImagenDefaul from './../../../assets/user.png';

const headCells = [
    { id: 'no', numeric: true, center: true, xs: false, view: true, disablePadding: false, label: 'No.' },
    { id: 'tipo', numeric: false, center: false, xs: true, view: true, disablePadding: false, label: 'Tipo' },
    { id: 'no.serie', numeric: false, center: false, xs: true, view: true, disablePadding: false, label: 'No. Serie' },
    { id: 'marca', numeric: false, center: false, xs: false, view: true, disablePadding: false, label: 'Marca' },
    { id: 'modelo', numeric: true, center: false, xs: true, view: true, disablePadding: false, label: 'No. Modelo' },
    { id: 'seleccionar', numeric: false, center: true, xs: false, view: false, disablePadding: false, label: 'Seleccionar' },
];

function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
}

function getComparator(order, orderBy) {
    if (orderBy === 'no') {
        return order === 'desc'
            ? (a, b, aIndex, bIndex) => bIndex - aIndex
            : (a, b, aIndex, bIndex) => aIndex - bIndex;
    }
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function EnhancedTableHead(props) {
    const { order, orderBy, onRequestSort, Xs, viewActualizar } = props;
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };
    return (
        <TableHead>
            <TableRow>
                {headCells.map((headCell) => (

                    (((!Xs) || (Xs && headCell.xs)) &&
                        (((!viewActualizar && headCell.view) || (viewActualizar)) && <TableCell
                            key={headCell.id}
                            align={headCell.center ? 'center' : 'left'}
                            padding={headCell.disablePadding ? 'none' : 'normal'}
                            sortDirection={orderBy === headCell.id ? order : false}
                        >
                            {headCell.id !== 'opciones' && headCell.id !== 'responsiva' ? (
                                <TableSortLabel
                                    active={orderBy === headCell.id}
                                    direction={orderBy === headCell.id ? order : 'asc'}
                                    onClick={createSortHandler(headCell.id)}
                                >
                                    {headCell.label}
                                    {orderBy === headCell.id ? (
                                        <Box component="span" sx={visuallyHidden}>
                                            {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                        </Box>
                                    ) : null}
                                </TableSortLabel>
                            ) : (
                                headCell.label
                            )}
                        </TableCell>))
                ))}
            </TableRow>
        </TableHead>
    );
}

const ConsultarAsignacion = () => {
    const urlHost = "http://localhost:8080";
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.only('xs'));
    const isSm = useMediaQuery(theme.breakpoints.only('sm'));
    const navigate = useNavigate();
    const location = useLocation();
    const { idAsignacion, peticion, estado, comentario, actualizar, idPeticion } = location.state || {};

    const username = authService.getUsername();
    const rolUsuario = authService.getRole();
    const [usuario, setUsuario] = useState(null)

    const [viewActualizar, setViewActualizar] = useState(actualizar || false);
    const [ubicacionAsignacion, setUbicacionAsignacion] = useState('');
    const [asignacion, setAsignacion] = useState(null);
    const [empleado, setEmpleado] = useState(null);

    const [idLista, setIdLista] = useState();
    const [listaEquipos, setListaEquipos] = useState([]);
    const [listEquiposActivos, setListEquiposActivos] = useState([]);
    const [stateUpdate, setStateUpdate] = useState(false);

    const [error, setError] = useState(null);

    const [busqueda, setBusqueda] = useState('');

    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('no');
    const [dense, setDense] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // Configuracion para la tabla 
    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangeDense = (event) => {
        setDense(event.target.checked);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const equiposFiltrados = (stateUpdate ? listEquiposActivos : listaEquipos).filter((equipo) => {
        const coincideBusqueda = busqueda ? (
            (equipo.tipo?.toLowerCase() || '') +
            ' ' +
            (equipo.marca?.toLowerCase() || '') +
            ' ' +
            (equipo.modelo?.toLowerCase() || '') +
            ' ' +
            (equipo.numero_serie?.toLowerCase() || '')
        ).includes(busqueda.toLowerCase())
            : true;
        return coincideBusqueda;
    });

    const visibleRows = React.useMemo(() => {
        let sortedRows;
        if (orderBy === 'no') {
            // Ordena por el índice original
            const indexed = equiposFiltrados.map((row, idx) => ({ row, idx }));
            sortedRows = indexed
                .sort((a, b) => getComparator(order, orderBy)(a.row, b.row, a.idx, b.idx))
                .map(({ row }) => row);
        } else {
            sortedRows = [...equiposFiltrados].sort(getComparator(order, orderBy));
        }
        return sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [order, orderBy, page, rowsPerPage, equiposFiltrados]);

    const fetchAsignacion = async () => {
        try {
            const response = await axios.get(`${urlHost}/api/asignacion/${idAsignacion}`, {
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`,
                    'Content-Type': 'application/json'
                },
            });

            setAsignacion(Array.isArray(response.data.asignacionResponse.asignacion) ? response.data.asignacionResponse.asignacion[0] : []);
            setEmpleado(Array.isArray(response.data.asignacionResponse.asignacion) ? response.data.asignacionResponse.asignacion[0].empleado : []);
            setIdLista(Array.isArray(response.data.asignacionResponse.asignacion) ? response.data.asignacionResponse.asignacion[0].listaEquipos.id : []);
            setUbicacionAsignacion(Array.isArray(response.data.asignacionResponse.asignacion) ? response.data.asignacionResponse.asignacion[0].ubicacion : []);

            setError(null);
        } catch (err) {
            setError("Error al cargar los datos de la asignacion.");
        }
    };

    const fetchLista = async () => {
        try {
            const response = await axios.get(`${urlHost}/api/listasEquipos/${idLista}`, {
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`,
                    'Content-Type': 'application/json'
                },
            });

            setListaEquipos(Array.isArray(response.data.listaEquipoResponse?.listaEquipos?.[0]?.equipoTecnologico) ? response.data.listaEquipoResponse.listaEquipos[0].equipoTecnologico : []);
            setTipo(response.data.listaEquipoResponse?.listaEquipos?.[0]?.tipo) ? response.data.listaEquipoResponse.listaEquipos[0].tipo : [];
            setError(null);

        } catch (err) {
            setError("Error al cargar los datos. Inténtalo de nuevo.");
        }
    };

    const fetchEquipos = async () => {
        try {
            const response = await axios.get(`${urlHost}/api/equipos/activos`,
                {
                    headers: {
                        'Authorization': `Bearer ${authService.getToken}`,
                        'Content-Type': 'application/json'
                    },
                }
            );
            setListEquiposActivos(Array.isArray(response.data.equiposResponse.equipo) ? response.data.equiposResponse.equipo : []);
            setError(null);
        } catch (err) {
            setError("Error al cargar los datos. Inténtalo de nuevo.");
        }
    };


    useEffect(() => {

        if (idAsignacion) {
            fetchAsignacion();
            fetchPerfil();
        }
    }, [idAsignacion, viewActualizar]);

    useEffect(() => {
        if (viewActualizar) {
            fetchLista();
            fetchEquipos();
        } else {
            fetchLista();
            setStateUpdate(false);

        }

    }, [idLista, viewActualizar]);

    const handleSeleccionarEquipo = (equipo) => {
        if (listaEquipos.includes(equipo)) {
            setListaEquipos(listaEquipos.filter((e) => e !== equipo));
            setListEquiposActivos([...listEquiposActivos, equipo]);
        } else {
            setListEquiposActivos(listEquiposActivos.filter((e) => e !== equipo));
            setListaEquipos([...listaEquipos, equipo]);
        }
    };

    const Resetear = () => {
        fetchLista();
        fetchEquipos();
    }

    const mostrarAnexo = (anexo) => {
        if (anexo) {
            // Decodificar Base64 a bytes
            const byteCharacters = atob(anexo);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);

            // Crear Blob PDF
            const blob = new Blob([byteArray], { type: "application/pdf" });
            const blobUrl = URL.createObjectURL(blob);

            // Abrir PDF en nueva pestaña
            window.open(blobUrl, "_blank");
        }
    };


    const Comentario = () => {
        Swal.fire({
            title: 'Comentario',
            text: comentario,
            icon: 'info',
        }).then(

        )
    }

    useEffect(() => {
        if (comentario !== null && actualizar) {
            Comentario();
        }
    }, [comentario])

    // Metodo para actualizar la responsiva
    const ResponsivaFirmada = async () => {
        const { value: file } = await Swal.fire({
            title: 'Subir responsiva firmada',
            input: 'file',
            inputAttributes: {
                accept: 'application/pdf'
            },
            showCancelButton: true,
            confirmButtonText: "Subir",
            cancelButtonText: "Cancelar",
            showLoaderOnConfirm: true,
            preConfirm: async (file) => {
                if (!file) {
                    Swal.showValidationMessage("Debes seleccionar un archivo PDF.");
                    return;
                }

                const formData = new FormData();
                formData.append("file", file);

                try {
                    const response = await axios.put(`${urlHost}/api/asignacion/firma/${idAsignacion}/${idPeticion}`, formData, {
                        headers: {
                            'Authorization': `Bearer ${authService.getToken()}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                    );

                    if (response.status === 200) {
                        return response.data;
                    }
                } catch (err) {
                    Swal.showValidationMessage(err.response.data.metadata[0].date || "Ocurrió un error al subir el archivo.");
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    icon: 'success',
                    title: 'Responsiva subida correctamente',
                    showConfirmButton: true
                }).then(() =>
                    navigate(-1)
                );
            }
        });
    };

    const fetchPerfil = async () => {
        try {
            const response = await axios.get(`${urlHost}/auth/buscar/${username}`, {
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`,
                    'Content-Type': 'application/json'
                },
            });
            const resultado = response.data.userResponse.user;
            if (Array.isArray(resultado) && resultado.length > 0) {
                setUsuario(resultado[0]);
            } else {
                setUsuario(null);
            }
            setError(null);
        } catch (err) {
            setError("Error al cargar los datos. Inténtalo de nuevo.");
        }
    };

    //Metodo para generar el pdf
    const GenerarResponsivaPDF = (empleado, listaEquipos, ubicacionAsignacion) => {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'letter'
        });
        const fecha = new Date().toLocaleDateString();
        const nombreEmpleado = empleado.nombre + " " + empleado.apellido_p + " " + empleado.apellido_m;
        var logo = new Image();
        //Logo
        logo.src = iamaLogo;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.addImage(logo, 'JPEG', 0, 0, pageWidth, pageHeight);
        const fechaFormateada = new Date().toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        //Fecha
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(fechaFormateada, 160, 20, { align: 'left' });

        // Título
        doc.setFontSize(16);
        doc.text('RESPONSIVA DE EQUIPO', 105, 35, { align: 'center' });

        // Subtítulo
        doc.setFontSize(11);
        doc.text(`Sirva éste como comprobante de entrega del equipo que se detalla a continuación:`, 30, 45, { maxWidth: 150, align: 'justify' });


        // Tabla de equipos
        const dataEquipos = listaEquipos.map(eq => [
            eq.tipo,
            eq.marca,
            eq.modelo,
            eq.numero_serie
        ]);
        autoTable(doc, {
            theme: 'striped',
            halign: 'center',
            margin: { top: 40, right: 0, bottom: 0, left: 30 },
            startY: 50,
            head: [['Equipo', 'Marca', 'Modelo', 'No. Serie']],
            body: dataEquipos,
            columnStyles: {
                0: { cellWidth: 35 }, // Equipo
                1: { cellWidth: 35 }, // Marca
                2: { cellWidth: 40 }, // Modelo
                3: { cellWidth: 40 }, // No. Serie
            },
            // Opcional: para que el texto haga salto de línea si es muy largo
            styles: {
                cellWidth: 'wrap',
                fontSize: 10,
            },
        });

        // Usa la posición final de la tabla para colocar el texto debajo
        let y = doc.lastAutoTable.finalY + 10;

        doc.text(`El cual pertenece a la empresa Ingeniería del Agua y Medio Ambiente S.C. y se asigna a ${nombreEmpleado} a partir del ${fechaFormateada} en buenas condiciones para el mejor desarrollo de sus funciones en el área de ${empleado.departamento}, en ${ubicacionAsignacion} quien se compromete a resguardarlo y darle un uso estrictamente laboral.`, 30, y, { maxWidth: 150, align: 'justify' });

        doc.text(`Asimismo, hacemos de su conocimiento que no podrá modificar la configuración del equipo ni instalar software sin ser previamente autorizado por el área de sistemas.`, 30, y + 25, { maxWidth: 150, align: 'justify' })

        doc.text(`Sin más por el momento, quedo a sus órdenes.`, 30, y + 40, { align: 'justify' })

        let yText = doc.text.finalY > 200 ? (doc.text.finalY + 5) : 205
        let operadorNombre = usuario ? `${usuario.nombre} ${usuario.apellido_p} ${usuario.apellido_m}` : 'Nombre';

        // Pie
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('ATENTAMENTE', 105, yText, { align: 'center' });
        doc.setFont('helvetica', 'normal');

        // Coordenadas para firma (centradas en la página)
        const otorganteX = 55;
        const receptorX = 155;
        const lineaY = yText + 45;
        const nombreY = lineaY + 5;
        const labelY = yText + 30;

        // Firmas
        doc.setFontSize(11);
        doc.text('OTORGANTE', otorganteX, labelY - 10, { align: 'center' });
        doc.text('RECEPTOR', receptorX, labelY - 10, { align: 'center' });

        doc.text('________________________', otorganteX, lineaY, { align: 'center' });
        doc.text('________________________', receptorX, lineaY, { align: 'center' });

        doc.text(operadorNombre, otorganteX, nombreY + 5, { align: 'center' });
        doc.text(`${empleado.nombre} ${empleado.apellido_p} ${empleado.apellido_m}`, receptorX, nombreY + 5, { align: 'center' });




        return doc.output('blob'); // Devuelve como Blob para adjuntarlo
    };

    // Metodo para actualizar ubicacion de la responsiva 
    const ActualizarResponsiva = async () => {
        if (listaEquipos.length === 0) {
            Swal.fire({
                title: 'Error',
                text: 'Debes seleccionar al menos un equipo para la asignación.',
                icon: 'error',
            });
            return;
        }
        if (!ubicacionAsignacion || ubicacionAsignacion.trim() === '') {
            Swal.fire({
                title: 'Error',
                text: 'Debes ingresar una ubicación para la asignación.',
                icon: 'error',
            });
            return;
        }
        Swal.fire({
            title: '¿Son los datos correctos?',
            showCancelButton: true,
            confirmButtonText: "Si, actualizar",
            cancelButtonText: "Cancelar",
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                const equipoTecnologico = listaEquipos.map(e => ({ id: e.id }));
                const idsInvalidos = equipoTecnologico
                    .map(obj => obj.id)
                    .filter(id => typeof id !== 'number' || isNaN(id));
                if (idsInvalidos.length > 0) {
                    Swal.fire({
                        title: 'Error',
                        text: `IDs inválidos: ${idsInvalidos.join(', ')}`,
                        icon: 'error',
                    });
                    return;
                }
                try {
                    const formData = new FormData();
                    formData.append("listaEquiposEntity", new Blob([JSON.stringify({ equipoTecnologico })], { type: "application/json" }));
                    formData.append("file", new Blob([], { type: "application/octet-stream" }));

                    const response = await axios.put(`${urlHost}/api/listasEquipos/${idLista}/${idPeticion}`, formData, {
                        headers: {
                            'Authorization': `Bearer ${authService.getToken()}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    });

                    if (response.status === 200) {
                        try {
                            const now = new Date();
                            const fechaHora = now.getFullYear() +
                                '-' + String(now.getMonth() + 1).padStart(2, '0') +
                                '-' + String(now.getDate()).padStart(2, '0') +
                                '_' + String(now.getHours()).padStart(2, '0') +
                                '-' + String(now.getMinutes()).padStart(2, '0') +
                                '-' + String(now.getSeconds()).padStart(2, '0');

                            const pdfFileName = `responsiva_${empleado.nombre}_${fechaHora}.pdf`;
                            const newUbicacion = ubicacionAsignacion;

                            const pdfBlob = GenerarResponsivaPDF(empleado, listaEquipos, newUbicacion);

                            const dataAsignacion = {
                                ubicacion: newUbicacion
                            };

                            const formData = new FormData();
                            formData.append("asignacion", new Blob([JSON.stringify(dataAsignacion)], { type: "application/json" }));
                            formData.append("file", pdfBlob, pdfFileName);
                            const response = await axios.put(`${urlHost}/api/asignacion/${idAsignacion}/${idPeticion}`, formData, {
                                headers: {
                                    'Authorization': `Bearer ${authService.getToken()}`,
                                    'Content-Type': 'multipart/form-data'
                                }
                            });

                            if (response.status === 200) {
                                Swal.fire({
                                    title: 'Éxito',
                                    text: response.data.metadata[0].date,
                                    icon: 'success',
                                }).then(() => {
                                    if (pdfBlob && pdfFileName) {
                                        const url = URL.createObjectURL(pdfBlob);
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.download = pdfFileName;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        URL.revokeObjectURL(url);
                                    }
                                    navigate(-1);
                                });
                            }

                        } catch (err) {
                            Swal.fire({
                                title: 'Ingresa la nueva ubicacion',
                                input: 'text',
                                inputLabel: 'Nueva ubicacion',
                                inputPlaceholder: 'Ingresa nueva ubicacion',
                                inputAttributes: {
                                    autocapitalize: 'off',
                                    autocorrect: 'off'
                                },
                                showCancelButton: true,
                                confirmButtonText: "Aceptar",
                                cancelButtonText: "Cancelar",
                                showLoaderOnConfirm: true,
                                preConfirm: async (ubicacion) => {
                                    const now = new Date();
                                    const fechaHora = now.getFullYear() +
                                        '-' + String(now.getMonth() + 1).padStart(2, '0') +
                                        '-' + String(now.getDate()).padStart(2, '0') +
                                        '_' + String(now.getHours()).padStart(2, '0') +
                                        '-' + String(now.getMinutes()).padStart(2, '0') +
                                        '-' + String(now.getSeconds()).padStart(2, '0');

                                    const pdfFileName = `responsiva_${empleado.nombre}_${fechaHora}.pdf`;
                                    const newUbicacion = ubicacion;

                                    const pdfBlob = GenerarResponsivaPDF(empleado, listaEquipos, newUbicacion);
                                    const dataAsignacion = {
                                        ubicacion: newUbicacion
                                    };

                                    const formData = new FormData();
                                    formData.append("asignacion", new Blob([JSON.stringify(dataAsignacion)], { type: "application/json" }));
                                    formData.append("file", pdfBlob, pdfFileName);

                                    try {
                                        const response = await axios.put(`${urlHost}/api/asignacion/${idAsignacion}/${idPeticion}`, formData, {
                                            headers: {
                                                'Authorization': `Bearer ${authService.getToken()}`,
                                                'Content-Type': 'multipart/form-data'
                                            }
                                        });

                                        if (response.status === 200) {
                                            Swal.fire({
                                                title: 'Éxito',
                                                text: response.data.metadata[0].date,
                                                icon: 'success',
                                            }).then(() => {
                                                if (pdfBlob && pdfFileName) {
                                                    const url = URL.createObjectURL(pdfBlob);
                                                    const link = document.createElement('a');
                                                    link.href = url;
                                                    link.download = pdfFileName;
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                    URL.revokeObjectURL(url);
                                                }
                                                navigate(-1);
                                            });
                                        }
                                    } catch (err) {
                                        Swal.fire('Error', err?.response?.data?.metadata?.[0]?.date || 'Error al actualizar la asignación.', 'error');
                                    }
                                }
                            });
                        }
                    }
                } catch (err) {
                    Swal.fire({
                        title: 'Error',
                        text: err.response?.data?.metadata?.[0]?.date || 'Error al crear la lista de equipos.',
                        icon: 'error',
                    });
                }
            }
        });
    };

    // Metodo para actualizar ubicacion de la responsiva 
    const ActualizarAsignacion = async () => {
        if (listaEquipos.length === 0) {
            Swal.fire({
                title: 'Error',
                text: 'Debes seleccionar al menos un equipo para la asignación.',
                icon: 'error',
            });
            return;
        }
        if (!ubicacionAsignacion || ubicacionAsignacion.trim() === '') {
            Swal.fire({
                title: 'Error',
                text: 'Debes ingresar una ubicación para la asignación.',
                icon: 'error',
            });
            return;
        }
        Swal.fire({
            title: '¿Son los datos correctos?',
            showCancelButton: true,
            confirmButtonText: "Si",
            cancelButtonText: "Cancelar",
            showLoaderOnConfirm: true,
            preConfirm: async () => {

                const now = new Date();
                const fechaHora = now.getFullYear() +
                    '-' + String(now.getMonth() + 1).padStart(2, '0') +
                    '-' + String(now.getDate()).padStart(2, '0') +
                    '_' + String(now.getHours()).padStart(2, '0') +
                    '-' + String(now.getMinutes()).padStart(2, '0') +
                    '-' + String(now.getSeconds()).padStart(2, '0');

                const pdfFileName = `responsiva_${empleado.nombre}_${fechaHora}.pdf`;
                const newUbicacion = ubicacionAsignacion;

                const pdfBlob = GenerarResponsivaPDF(empleado, listaEquipos, newUbicacion);

                const dataAsignacion = {
                    ubicacion: newUbicacion
                };

                const equipoTecnologico = listaEquipos.map(e => ({ id: e.id }));
                const idsInvalidos = equipoTecnologico
                    .map(obj => obj.id)
                    .filter(id => typeof id !== 'number' || isNaN(id));
                if (idsInvalidos.length > 0) {
                    Swal.fire({
                        title: 'Error',
                        text: `IDs inválidos: ${idsInvalidos.join(', ')}`,
                        icon: 'error',
                    });
                    return;
                }

                const formData = new FormData();
                formData.append("asignacion", new Blob([JSON.stringify(dataAsignacion)], { type: "application/json" }));
                formData.append("listaEquipos", new Blob([JSON.stringify({ equipoTecnologico })], { type: "application/json" }));
                formData.append("file", pdfBlob, pdfFileName);

                try {
                    const response = await axios.put(`${urlHost}/api/asignacion/${idAsignacion}`, formData, {
                        headers: {
                            'Authorization': `Bearer ${authService.getToken()}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    });

                    if (response.status === 200) {
                        Swal.fire({
                            title: 'Éxito',
                            text: response.data.metadata[0].date,
                            icon: 'success',
                        }).then(() => {
                            if (pdfBlob && pdfFileName) {
                                const url = URL.createObjectURL(pdfBlob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = pdfFileName;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                URL.revokeObjectURL(url);
                            }
                            navigate(-1);
                        });
                    }

                } catch (err) {
                    Swal.fire('Error', err?.response?.data?.metadata?.[0]?.date || 'Error al actualizar la asignación.', 'error');
                }
            }
        });
    };

    const GestionarPeticion = async (estado) => {
        const confirmacion = await Swal.fire({
            title: estado ? 'Aceptar petición' : 'Rechazar petición',
            text: estado
                ? 'Esta acción aprobará la petición.'
                : '¿Estás seguro de rechazar esta petición?',
            icon: 'question',
            ...(estado ? {} : {
                input: 'text',
                inputLabel: 'Comentario',
                inputPlaceholder: 'Ingresa la razón por la cual rechazas la petición',
                inputAttributes: {
                    minlength: 5,
                    autocapitalize: 'off',
                    autocorrect: 'off'
                },
                inputValidator: (value) => {
                    if (!value || value.length < 0) {
                        return 'Debes ingresar una razon para rechazar la peticion';
                    }
                }
            }),
            showCancelButton: true,
            confirmButtonText: estado ? 'Sí, aceptar' : 'Sí, rechazar',
            cancelButtonText: 'Cancelar',
            preConfirm: async (comentario) => {
                try {
                    const body = estado ? {} : { comentario };

                    const response = await axios.put(`${urlHost}/api/peticiones/${idPeticion}/${estado}`, body, {
                        headers: {
                            Authorization: `Bearer ${authService.getToken}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    return response;
                } catch (error) {
                    Swal.showValidationMessage(
                        error?.response?.data?.metadata?.[0]?.date || 'Error al gestionar la petición.'
                    );
                    return null;
                }
            }
        });

        // Solo continuar si se confirmó y no hubo error
        if (confirmacion.isConfirmed && confirmacion.value) {
            const mensaje = confirmacion.value?.data?.metadata?.[0]?.date || 'Petición gestionada exitosamente.';
            Swal.fire('Éxito', mensaje, 'success').then(() => navigate(-1));
        }
    };

    const EliminarPeticion = async () => {
        const confirmacion = await Swal.fire({
            title: '¿Eliminar petición?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });

        if (confirmacion.isConfirmed) {
            try {
                const response = await axios.delete(`${urlHost}/api/peticiones/${idPeticion}`, {
                    headers: {
                        Authorization: `Bearer ${authService.getToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                const mensaje = response?.data?.metadata?.[0]?.date || 'Petición eliminada correctamente.';
                Swal.fire('Eliminada', mensaje, 'success').then(() => navigate(0));
                fetchPeticiones();
            } catch (error) {
                Swal.fire(
                    'Error',
                    error?.response?.data?.metadata?.[0]?.date || 'Error al eliminar la petición.',
                    'error'
                );
            }
        }
    };

    return (
        <Box className="mt-3">
            <Box
                sx={{
                    display: isXs || isSm ? 'block' : 'flex',
                    justifyContent: isXs || isSm ? 'center' : 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    mb: isXs ? 2 : 0,
                    gap: 1
                }}
            >
                <h1 className="page-title" style={{ paddingLeft: isXs ? 0 : "3rem", textAlign: isXs ? 'center' : 'left' }}>Datos de la asignación</h1>
                {comentario !== null && (
                    <Box className="botones-superiores" sx={{ paddingLeft: isXs || isSm ? 0 : "3rem", display: 'flex', flexWrap: 'wrap', justifyContent: isXs || isSm ? 'center' : 'flex-start' }}>
                        <Button variant="outlined" onClick={() => Comentario()} sx={{ mr: 2 }}>Ver comentario</Button>
                    </Box>
                )}

            </Box>

            <Divider variant="middle" sx={{ borderBottomWidth: 2, borderColor: 'black', mb: 4 }} />

            {asignacion !== null ? (
                <Box>
                    <Typography variant="h6" sx={{ marginLeft: isSm || isXs ? '0' : '3rem', textAlign: isSm || isXs ? 'center' : 'left' }}>
                        Datos del empleado
                    </Typography>
                    <Box sx={{ px: { xs: 0, md: 6 } }}>
                        <Stack direction="row"
                            sx={{
                                display: 'flex',
                                maxWidth: '100%',
                                border: 'none',
                            }}
                        >
                            <Card sx={{
                                p: isXs ? 0 : 3,
                                py: isXs ? 2 : 3,
                                flex: 1,
                                border: 'none',
                                background: '#fff',
                            }}>
                                <Stack
                                    direction={{ xs: 'column', md: 'row' }}
                                    spacing={3}
                                    alignItems={'center'}
                                    justifyContent={'center'}
                                >
                                    <Box sx={{ position: 'relative', width: '10rem', flexShrink: 0 }}>
                                        <AspectRatio ratio="1" sx={{ borderRadius: '50%' }}>
                                            <img
                                                src={(empleado.fotoBase64 !== null && `data:image/png;base64,${empleado.fotoBase64}`) || ImagenDefaul}
                                                alt="Foto de perfil"
                                            />
                                        </AspectRatio>
                                    </Box>

                                    <Stack sx={{
                                        display: 'grid',
                                        gridTemplateColumns: `repeat(auto-fit, minmax(${isXs ? "100%" : "30%"}, 1fr))`,
                                        gap: 2, width: isXs || isSm ? '100%' : '85%'
                                    }}>
                                        <FormControl>
                                            <FormLabel>Nombre</FormLabel>
                                            <Input size="sm" value={empleado.nombre || ''} disabled />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Apellido Paterno</FormLabel>
                                            <Input size="sm" value={empleado.apellido_p || ''} disabled />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Apellido Materno</FormLabel>
                                            <Input size="sm" value={empleado.apellido_m || ''} disabled />
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel>Puesto</FormLabel>
                                            <Input size="sm" value={empleado.puesto || ''} disabled />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Departamento</FormLabel>
                                            <Input size="sm" value={empleado.departamento || ''} disabled />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Teléfono</FormLabel>
                                            <Input size="sm" value={empleado.telefono || ''} disabled />
                                        </FormControl>
                                    </Stack>
                                </Stack>
                            </Card>
                        </Stack>
                    </Box>

                    {/* Ubicación */}

                    <Typography variant="h6" sx={{ marginLeft: isSm || isXs ? '0' : '3rem', textAlign: isSm || isXs ? 'center' : 'left' }}>
                        Datos de la asignacion
                    </Typography>

                    <Box sx={{ px: { xs: 0, md: 6 } }}>
                        <Card sx={{
                            p: isXs ? 0 : 3,
                            py: isXs ? 2 : 3,
                            flex: 1,
                            border: 'none',
                            background: '#fff',
                        }}>
                            <Stack direction={{ xs: 'column', md: 'row' }}
                                spacing={2}
                                alignItems={'center'}
                                justifyContent={'center'}
                            >
                                <Box sx={{ minWidth: 50 }}>
                                    <Tooltip title="Responsiva">
                                        <IconButton onClick={() => mostrarAnexo(asignacion.responsivaActiva?.pdfBase64)} color="primary">
                                            <FileOpenIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>

                                <FormControl fullWidth>
                                    <FormLabel>Ubicación</FormLabel>
                                    <Input
                                        size="sm"
                                        value={ubicacionAsignacion}
                                        onChange={(e) => setUbicacionAsignacion(e.target.value)}
                                        disabled={!viewActualizar}
                                    />
                                </FormControl>


                                <FormControl fullWidth>
                                    <FormLabel>Fecha de registro</FormLabel>
                                    <Input
                                        size="sm"
                                        value={new Date().toLocaleDateString()}
                                        endDecorator={<LockRoundedIcon />}
                                        disabled
                                    />
                                </FormControl>
                            </Stack>
                        </Card>
                    </Box>

                    {/* Equipos */}
                    <Box sx={{
                        display: isXs ? 'block' : 'flex', justifyContent: isXs ? 'center' : 'space-between', paddingRight: isXs ? 0 : 3,
                    }}>
                        <Typography variant="h6" sx={{ marginLeft: isSm || isXs ? '0' : '3rem', textAlign: isSm || isXs ? 'center' : 'left' }}>
                            Lista de equipos
                        </Typography>

                        {/* Buscador */}
                        {viewActualizar && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 2,
                                    alignItems: 'center',
                                    justifyContent: 'flex-start',
                                    px: { xs: 0, sm: 2, md: 3 },
                                }}
                            >
                                <TextField
                                    size="small"
                                    placeholder="Buscar equipo..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    sx={{
                                        minWidth: 280,
                                        flexGrow: 1,
                                        maxWidth: 1350,
                                        '& .MuiInputBase-root': {
                                            paddingLeft: '8px',
                                            paddingRight: '8px',
                                        },
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>)}

                        {/* Opciones */}
                        {viewActualizar &&
                            <Box className="botones-superiores" sx={{ mr: isXs || isSm ? 0 : "3rem", display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: isXs || isSm ? 'center' : 'flex-start' }}>
                                <Tooltip title={"Resetear lista"}>
                                    <Button variant="outlined" onClick={() => Resetear()}>
                                        <CachedIcon />
                                    </Button>
                                </Tooltip>
                                <Button variant="outlined" onClick={() => setStateUpdate(!stateUpdate)}>
                                    {stateUpdate ? 'Ver Seleccionados' : 'Ver Activos'}
                                </Button>


                            </Box>}

                    </Box>

                    {/* Tabla de equipos */}
                    {(viewActualizar ? (stateUpdate ? listEquiposActivos.length > 0 : listaEquipos.length > 0) : listaEquipos.length > 0) ? (
                        <Box>
                            <TableContainer component={Paper} sx={{ mt: 3, width: isXs ? "100%" : null, minWidth: isXs ? 280 : 300 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', paddingX: isXs ? 0 : 3, borderBottom: "1px solid #000", width: isXs ? "100%" : null, }}>
                                    {!isXs &&
                                        <Tooltip title="Espaciado">
                                            <FormControlLabel
                                                control={<Switch checked={dense} onChange={handleChangeDense} />}
                                            />
                                        </Tooltip>
                                    }

                                    {/* Paginacion */}
                                    <TablePagination
                                        component="div"
                                        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
                                        count={visibleRows.length}
                                        page={page}
                                        onPageChange={handleChangePage}
                                        rowsPerPageOptions={[5, 10, 15, 20]}
                                        getItemAriaLabel={(count) => (`Pagina ${count === 'next' ? 'Siguiente' : 'Anterior'}`)}
                                        labelRowsPerPage="Filas"
                                        rowsPerPage={rowsPerPage}
                                        onRowsPerPageChange={handleChangeRowsPerPage}
                                    />
                                </Box>
                                <Table
                                    sx={{ width: isXs ? "100%" : null, minWidth: isXs ? 280 : 300 }}
                                    size={dense ? 'small' : 'medium'}
                                >
                                    {/* Titulos */}
                                    <EnhancedTableHead
                                        order={order}
                                        orderBy={orderBy}
                                        onRequestSort={handleRequestSort}
                                        Xs={isXs}
                                        viewActualizar={viewActualizar}
                                    />
                                    {/* Datos */}
                                    <TableBody>
                                        {visibleRows.map((item, index) => (
                                            <TableRow hover tabIndex={-1} key={item.id} onClick={() => isXs ? (viewActualizar ? handleSeleccionarEquipo(item) : null) : null}>
                                                {!isXs &&
                                                    <TableCell align="center">{page * rowsPerPage + index + 1}</TableCell>
                                                }
                                                <TableCell align='left'>{item.tipo}</TableCell>
                                                <TableCell align='left'>{item.numero_serie}</TableCell>
                                                {!isXs &&
                                                    <TableCell align='left'>{item.marca}</TableCell>
                                                }
                                                <TableCell align='left'>{item.modelo}</TableCell>
                                                {viewActualizar && !isXs &&
                                                    <TableCell align='center'>
                                                        <Tooltip title={stateUpdate ? 'Agregar' : 'Quitar'}>
                                                            <IconButton onClick={() => handleSeleccionarEquipo(item)} color="primary">
                                                                {stateUpdate ? (
                                                                    <AddCircleOutlineIcon />
                                                                ) : (
                                                                    <RemoveCircleOutlineIcon />
                                                                )}
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                }
                                            </TableRow>
                                        ))}
                                        {visibleRows.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center">
                                                    {error ? error : "No hay equipos para mostrar."}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>

                            </TableContainer>
                        </Box>)
                        : (
                            <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
                                {error ? error : "Cargando información..."}
                            </Typography>
                        )}

                    {/* Botones */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: isXs ? 'center' : 'flex-end', px: { xs: 2, md: 6 }, mt: 3, gap: 2 }}>
                        {/* regresar */}
                        <Button variant="outlined" onClick={() => viewActualizar ? (peticion ? navigate(-1) : setViewActualizar(false)) : (navigate(-1))}>
                            {viewActualizar ? "Cancelar" : "Regresar"}
                        </Button>

                        {/* actualizar */}
                        {((estado && asignacion.estado === "ACTIVA") || (peticion && asignacion.estado === "PENDIENTE" && (actualizar !== null && actualizar))) &&
                            <Tooltip title={viewActualizar ? (peticion ? "Actualizar" : "Guardar") : "Actualizar"}>
                                <Button variant="contained" onClick={() => viewActualizar ? (peticion ? ActualizarResponsiva() : ActualizarAsignacion()) : setViewActualizar(true)}>
                                    {viewActualizar ? (peticion ? <UploadIcon /> : <SaveAltIcon />) : <UploadIcon />}
                                </Button>
                            </Tooltip>
                        }

                        {/* Deshacer */}
                        {!viewActualizar && !peticion && asignacion.estado === "ACTIVA" && (
                            <Tooltip title="Deshacer">
                                <Button variant="contained" onClick={() => authService.eliminarAsignacionConSwal(asignacion.id, navigate, true)}>
                                    <DeleteOutlineIcon />
                                </Button>
                            </Tooltip>

                        )}

                        {/* Responsiva */}
                        {asignacion.estado !== "ACTIVA" && peticion !== null && peticion &&
                            <Tooltip title="Subir responsiva">
                                <Button variant="contained" onClick={() => ResponsivaFirmada()}>
                                    <UploadFileIcon />
                                </Button>
                            </Tooltip>
                        }

                        {/* Aceptar/Rechazar */}
                        {asignacion.estado !== "ACTIVA" && peticion !== null && peticion && rolUsuario === 'ADMIN' && (
                            <Tooltip title="Aceptar">
                                <Button variant="contained" onClick={() => GestionarPeticion(true)}>
                                    <TaskAltIcon />
                                </Button>
                            </Tooltip>
                        )}
                        {asignacion.estado !== "ACTIVA" && peticion !== null && peticion && rolUsuario === 'ADMIN' && (
                            <Tooltip title="Rechazar">
                                <Button variant="contained" onClick={() => GestionarPeticion(false)}>
                                    <HighlightOffIcon />
                                </Button>
                            </Tooltip>
                        )}

                        {/* Eliminar Peticion */}
                        {asignacion.estado !== "ACTIVA" && peticion !== null && peticion && rolUsuario === 'ADMIN' && (
                            <Tooltip title="Eliminar">
                                <Button variant="contained" onClick={() => EliminarPeticion()} >
                                    <DeleteOutlineIcon />
                                </Button>
                            </Tooltip>
                        )}
                    </Box>
                </Box>
            ) : (
                <Typography sx={{ mt: 2 }}>
                    {error || "Cargando informacion..."}
                    {error === null && <CircularProgress />}
                    {error && " Por favor, intenta recargar la página."}
                </Typography>
            )
            }


        </Box >
    );
};

export default ConsultarAsignacion;