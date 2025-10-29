import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Divider, useTheme, useMediaQuery } from '@mui/material';
import Input from '@mui/joy/Input'
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from 'react-router-dom';
import { authService } from './../service/authService';
import axios from 'axios';
import Swal from 'sweetalert2';

import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

import iamalogo from './../assets/IAMA.png';
import iamatwo from './../assets/iamatwo.png';

export default function LoginPage() {
  const urlHost = "https://sipet-ejrq.onrender.com";

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Invalidar el token al cargar el componente
  useEffect(() => {
    localStorage.removeItem('authToken'); // Elimina el token
    localStorage.removeItem('refreshToken'); // Opcional: elimina el refresh token si lo usas
  }, []);

  const schema = yup.object().shape({
    usuario: yup.string().required("Ingresa un usuario"),
    password: yup.string().required("Ingresa una contraseña").min(4, "Mínimo 4 caracteres"),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  async function onSubmit(data) {
    setIsLoading(true);
    setLoginError('');

    try {

      const result = await authService.login(data.usuario, data.password);

      if (result.success) {
        const rol = await authService.getRole();
        if (data.password === '12345') {
          const { value: newPassword } = await Swal.fire({
            title: 'Contraseña temporal detectada',
            text: 'Por favor, cambia tu contraseña.',
            input: 'password',
            inputLabel: 'Nueva contraseña',
            inputPlaceholder: 'Ingresa nueva contraseña',
            inputAttributes: {
              minlength: 5,
              autocapitalize: 'off',
              autocorrect: 'off',
              id: 'swal-input-password'
            },
            showCancelButton: true,
            confirmButtonText: 'Actualizar',
            cancelButtonText: 'Cancelar',
            preConfirm: async (password) => {
              if (!password || password.length < 5) {
                Swal.showValidationMessage('La contraseña debe tener al menos 5 caracteres');
                return false;
              }
              const newPassword = password;
              try {
                const username = authService.getUsername(); // desde el token JWT
                await axios.put(`${urlHost}/usuarios/password/${username}/${newPassword}`, {
                  headers: {
                    'Authorization': `Bearer ${authService.getToken()}`,
                    'Content-Type': 'application/json'
                  }
                });
                return password;
              } catch (error) {
                Swal.showValidationMessage('Error al actualizar contraseña');
                return false;
              }
            }
          });

          if (!newPassword) {
            authService.logout(); // Forzar logout si cancela
            return;
          }
        }

        if (rol === 'ADMIN') {
          navigate('/operador');
        } else
          if (rol === 'OPERADOR') {
            navigate('/equipo');
          } else {
            navigate('/');
          }
      } else {
        setLoginError(result.message);
      }

      setIsLoading(false);

    } catch (error) {
      setLoginError(error.response?.data?.message || 'Credenciales incorrectas');
    } finally {
      setIsLoading(false);
    }
  }

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
              backgroundColor: '#fff',
              borderRadius: '10%',
              borderBottomLeftRadius: isXs ? '0%' : '10%',
              borderBottomRightRadius: isXs ? '0%' : '10%',
              ...(isXs ? { height: '70vh' } : {})
            }}
          >
            <h1 className="text-center mt-4" style={{ color: '#000' }}>Inicio de sesión</h1>
            <p className="text-center mb-4" style={{ color: '#000' }}>Bienvenido a SIPET</p>

            <form onSubmit={handleSubmit(onSubmit)} className="p-4">
              <div className="mb-3">
                <div className="input-group">
                  <button
                    type="button"
                    className="btn btn-outline-white border-1"
                    style={{ borderColor: '#94AAC0' }}
                    tabIndex={-1}
                    disabled
                  >
                    <PersonOutlineOutlinedIcon />
                  </button>
                  <Input
                    id="usuario"
                    type="text"
                    style={{ backgroundColor: '#94AAC0', borderColor: '#94AAC0', color: '#fff' }}
                    placeholder="usuario"
                    {...register("usuario")}
                    className="form-control"
                  />
                </div>
                {errors.usuario && <div className="text-warning small">{errors.usuario.message}</div>}
              </div>
              <div className="mb-3">
                <div className="input-group">
                  <button
                    type="button"
                    className="btn btn-outline-white border-1"
                    style={{ borderColor: '#94AAC0' }}
                    tabIndex={-1}
                    disabled
                  >
                    <LockOutlinedIcon />
                  </button>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    style={{ backgroundColor: '#94AAC0', borderColor: '#94AAC0', color: '#fff' }}
                    placeholder="Contraseña"
                    {...register("password")}
                    className="form-control"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-white border-1"
                    style={{ backgroundColor: '#94AAC0', borderLeftColor: '#DDD', color: '#fff' }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                  </button>
                </div>

                {errors.password && <div className="text-warning small">{errors.password.message}</div>}
              </div>

              {loginError && <div className="alert alert-danger">{loginError}</div>}
              <button
                type="submit"
                className="btn btn-light w-100 fw-bold text-light"
                disabled={isLoading}
                style={{ backgroundColor: '#4C7196' }}
              >
                {isLoading ? 'Cargando...' : 'Continuar'}
              </button>
              {/* Botón de recuperar contraseña */}
              <div className="mb-3 text-end">
                <button
                  type="button"
                  className="btn btn-link p-0 pl-1"
                  style={{ color: '#000', textDecoration: 'none', fontSize: 14 }}
                  onClick={() => navigate('/rePassword')}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

