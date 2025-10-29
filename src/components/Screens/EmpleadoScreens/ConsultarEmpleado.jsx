import React, { useState, useEffect } from 'react';
import { AspectRatio, Box, FormControl, FormLabel, Input, Stack, Typography, Card, Tooltip, IconButton, } from '@mui/joy';
import { Divider, Button, useTheme, useMediaQuery, } from '@mui/material';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import LockRoundedIcon from '@mui/icons-material/LockRounded';

import { authService } from './../../../service/authService';

import axios from 'axios';
import Swal from 'sweetalert2';
import WebStoriesIcon from '@mui/icons-material/WebStories';

import TaskAltIcon from '@mui/icons-material/TaskAlt';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ImagenDefaul from './../../../assets/user.png';
import CircularProgress from '@mui/material/CircularProgress';

const ConsultarEmpleado = () => {
    const urlHost = "http://localhost:8080";
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.only('xs'));
    const isSm = useMediaQuery(theme.breakpoints.only('sm'));
    const navigate = useNavigate();
    const location = useLocation();
    const { id, titulo, peticion, idPeticion } = location.state || {};
    const rolUsuario = authService.getRole();

    const [empleado, setEmpleado] = useState(null);
    const [error, setError] = useState(null);
    const [preview, setPreview] = useState(null);

    const [ActualizarEmpleado, setActualizarEmpleado] = useState(false);
    const [userUpdate, setUserUpdate] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    const Deshabilitar = async (id) => {
        Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción deshabilitará al empleado y no es posible revertirla.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, deshabilitar",
            cancelButtonText: "Cancelar",
            preConfirm: async () => {
                try {
                    const response = await axios.delete(`${urlHost}/api/empleado/deshabilitar/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${authService.getToken()}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    if (response.status === 200) {
                        Swal.fire("Deshabilitado", "Empleado deshabilitado correctamente", "success").then(() => {
                            navigate(-1);
                        });
                    }
                    const meta = response.data.metadata?.[0];
                    if (meta?.codigo === "-1") {
                        Swal.showValidationMessage(meta.date || "Error desconocido");
                        return false;
                    }
                } catch (error) {
                    const mensajeError = error.response?.data?.metadata?.[0]?.date || 'Error al deshabilitar empleado';
                    Swal.showValidationMessage(mensajeError);
                }
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                await Swal.fire('Éxito', 'Peticion para deshabilitar empleado enviada', 'success');
                navigate(-1);
            }
        });
    };

    const Actualizar = async () => {
        setIsLoading(true);
        const dataUsuario = {
            nombre: empleado.nombre || '',
            apellido_p: empleado.apellido_p || '',
            apellido_m: empleado.apellido_m || '',
            telefono: empleado.telefono || '',
            puesto: empleado.puesto || '',
            departamento: empleado.departamento || ''
        };

        // Crea un solo FormData que combine todo
        const formData = new FormData();
        formData.append("empleadoEntity", new Blob([JSON.stringify(dataUsuario)], { type: "application/json" }));

        if (empleado.fotoFile) {
            formData.append("file", empleado.fotoFile);
        } else {
            // Si no hay foto, puedes enviar un valor nulo o una cadena vacía
            formData.append("file", new Blob([], { type: "application/octet-stream" }));
        }
        // Si subió una nueva foto
        if (empleado.nuevaFoto) {
            formData.append("file", empleado.nuevaFoto);
        } else {
            // Si no manda foto nueva, manda un archivo vacío para evitar error 500
            formData.append("file", new Blob());
        }

        try {
            const response = await axios.put(`${urlHost}/api/empleado/${empleado.id}`, formData, {
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`,
                    'Content-Type': 'multipart/form-data'
                },
            });

            const meta = response.data.metadata?.[0];
            if (meta?.codigo === "-1") {
                await Swal.fire("Error", meta.date || "Error al actualizar", "error");
            } else {
                await Swal.fire("Actualizado", "Empleado actualizado correctamente", "success");
                setUserUpdate(true); // Activa recarga
                setActualizarEmpleado(false); // Sal del modo edición
            }

        } catch (error) {
            const mensaje = error.response?.data?.metadata?.[0]?.date || "Error desconocido";
            Swal.fire("Error", mensaje, "error");
        }finally{
            setIsLoading(false);
        }
    };

    const fetchEmpleado = async () => {
        try {
            const response = await axios.get(`${urlHost}/api/empleado/${id}`, {
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`,
                    'Content-Type': 'application/json'
                },
            });

            const resultado = response.data.empleadoResponse.empleado;

            if (Array.isArray(resultado) && resultado.length > 0) {
                setEmpleado(resultado[0]);
            } else {
                setEmpleado(null);
            }
            setError(null);
        } catch (err) {
            setError("Error al cargar los datos. Inténtalo de nuevo.");
        }
    };

    useEffect(() => {
        fetchEmpleado();
    }, [location.pathname, id, userUpdate]);

    const mostrarResponsivas = (id) => {
        if (id) {
            navigate('logResponsivas ', { state: { id: id } })

        }
    }

    if (location.pathname.includes('logResponsivas')) {
        return <Outlet />;
    }


    return (
        <div className="mt-3">
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: isXs ? 'center' : 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2
                }}
            >
                <h1 className="page-title" style={{ paddingLeft: isXs ? 0 : "3rem", textAlign: isXs ? 'center' : 'left' }}>{titulo}</h1>
                {empleado !== null && empleado.responsiva.length > 0 &&
                    <Box className="botones-superiores" sx={{ paddingRight: isXs || isSm ? 0 : "3rem", display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: isXs || isSm ? 'center' : 'flex-start', mb: isXs ? 1 : 0 }}>
                        <Tooltip title="Responsivas">
                            <Button variant="outlined" onClick={() => mostrarResponsivas(empleado.id)}>
                                <WebStoriesIcon />
                            </Button>
                        </Tooltip>
                    </Box>
                }

            </Box>

            <Divider variant="middle" sx={{ borderBottomWidth: 2, borderColor: 'black' }} />

            {empleado !== null ? (
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
                        }}
                        >
                            <Stack
                                direction={{ xs: 'column', md: 'row' }}
                                spacing={3}
                                alignItems={'center'}
                                justifyContent={'center'}
                            >
                                <Box sx={{ position: 'relative', width: 140, flexShrink: 0 }}>
                                    {userUpdate && (
                                        <input
                                            type="file"
                                            accept="image/*"
                                            id="fotoFile"
                                            style={{ display: 'none' }}
                                            onChange={e => {
                                                const file = e.target.files[0];
                                                setEmpleado({ ...empleado, fotoFile: file });
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => setPreview(reader.result);
                                                    reader.readAsDataURL(file);
                                                } else {
                                                    setPreview(null);
                                                }
                                            }}
                                        />
                                    )}
                                    <label htmlFor="fotoFile" style={{ cursor: userUpdate ? 'pointer' : '' }}>
                                        <AspectRatio ratio="1" sx={{ borderRadius: '50%', width: 140 }}>
                                            <img
                                                src={preview || (empleado.fotoBase64 !== null && `data:image/png;base64,${empleado.fotoBase64}`) || ImagenDefaul}
                                                alt="Foto de perfil"
                                            />
                                        </AspectRatio>
                                    </label>

                                </Box>

                                <Stack spacing={2} sx={{ flexGrow: 1, width: '100%' }}>
                                    <Stack spacing={1} direction={{ xs: 'column', sm: 'row', md: 'row' }} sx={{ gap: 2 }}>
                                        <FormControl sx={{ flex: 1 }}>
                                            <FormLabel>Nombre</FormLabel>
                                            <Input size="sm" value={empleado.nombre} disabled={!ActualizarEmpleado} onChange={(e) => setEmpleado({ ...empleado, nombre: e.target.value })} />
                                        </FormControl>
                                        <FormControl sx={{ flex: 1 }}>
                                            <FormLabel>Telefono</FormLabel>
                                            <Input size="sm" value={empleado.telefono} disabled={!ActualizarEmpleado} onChange={(e) => setEmpleado({ ...empleado, telefono: e.target.value })} />
                                        </FormControl>
                                    </Stack>

                                    <Stack spacing={1} direction={{ xs: 'column', sm: 'row', md: 'row' }} sx={{ gap: 2 }}>
                                        <FormControl sx={{ flex: 1 }}>
                                            <FormLabel>Apellido Paterno</FormLabel>
                                            <Input size="sm" value={empleado.apellido_p} disabled={!ActualizarEmpleado} onChange={(e) => setEmpleado({ ...empleado, apellido_p: e.target.value })} />
                                        </FormControl>
                                        <FormControl sx={{ flex: 1 }}>
                                            <FormLabel>Apellido Materno</FormLabel>
                                            <Input size="sm" value={empleado.apellido_m} disabled={!ActualizarEmpleado} onChange={(e) => setEmpleado({ ...empleado, apellido_m: e.target.value })} />
                                        </FormControl>
                                    </Stack>

                                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                                        <FormControl sx={{ flex: 1 }}>
                                            <FormLabel>Puesto</FormLabel>
                                            <Input size="sm" value={empleado.puesto} disabled={!ActualizarEmpleado} onChange={(e) => setEmpleado({ ...empleado, puesto: e.target.value })} />
                                        </FormControl>

                                        <FormControl sx={{ flex: 1 }}>
                                            <FormLabel>Departamento</FormLabel>
                                            <Input size="sm" value={empleado.departamento} disabled={!ActualizarEmpleado} onChange={(e) => setEmpleado({ ...empleado, departamento: e.target.value })} />
                                        </FormControl>

                                        <FormControl sx={{ flex: 1 }}>
                                            <FormLabel>Fecha de registro</FormLabel>
                                            <Input size="sm" value={empleado.fecha_registro ? new Date(empleado.fecha_registro).toLocaleDateString() : ''} endDecorator={<LockRoundedIcon />} disabled />
                                        </FormControl>
                                    </Stack>
                                </Stack>
                            </Stack>

                        </Card>

                    </Stack>
                    <Box sx={{ paddingRight: isXs ? 0 : "3rem", justifyContent: isXs ? 'Center' : 'flex-end', display: 'flex', flexDirection: isXs ? 'Column' : "", width: '100%', gap: 1 }}>
                        <Button variant="outlined" onClick={() => ActualizarEmpleado ? (setActualizarEmpleado(false), setUserUpdate(false), setPreview(null)) : navigate(-1)} disabled={isLoading}>{ActualizarEmpleado ? "Cancelar" : "Regresar"}</Button>
                        {!peticion && !ActualizarEmpleado ? <Button variant="outlined" onClick={() => Deshabilitar(empleado.id)}>Deshabilitar</Button> : null}
                        {!peticion && <Button variant="contained" onClick={() => ActualizarEmpleado ? Actualizar() : (setActualizarEmpleado(true), setUserUpdate(true))} disabled={isLoading}> {ActualizarEmpleado ? (isLoading ? <CircularProgress size={24}/> : "Aceptar") : "Actualizar"}</Button>}

                        {/* Aceptar */}
                        {empleado.estado && peticion !== null && peticion && rolUsuario === 'ADMIN' && (
                            <Tooltip title="Aceptar">
                                <Button variant="contained" onClick={() => authService.GestionarPeticion(idPeticion, true, navigate)}>
                                    <TaskAltIcon />
                                </Button>
                            </Tooltip>
                        )}

                        {/* Eliminar Peticion */}
                        {empleado.estado && peticion !== null && peticion && rolUsuario === 'ADMIN' && (
                            <Tooltip title="Eliminar">
                                <Button variant="contained" onClick={() => authService.EliminarPeticion(idPeticion, navigate)}>
                                    <DeleteOutlineIcon />
                                </Button>
                            </Tooltip>
                        )}
                    </Box>
                </Box>
            ) : (
                <Box sx={{ px: { xs: 2, md: 6 }, py: 4 }}>
                    <Typography variant="h6" color="error">
                        {error || "Cargando informacion..."}
                        {error === null && <CircularProgress />}
                        {error && " Por favor, intenta recargar la página."}
                    </Typography>
                </Box>
            )}
            <Outlet />
        </div>
    );
};
export default ConsultarEmpleado;
