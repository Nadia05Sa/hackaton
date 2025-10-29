import { useState } from 'react';
import { AspectRatio, Box, FormControl, FormLabel, Input, Stack, Card, } from '@mui/joy';
import { Divider, Button, useTheme, useMediaQuery, } from '@mui/material';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import ImagenDefaul from './../../../assets/user.png';
import { authService } from './../../../service/authService';
import CircularProgress from '@mui/material/CircularProgress';

const CrearOperador = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { titulo } = location.state || {};
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.only('xs'));
    const [isLoading, setIsLoading] = useState(false);
    const [usuario, setUsuario] = useState({});
    const [preview, setPreview] = useState(null);

    const handleSubmit = async () => {
        setIsLoading(true);
        await authService.registrarOperador(usuario, navigate);
        setIsLoading(false);
    };
    
    return (
        <div className="mt-3">
            <Box sx={{
                display: 'flex',
                justifyContent: isXs ? 'center' : 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2
            }}
            >
                <h1 className="page-title" style={{ paddingLeft: isXs ? 0 : "3rem", textAlign: isXs ? 'center' : 'start'}}>{titulo}</h1>
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
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'center', md: 'flex-start' }}>
                            <Box sx={{ position: 'relative', width: 140, flexShrink: 0 }}>
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
                                        <Input size="sm" value={usuario.nombre || ''} onChange={(e) => setUsuario({ ...usuario, nombre: e.target.value })} />
                                    </FormControl>
                                    <FormControl sx={{ flex: 1 }}>
                                        <FormLabel>Usuario</FormLabel>
                                        <Input size="sm" value={usuario.username || ''} onChange={(e) => setUsuario({ ...usuario, username: e.target.value })} />
                                    </FormControl>
                                </Stack>
                                <Stack spacing={1} direction={{ xs: 'column', sm: 'row', md: 'row' }} sx={{ gap: 2 }}>
                                    <FormControl sx={{ flex: 1 }}>
                                        <FormLabel>Apellido Paterno</FormLabel>
                                        <Input size="sm" value={usuario.apellido_p || ''} onChange={(e) => setUsuario({ ...usuario, apellido_p: e.target.value })} />
                                    </FormControl>
                                    <FormControl sx={{ flex: 1 }}>
                                        <FormLabel>Apellido Materno</FormLabel>
                                        <Input size="sm" value={usuario.apellido_m || ''} onChange={(e) => setUsuario({ ...usuario, apellido_m: e.target.value })} />
                                    </FormControl>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Card>
                </Stack>

                <Box sx={{ paddingRight: isXs ? 0 : "3rem", justifyContent: 'flex-end', display: 'flex', width: '100%' }}>
                    <Button variant="outlined" onClick={() => navigate(-1)} disabled={isLoading}>Cancelar</Button>
                    <Button variant="contained" sx={{ marginLeft: 2 }} onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? <CircularProgress size={24} /> : 'Registrar'}
                    </Button>
                </Box>
            </Box>
        </div>
    );
};

export default CrearOperador;
