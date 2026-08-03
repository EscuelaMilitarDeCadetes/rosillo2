import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  fetchProyecto,
  fetchInvestigadoresPorProyecto,
  fetchObjetivosPorProyecto,
  fetchProductosPorProyecto,
  fetchDocumentosPorProyecto,
  fetchGastosPorProyecto,
  fetchMontoPorProyecto,
} from "../../features/proyectos/projectsSlice";
import { TabView, TabPanel } from "primereact/tabview";
import ProyectoInfo from "../components/proyectos/ProyectoInfo";
import InvestigadoresProyectoTable from "../components/proyectos/InvestigadoresProyectoTable";
import ObjetivosProyectoTable from "../components/proyectos/ObjetivosProyectoTable";
import ProductosProyectoTable from "../components/proyectos/ProductosProyectoTable";
import DocumentosProyectoTable from "../components/proyectos/DocumentosProyectoTable";
import GastosProyectoTable from "../components/proyectos/GastosProyectoTable";
import { ProgressSpinner } from "primereact/progressspinner";

const AllInfoProyectPage = () => {
  const { id } = useParams(); // Obtener el ID del proyecto de la URL
  const dispatch = useDispatch();
  const { proyectoActual, loading, error } = useSelector(
    (state) => state.proyectos
  );
  const { roles } = useSelector((state) => state.auth);

  // Función auxiliar para verificar roles
  const hasAnyRole = (requiredRoles) => {
    return requiredRoles.some((role) => roles.includes(role));
  };

  useEffect(() => {
    dispatch(fetchProyecto(id));
    // Cargar todos los datos relacionados al proyecto
    dispatch(fetchInvestigadoresPorProyecto(id));
    dispatch(fetchObjetivosPorProyecto(id));
    dispatch(fetchProductosPorProyecto(id));
    dispatch(fetchDocumentosPorProyecto(id));
    dispatch(fetchGastosPorProyecto(id));
    dispatch(fetchMontoPorProyecto(id));
  }, [dispatch, id]);

  if (loading) {
    return (
      <>
        <ProyectoInfo proyecto={proyectoActual} />
        <div className="card mt-4">
          <TabView scrollable>
            {" "}
            {/* Añadimos scrollable para muchas pestañas */}
            <TabPanel header="Investigadores">
              <InvestigadoresProyectoTable proyectoId={id} />
            </TabPanel>
            <TabPanel header="Objetivos">
              <ObjetivosProyectoTable proyectoId={id} />
            </TabPanel>
            <TabPanel header="Productos">
              <ProductosProyectoTable proyectoId={id} />
            </TabPanel>
            <TabPanel header="Documentos">
              <DocumentosProyectoTable proyectoId={id} />
            </TabPanel>
            {proyectoActual?.financiado && (
              <TabPanel header="Gastos y Presupuesto">
                <GastosProyectoTable proyectoId={id} />
              </TabPanel>
            )}
          </TabView>
        </div>
      </>
    );
  }
};

export default AllInfoProyectPage;
