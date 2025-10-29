import { useEffect, useState } from 'react';
import { Divider, Button, useTheme, useMediaQuery, } from '@mui/material';
import { AspectRatio, Box, FormControl, FormLabel, Input, Stack, Typography, Card, } from '@mui/joy';
import ImagenDefaul from './../../../assets/user.png';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../service/authService';

import Swal from 'sweetalert2';
import CircularProgress from '@mui/material/CircularProgress';

const Profile = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.only('xs'));
    const [usuario, setUsuario] = useState(null);
    const [error, setError] = useState(null);
    const username = authService.getUsername();
    const [userUpdate, setUserUpdate] = useState(false);
    const [ActualizarMiPerfil, setActualizarMiPerfil] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [preview, setPreview] = useState(null);

    const handleActualizar = async () => {
        setIsLoading(true);
        try {
            const response = await authService.actualizarPerfil(usuario);
            const meta = response.metadata?.[0];
            if (meta?.codigo === "-1") {
                await Swal.fire("Error", meta.date || "Error al actualizar", "error");
            } else {
                await Swal.fire("Actualizado", "Perfil actualizado correctamente", "success");
                setUserUpdate(true);
                setActualizarMiPerfil(false);
            }
        } catch (error) {
            const mensaje = error.response?.data?.metadata?.[0]?.date || "Error desconocido";
            Swal.fire("Error", mensaje, "error");
        } finally {
            setIsLoading(false);
        }

    };

    useEffect(() => {
        if (userUpdate) return;

        const cargarPerfil = async () => {
            const result = await authService.fetchPerfil();
            if (result.success) {
                setUsuario(result.data);
                setError(null);
            } else {
                setUsuario(null);
                setError(result.message);
            }
        };

        cargarPerfil();
    }, [username, userUpdate]);


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
                <h1 className="page-title" style={{ paddingLeft: isXs ? 0 : "3rem" }}>Perfil</h1>
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
                                            <Input size="sm" value={usuario.username} disabled />
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
                    <Box sx={{ paddingRight: isXs ? 0 : "3rem", justifyContent: isXs ? 'Center' : 'flex-end', display: 'flex', flexDirection: isXs ? 'Column' : "", width: '100%' }}>
                        {ActualizarMiPerfil && (<Button variant="outlined" onClick={() => { setActualizarMiPerfil(false); setUserUpdate(false); setPreview(null); }} disabled={isLoading}>Cancelar</Button>)}
                        {!ActualizarMiPerfil && (<Button variant="outlined" sx={{ marginRight: isXs ? 0 : 2 }} onClick={() => authService.cambiarContrasenaConSwal()}>Cambiar Contraseña</Button>)}
                        {!ActualizarMiPerfil && (!usuario.rol ? "" : <Button variant="outlined" sx={{ marginRight: isXs ? 0 : 2, marginY: isXs ? 1 : 0 }} onClick={() => authService.cambiarUsuarioConSwal(navigate)} disabled={isLoading}>Cambiar Usuario</Button>)}
                        <Button variant="contained" sx={{ ml: ActualizarMiPerfil ? (isXs ? 0 : 2) : 0, mt: ActualizarMiPerfil ? (isXs ? 1 : 0) : 0 }} onClick={() => ActualizarMiPerfil ? handleActualizar() : (setUserUpdate(true), setActualizarMiPerfil(true))} disabled={isLoading}>{ActualizarMiPerfil ? (isLoading ? <CircularProgress size={24} /> : "Aceptar") : "Actualizar"} </Button>

                    </Box>
                </Box>
            ) : (
                <Box sx={{ px: { xs: 2, md: 6 }, py: 4 }}>
                    <Typography variant="h6" color="error">
                        {error || "Cargando informacion..."}
                        {error === null && <CircularProgress />}

                    </Typography>
                </Box>
            )}
        </div>
    );
};

export default Profile;
