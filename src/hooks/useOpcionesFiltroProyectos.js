// src/hooks/useOpcionesFiltroProyectos.js
import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const OPCIONES_INICIALES = {
  convocatorias: [],
  aniosInicio: [],
  aniosFin: [],
  aniosConvocatoria: [],
};

/**
 * Obtiene las opciones de los dropdowns de filtro (convocatoria, años).
 * El endpoint es fijo y no depende del modo (interno/externo) ni del rol,
 * por eso se ejecuta una sola vez al montar.
 */
export default function useOpcionesFiltroProyectos() {
  const [opcionesFiltro, setOpcionesFiltro] = useState(OPCIONES_INICIALES);

  useEffect(() => {
    axiosInstance.get("investigacion-formal/proyecto-convocatoria/opciones-filtro/").then((res) => {
      setOpcionesFiltro({
        convocatorias: res.data.convocatorias.map((c) => ({ label: c, value: c })),
        aniosInicio: res.data.anios_inicio.map((a) => ({ label: String(a), value: a })),
        aniosFin: res.data.anios_fin.map((a) => ({ label: String(a), value: a })),
        aniosConvocatoria: res.data.anios_convocatoria.map((a) => ({ label: String(a), value: a })),
      });
    });
  }, []);

  return opcionesFiltro;

}