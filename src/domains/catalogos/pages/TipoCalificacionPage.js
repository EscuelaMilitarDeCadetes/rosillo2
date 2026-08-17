// src/domains/catalogos/pages/TipoCalificacionPage.js
import React from 'react';
import CatalogPage from '../../../components/catalogos/CatalogPage';
import { CATALOGOS_CONFIG } from '../../../features/catalogos/catalogosConfig';

const TipoCalificacionPage = () => <CatalogPage config={CATALOGOS_CONFIG.tipo_calificacion} />;
export default TipoCalificacionPage;