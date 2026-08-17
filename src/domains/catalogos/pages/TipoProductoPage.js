// src/domains/catalogos/pages/TipoProductoPage.js
import React from 'react';
import CatalogPage from '../../../components/catalogos/CatalogPage';
import { CATALOGOS_CONFIG } from '../../../features/catalogos/catalogosConfig';

const TipoProductoPage = () => <CatalogPage config={CATALOGOS_CONFIG.tipo_producto} />;
export default TipoProductoPage;