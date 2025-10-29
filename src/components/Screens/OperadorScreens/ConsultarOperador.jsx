import React, { useState, useEffect } from 'react';
import { AspectRatio, Box, FormControl, FormLabel, Input, Stack, Typography, Card, Tooltip } from '@mui/joy';
import { Divider, Button, useTheme, useMediaQuery, } from '@mui/material';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { authService } from './../../../service/authService';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ImagenDefaul from './../../../assets/user.png';
import CircularProgress from '@mui/material/CircularProgress';

const ConsultarOperador = () => {
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.only('xs'));
    const navigate = useNavigate();
    const location = useLocation();
    const { id, titulo, peticion, idPeticion, estadoPeticion } = location.state || {};

    const rolUsuario = authService.getRole();
    const [usuario, setUsuario] = useState(null);
    const [error, setError] = useState(null);
    const [userUpdate, setUserUpdate] = useState(false);
    const [ActualizarMiPerfil, setActualizarMiPerfil] = useState(false);
    const [preview, setPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const Actualizar = async () => {
        setIsLoading(true);
        const update = await authService.actualizar(usuario);
        if (update) {
            setUserUpdate(true);
            setActualizarMiPerfil(false);
        }
        setIsLoading(false);
    }

    const cargarOperador = async () => {
        const result = await authService.fetchOperador(id);

        if (result.success) {
            setUsuario(result.data);
            setError(null);
        } else {
            setError(result.message);
        }
    };

    useEffect(() => {
        if (userUpdate) return;
        cargarOperador();
    }, [location.pathname, userUpdate]);

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
                <h1 className="page-title" style={{ paddingLeft: isXs ? 0 : "3rem", textAlign: isXs ? 'center' : 'left' }}>{ActualizarMiPerfil ? "Actualizar Operador" : titulo} </h1>
            </Box>

            <Divider variant="middle" sx={{ borderBottomWidth: 2, borderColor: 'black' }} />

            {usuario !== null ? (
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
                                                setUsuario({ ...usuario, fotoFile: file });
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
                                                src={preview || (usuario.fotoBase64 !== null && `data:image/png;base64,${usuario.fotoBase64}`) || ImagenDefaul}
                                                alt="Foto de perfil"
                                            />
                                        </AspectRatio>
                                    </label>
                                </Box>

                                <Stack spacing={2} sx={{ flexGrow: 1, width: '100%' }}>
                                    <Stack spacing={1} direction={{ xs: 'column', sm: 'row', md: 'row' }} sx={{ gap: 2 }}>
                                        <FormControl sx={{ flex: 1 }}>
                                            <FormLabel>Nombre</FormLabel>
                                            <Input size="sm" value={usuario.nombre} disabled={!ActualizarMiPerfil} onChange={(e) => setUsuario({ ...usuario, nombre: e.target.value })} />
                                        </FormControl>
                                        <FormControl sx={{ flex: 1 }}>
                                            <FormLabel>Usuario</FormLabel>
                                            <Input size="sm" value={usuario.username} disabled={!ActualizarMiPerfil || !usuario.rol} onChange={(e) => setUsuario({ ...usuario, username: e.target.value })} />
                                        </FormControl>
                                    </Stack>

                                    <Stack spacing={1} direction={{ xs: 'column', sm: 'row', md: 'row' }} sx={{ gap: 2 }}>
                                        <FormControl sx={{ flex: 1 }}>
                                            <FormLabel>Apellido Paterno</FormLabel>
                                            <Input size="sm" value={usuario.apellido_p} disabled={!ActualizarMiPerfil} onChange={(e) => setUsuario({ ...usuario, apellido_p: e.target.value })} />
                                        </FormControl>
                                        <FormControl sx={{ flex: 1 }}>
                                            <FormLabel>Apellido Materno</FormLabel>
                                            <Input size="sm" value={usuario.apellido_m} disabled={!ActualizarMiPerfil} onChange={(e) => setUsuario({ ...usuario, apellido_m: e.target.value })} />
                                        </FormControl>
                                    </Stack>

                                    <Stack direction={{ xs: 'column', sm: 'row', md: 'row' }} spacing={2}>
                                        <FormControl sx={{ flex: 1 }}>
                                            <FormLabel>Rol</FormLabel>
                                            <Input size="sm" value={usuario.rol ? "Administrador" : "Operador"} endDecorator={<LockRoundedIcon />} disabled />
                                        </FormControl>

                                        <FormControl sx={{ flex: 1 }}>
                                            <FormLabel>Fecha de registro</FormLabel>
                                            <Input size="sm" value={usuario.fecha_registro ? new Date(usuario.fecha_registro).toLocaleDateString() : ''} endDecorator={<LockRoundedIcon />} disabled />
                                        </FormControl>
                                    </Stack>

                                </Stack>

                            </Stack>

                        </Card>

                    </Stack>
                    <Box sx={{ paddingRight: isXs ? 0 : "2rem", justifyContent: isXs ? 'Center' : 'flex-end', display: 'flex', flexDirection: isXs ? 'Column' : "", width: '100%', gap: 1 }}>
                        <Button variant="outlined" onClick={() => ActualizarMiPerfil ? (setUserUpdate(false), setActualizarMiPerfil(false), setPreview(null)) : navigate(-1)} disabled={isLoading}>{ActualizarMiPerfil ? "Cancelar" : "Regresar"}</Button>
                        {!peticion && !ActualizarMiPerfil ? <Button variant="outlined" onClick={() => authService.deshabilitarOperador(usuario.id, navigate)}>Deshabilitar</Button> : null}
                        {!peticion ? <Button variant="contained" onClick={() => ActualizarMiPerfil ? Actualizar() : (setUserUpdate(true), setActualizarMiPerfil(true))} disabled={isLoading}> {ActualizarMiPerfil ? (isLoading ? <CircularProgress size={24} /> : "Aceptar") : "Actualizar"}</Button> : null}

                        {/* Aceptar Peticion */}
                        {!estadoPeticion && peticion !== null && peticion && rolUsuario === 'ADMIN' && (
                            <Tooltip title="Aceptar">
                                <Button variant="contained" onClick={() => authService.GestionarPeticion(idPeticion, true, navigate)}>
                                    <TaskAltIcon />
                                </Button>
                            </Tooltip>
                        )}

                        {/* Eliminar Peticion */}
                        {!estadoPeticion && peticion !== null && peticion && rolUsuario === 'ADMIN' && (
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
                    <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
                        {error || "Cargando información..."}
                        {error === null && <CircularProgress />}
                        {error && " Por favor, intenta recargar la página."}
                    </Typography>
                </Box>
            )}
        </div>
    );
};

export default ConsultarOperador;