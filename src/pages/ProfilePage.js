import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import axiosInstance from '../api/axiosInstance'; // Usaremos axios para obtener/actualizar datos

const ProfilePage = () => {
  const { user: authUser } = useSelector((state) => state.auth);
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      if (authUser?.id) {
        try {
          // Asumimos que tienes un endpoint para obtener los detalles de una persona
          // Tu API debería devolver los datos de la Persona asociada al Usuario
          const response = await axiosInstance.get(`personas/${authUser.id}/`); // O la ruta correcta
          setProfileData(response.data);
        } catch (err) {
          setError('No se pudieron cargar los datos del perfil.');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfileData();
  }, [authUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleSaveChanges = async () => {
    try {
      // Hacemos una petición PUT o PATCH para actualizar los datos
      await axiosInstance.put(`personas/${authUser.id}/`, profileData);
      setIsEditMode(false);
      // Opcional: mostrar un mensaje de éxito
    } catch (err) {
      setError('Error al guardar los cambios.');
    }
  };

  if (loading) {
    return <div className="container mt-5 text-center">Cargando perfil...</div>;
  }

  if (error) {
    return <div className="container mt-5 alert alert-danger">{error}</div>;
  }

  const header = (
    <div className="d-flex justify-content-between align-items-center">
      <span>Datos Personales</span>
      {!isEditMode && (
        <Button icon="pi pi-pencil" className="p-button-rounded p-button-info" onClick={() => setIsEditMode(true)} />
      )}
    </div>
  );

  return (
    <div className="container mt-5">
      <Card title={header}>
        <div className="p-fluid formgrid grid">
          <div className="field col-12 md:col-6">
            <label htmlFor="nombre">Nombre</label>
            <InputText id="nombre" name="nombre" value={profileData?.nombre || ''} onChange={handleInputChange} disabled={!isEditMode} />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="apellido">Apellido</label>
            <InputText id="apellido" name="apellido" value={profileData?.apellido || ''} onChange={handleInputChange} disabled={!isEditMode} />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="documento">Documento</label>
            <InputText id="documento" name="documento" value={profileData?.documento || ''} onChange={handleInputChange} disabled={!isEditMode} />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="correo">Correo Institucional</label>
            <InputText id="correo" name="correo" value={profileData?.correo || ''} disabled />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="celular">Celular</label>
            <InputText id="celular" name="celular" value={profileData?.celular || ''} onChange={handleInputChange} disabled={!isEditMode} />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="cvlac">CVLAC</label>
            <InputText id="cvlac" name="cvlac" value={profileData?.cvlac || ''} onChange={handleInputChange} disabled={!isEditMode} />
          </div>
        </div>
        {isEditMode && (
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button label="Cancelar" className="p-button-secondary" onClick={() => setIsEditMode(false)} />
            <Button label="Guardar Cambios" className="p-button-success" onClick={handleSaveChanges} />
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProfilePage;
