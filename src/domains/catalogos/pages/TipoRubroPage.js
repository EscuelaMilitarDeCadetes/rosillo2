// src/domains/catalogos/pages/TipoRubroPage.js
import React from 'react';
import CatalogPage from '../../../components/catalogos/CatalogPage';
import { CATALOGOS_CONFIG } from '../../../features/catalogos/catalogosConfig';

const TipoRubroPage = () => <CatalogPage config={CATALOGOS_CONFIG.tipo_rubro} />;
export default TipoRubroPage;