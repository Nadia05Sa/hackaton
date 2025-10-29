import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Divider, useTheme, useMediaQuery } from '@mui/material';
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from 'react-router-dom';
import { authService } from './../service/authService';
import Input from '@mui/joy/Input';
import Swal from 'sweetalert2';
import axios from 'axios';

import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';

import iamalogo from './../assets/IAMA.png';
import iamatwo from './../assets/iamatwo.png';

const RecuperarContraseña = () => {
  const urlHost = "https://sipet-ejrq.onrender.com";

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isTokenStep, setIsTokenStep] = useState(false);

  const schema = yup.object({
    usuario: yup.string().required(isTokenStep ? 'El token es obligatorio' : 'El usuario es obligatorio'),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });


  const handleRequest = async (data) => {
    setIsLoading(true);
    setError('');

    const endpoint = isTokenStep
      ? `${urlHost}/auth/token/${data.usuario}`
      : `${urlHost}/auth/${data.usuario}`;

    try {
      const response = await axios.get(endpoint, {
        headers: { 'Content-Type': 'application/json' },
      });

      const mensaje = response?.data?.metadata?.[0]?.date || "Proceso exitoso";
      const usuario = response?.data?.userResponse?.user?.[0];

      Swal.fire({
        title: 'Éxito',
        text: mensaje,
        icon: 'success',
        confirmButtonText: usuario?.rol ? (isTokenStep ? 'Volver' : 'Aceptar') : 'Volver',
      }).then((result) => {
        if (result.isConfirmed) {
          if (usuario?.rol) {
            if (isTokenStep) {
              navigate('/');
            } else {
              setIsTokenStep(true);
            }
          } else {
            navigate('/');
          }
        }
      });
    } catch (err) {
      setError(err.response?.data?.metadata[0]?.date || 'Error al recuperar contraseña.');
      Swal.fire({
        title: 'Error',
        text: err.response?.data?.metadata[0]?.date || 'Error al recuperar contraseña.',
        icon: 'warning',
        confirmButtonText: 'Regresar',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    reset(); 
    reset({ usuario: '' });
  }, [isTokenStep]);


  return (
    <div className="vh-100" style={{ backgroundColor: '#41514d' }}>

      <div className="align-items-center justify-content-center" style={{ height: '100vh', display: isXs ? 'block' : 'flex' }} >

        {/* Imagen */}
        {!isXs && <div className="d-flex vh-100 justify-content-center align-items-center" style={{ backgroundColor: '#FFF', borderRadius: '40% 0 0 0', maxWidth: '45%' }}>
          <img src={iamalogo} alt="Logo IAMA" className="img-fluid" style={{ maxWidth: '90%' }} />
        </div>
        }
        {isXs &&
          <div className="d-flex justify-content-center align-items-center" style={{ maxWidth: '100%', height: '30vh' }}>
            <img src={iamatwo} alt="Logo IAMA" className="img-fluid" style={{ maxWidth: '80%' }} />
          </div>
        }

        {/* Formulario */}
        <div className="d-flex justify-content-center align-items-center" style={{ width: '100%', }} >
          <div
            className="p-md-2 p-lg-5"
            style={{
              minWidth: '320px',
              backgroundColor: '#fff',
              borderRadius: '10%',
              borderBottomLeftRadius: isXs ? '0%' : '10%',
              borderBottomRightRadius: isXs ? '0%' : '10%',
              ...(isXs ? { height: '70vh' } : {})
            }}
          >
            <h1 className="text-center mt-4" style={{ color: '#000' }}>{isTokenStep ? 'Comprobar Token' : 'Recuperar Contraseña'}</h1>

            <form onSubmit={handleSubmit(handleRequest)} className="p-4">
              <div className="mb-3">
                <div className="input-group">
                  <button
                    type="button"
                    className="btn btn-outline-white border-1"
                    style={{ borderColor: '#94AAC0' }}
                    tabIndex={-1}
                    disabled
                  >
                    {isTokenStep ? <VpnKeyOutlinedIcon /> : <PersonOutlineOutlinedIcon />}
                  </button>
                  <Input
                    id="usuario"
                    type="text"
                    style={{ backgroundColor: '#94AAC0', borderColor: '#94AAC0', color: '#fff' }}
                    placeholder={isTokenStep ? "Ingresa el token" : "Ingresa tu usuario"}
                    defaultValue={""}
                    {...register("usuario")}
                    error={!!errors.usuario}
                    className="form-control"
                  />
                </div>
                {errors.usuario && <div className="text-warning small">{errors.usuario.message}</div>}

              </div>

              <button
                type="submit"
                className="btn btn-light w-100 fw-bold text-light"
                disabled={isLoading}
                style={{ backgroundColor: '#4C7196' }}
              >
                {isLoading ? 'Cargando...' : 'Continuar'}
              </button>

              {isTokenStep && (<button
                type="button"
                className="btn btn-light w-100 fw-bold"
                onClick={() => setIsTokenStep(false)}
                style={{ border: '1px solid #4C7196', color: '#4C7196', marginTop: '10px' }}
              >
                Volver a enviar
              </button>)
              }

              <button
                type="button"
                className="btn btn-light w-100 fw-bold"
                onClick={() => navigate('/')}
                style={{ border: '1px solid #4C7196', color: '#4C7196', marginTop: '10px' }}
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecuperarContraseña;
