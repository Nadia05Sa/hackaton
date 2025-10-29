import React, { useState, useEffect } from 'react';
import { AspectRatio, Box, FormControl, FormLabel, Input, Stack, Typography, Card, } from '@mui/joy';
import { Divider, Button, useTheme, useMediaQuery, } from '@mui/material';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import ImagenDefaul from './../../../assets/user.png';

import { authService } from './../../../service/authService'
import axios from 'axios';
import Swal from 'sweetalert2';
import CircularProgress from '@mui/material/CircularProgress';

const CrearEmpleado = () => {
    const urlHost = "http://localhost:8080"

    const navigate = useNavigate();
    const location = useLocation();
    const { titulo } = location.state || {};
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.only('xs'));

    const [empleado, setEmpleado] = useState({});
    const [preview, setPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const registrarEmpleado = async () => {
        setIsLoading(true);
        const dataEmpleado = {
            nombre: empleado.nombre || '',
            apellido_p: empleado.apellido_p || '',
            apellido_m: empleado.apellido_m || '',
            telefono: empleado.telefono || '',
            puesto: empleado.puesto || '',
            departamento: empleado.departamento || ''
        };

        const formData = new FormData();
        formData.append("empleadoEntity", new Blob([JSON.stringify(dataEmpleado)], { type: "application/json" }));
        formData.append("file", empleado.fotoFile || new Blob());

        try {
            const response = await axios.post(`${urlHost}/api/empleado`, formData, {
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            const meta = response.data.metadata?.[0];
            const mensaje = error.response?.data?.metadata?.[0]?.date || "Error desconocido";

            if (meta?.codigo === "-1") {
                Swal.fire("Error", meta.date || "Error al registrar", "error");
            } else {
                Swal.fire("Registrado", "Empleado registrado correctamente", "success").then(() => {
                    navigate(-1);
                });
            }

        } catch (error) {
            const mensaje = error.response?.data?.metadata?.[0]?.date || "Error desconocido";
            Swal.fire("Error", mensaje, "error");
        }finally{
            setIsLoading(false);
        }
    };

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
            </Box>

            <Divider variant="middle" sx={{ borderBottomWidth: 2, borderColor: 'black' }} />

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
                                <label htmlFor="fotoFile" style={{ cursor: 'pointer' }}>
                                    <AspectRatio ratio="1" sx={{ borderRadius: '50%', width: 140 }}>
                                        <img
                                            src={preview || ImagenDefaul}
                                            alt="Foto"
                                        />
                                    </AspectRatio>
                                </label>
                            </Box>

                            <Stack spacing={2} sx={{ flexGrow: 1, width: '100%' }}>
                                <Stack spacing={1} direction={{ xs: 'column', sm: 'row', md: 'row' }} sx={{ gap: 2 }}>
                                    <FormControl sx={{ flex: 1 }}>
                                        <FormLabel>Nombre</FormLabel>
                                        <Input size="sm" onChange={(e) => setEmpleado({ ...empleado, nombre: e.target.value })} />
                                    </FormControl>
                                    <FormControl sx={{ flex: 1 }}>
                                        <FormLabel>Teléfono</FormLabel>
                                        <Input size="sm" onChange={(e) => setEmpleado({ ...empleado, telefono: e.target.value })} />
                                    </FormControl>
                                </Stack>

                                <Stack direction={{ xs: 'column', sm: 'row', md: 'row' }} spacing={2}>
                                    <FormControl sx={{ flex: 1 }}>
                                        <FormLabel>Apellido Paterno</FormLabel>
                                        <Input size="sm" onChange={(e) => setEmpleado({ ...empleado, apellido_p: e.target.value })} />
                                    </FormControl>
                                    <FormControl sx={{ flex: 1 }}>
                                        <FormLabel>Apellido Materno</FormLabel>
                                        <Input size="sm" onChange={(e) => setEmpleado({ ...empleado, apellido_m: e.target.value })} />
                                    </FormControl>
                                </Stack>

                                <Stack direction={{ xs: 'column', sm: 'row', md: 'row' }} spacing={2}>
                                    <FormControl sx={{ flex: 1 }}>
                                        <FormLabel>Puesto</FormLabel>
                                        <Input size="sm" onChange={(e) => setEmpleado({ ...empleado, puesto: e.target.value })} />
                                    </FormControl>
                                    <FormControl sx={{ flex: 1 }}>
                                        <FormLabel>Departamento</FormLabel>
                                        <Input size="sm" onChange={(e) => setEmpleado({ ...empleado, departamento: e.target.value })} />
                                    </FormControl>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Card>
                </Stack>

                <Box sx={{ paddingRight: isXs ? 0 : "3rem", justifyContent: 'flex-end', display: 'flex', width: '100%' }}>
                    <Button variant="outlined" onClick={() => navigate(-1)} disabled={isLoading}>Cancelar</Button>
                    <Button variant="contained" sx={{ marginLeft: 2 }} onClick={registrarEmpleado} disabled={isLoading}> {isLoading ? <CircularProgress size={24} /> : "Registrar"}</Button>
                </Box>
            </Box>
        </div>
    );
};

export default CrearEmpleado;
