import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { consultarPermiso, pedirPermiso } from '../lib/permisos';
import type { EstadoPermiso, Recurso } from '../types';

// Estados: cargando -> concedido | preguntable | bloqueado
export function usePermiso(recurso: Recurso) {
  const [estado, setEstado] = useState<EstadoPermiso>('cargando');

  const actualizar = useCallback(() => {
    let vigente = true;
    consultarPermiso(recurso).then((nuevo) => {
      if (vigente) {
        setEstado(nuevo);
      }
    });
    return () => {
      vigente = false;
    };
  }, [recurso]);

  // Se vuelve a consultar cada vez que la pantalla toma foco
  // (por ejemplo, al cerrar el modal de permisos o al cambiar de pestaña).
  useFocusEffect(actualizar);

  // Y cuando la app vuelve a primer plano (por ejemplo, desde Ajustes).
  useEffect(() => {
    let cancelar = () => {};
    const suscripcion = AppState.addEventListener('change', (estadoApp) => {
      if (estadoApp === 'active') {
        cancelar();
        cancelar = actualizar();
      }
    });
    return () => {
      suscripcion.remove();
      cancelar();
    };
  }, [actualizar]);

  const pedir = useCallback(async () => {
    const nuevo = await pedirPermiso(recurso);
    setEstado(nuevo);
    return nuevo;
  }, [recurso]);

  return { estado, pedir };
}
