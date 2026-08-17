// src/domains/catalogos/pages/ProductoXGrupoPage.js
import React from 'react';
import CatalogPage from '../../../components/catalogos/CatalogPage';
import { CATALOGOS_CONFIG } from '../../../features/catalogos/catalogosConfig';

const ProductoXGrupoPage = () => <CatalogPage config={CATALOGOS_CONFIG.producto_x_grupo} />;
export default ProductoXGrupoPage;