import { router, useLocalSearchParams } from 'expo-router';

import { Boton } from '../../components/Boton';
import { MensajeEstado } from '../../components/MensajeEstado';
import { PreguntaPermiso } from '../../components/PreguntaPermiso';
import { esRecurso } from '../../lib/permisos';

export default function Permiso() {
  const { recurso, isbn } = useLocalSearchParams<{ recurso: string; isbn?: string }>();

  if (!esRecurso(recurso)) {
    return (
      <MensajeEstado icono="help-circle-outline" titulo="Ese permiso no existe en la app." esError>
        <Boton titulo="Cerrar" variante="secundario" onPress={() => router.back()} />
      </MensajeEstado>
    );
  }

  return <PreguntaPermiso recurso={recurso} isbn={isbn} />;
}
