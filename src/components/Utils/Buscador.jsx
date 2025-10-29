import React, { useState, useEffect } from 'react';
import { Divider, Box, MenuItem, Menu, Button, InputAdornment, TextField, useTheme, useMediaQuery, Typography, IconButton, TablePagination } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function Buscador({ tipo, filtros, busqueda, setBusqueda }) {

    const [filtroSeleccionado, setFiltroSeleccionado] = useState("ACTIVO");
    const [anchorEl, setAnchorEl] = useState(null);

    const abrirMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const cerrarMenu = () => {
        setAnchorEl(null);
    };

    const seleccionarFiltro = (filtro) => {
        setFiltroSeleccionado(filtro);
        cerrarMenu();
    };
    return (
        <>
            {/* Buscador y Filtros */}
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    px: { xs: 1, sm: 2, md: 3 },
                }}
            >
                <TextField
                    size="small"
                    placeholder={`Buscar ${tipo}...`}
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    sx={{
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
                {filtros ? (<><Button
                    variant="outlined"
                    onClick={abrirMenu}
                    sx={{ whiteSpace: 'nowrap' }}
                >
                    {filtroSeleccionado ? filtroSeleccionado : 'Filtros'}
                </Button>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={cerrarMenu}
                    >
                        {filtros.map((filtro) => (
                            <MenuItem
                                key={filtro}
                                selected={filtroSeleccionado === filtro}
                                onClick={() => seleccionarFiltro(filtro)}
                            >
                                {filtro}
                            </MenuItem>
                        ))}
                        <MenuItem
                            onClick={() => {
                                setFiltroSeleccionado(null);
                                cerrarMenu();
                            }}
                        >
                            Limpiar filtros
                        </MenuItem>
                    </Menu></>) :
                    null}

            </Box>
        </>
    )
}