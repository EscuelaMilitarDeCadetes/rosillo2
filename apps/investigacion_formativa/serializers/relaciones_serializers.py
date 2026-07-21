from rest_framework import serializers

from apps.investigacion_formativa.models import ActividadFormativa
from apps.investigacion_formativa.models import BancoIdeas
from apps.investigacion_formativa.models import CertificacionExterna
from apps.investigacion_formativa.models import Estudiante
from apps.investigacion_formativa.models import EtapaFlujo
from apps.investigacion_formativa.models import EvaluacionProceso
from apps.investigacion_formativa.models import EventoEvaluativo
from apps.investigacion_formativa.models import FlujoProceso
from apps.investigacion_formativa.models import Homologacion
from apps.investigacion_formativa.models import InstanciaEtapa
from apps.investigacion_formativa.models import ModalidadXFacultad
from apps.investigacion_formativa.models import ParticipanteProceso
from apps.investigacion_formativa.models import PlanTrabajo
from apps.investigacion_formativa.models import PostulacionProceso
from apps.investigacion_formativa.models import ProcesoFormativoXProyecto
from apps.investigacion_formativa.models import ProcesoFormativo
from apps.investigacion_formativa.models import RegistroActividades
from apps.investigacion_formativa.models import RegistroHoras
from apps.investigacion_formativa.models import ReglaFlujo
from apps.investigacion_formativa.models import RequisitoModalidad
from apps.investigacion_formativa.models import Revision
from apps.investigacion_formativa.models import SegundaInstancia
from apps.investigacion_formativa.models import TransicionFlujo
from apps.investigacion_formativa.models import Tutor
from apps.investigacion_formativa.models import ValidacionAntiplagio


class ActividadFormativaSerializer(serializers.ModelSerializer):
    proceso_formativo_nombre = serializers.CharField(
        source='proceso_formativo.nombre_proceso',
        read_only=True
    )
    
    documento_soporte_nombre_documento = serializers.CharField(
        source='documento_soporte.nombre_documento',
        read_only=True
    )
    
    responsable_nombre = serializers.CharField(
        source='responsable.nombre',
        read_only=True
    )
    
    class Meta:
        model = ActividadFormativa
        fields = '__all__'
    

class BancoIdeasSerializer(serializers.ModelSerializer):
    facultad_nombre = serializers.CharField(
        source='facultad.nombre_facultad',
        read_only=True
    )
    
    class Meta:
        model = BancoIdeas
        fields = '__all__'


class CertificacionExternaSerializer(serializers.ModelSerializer):
    proceso_nombre = serializers.CharField(
        source='proceso_formativo.nombre_proceso',
        read_only=True
    )
    
    certificado_asistencia_nombre_documento = serializers.CharField(
        source='certificado_asistencia.nombre_documento',
        read_only=True
    )
    
    certificado_aprobacion_nombre_documento = serializers.CharField(
        source='certificado_asistencia.nombre_documento',
        read_only=True
    )
    
    validado_por_username = serializers.CharField(
        source='validado_por.username',
        read_only=True
    )
    
    class Meta:
        model = CertificacionExterna
        fields = '__all__'


class EstudianteSerializer(serializers.ModelSerializer):
    persona_documento = serializers.CharField(
        source='persona.documento',
        read_only=True
    )
    
    modalidad_facultad_nombre = serializers.CharField(
        source='modalidad_facultad.modalidad.nombre_modalidad',
        read_only=True
    )
    
    class Meta:
        model = Estudiante
        fields = '__all__'


class EtapaFlujoSerializer(serializers.ModelSerializer):
    flujo_nombre = serializers.CharField(
        source='flujo.nombre_flujo',
        read_only=True
    )
    
    documento_requerido_nombre_documento = serializers.CharField(
        source='documento_requerido.nombre_documento',
        read_only=True
    )
    
    class Meta:
        model = EtapaFlujo
        fields = '__all__'


class EvaluacionProcesoSerializer(serializers.ModelSerializer):
    evaluador_rol_en_modalidad = serializers.CharField(
        source='evaluador.rol_en_modalidad',
        read_only=True
    )
    
    instancia_etapa_etapa = serializers.CharField(
        source='instancia_etapa.etapa.nombre',
        read_only=True
    )
    
    class Meta:
        model = EvaluacionProceso
        fields = '__all__'


class EventoEvaluativoSerializer(serializers.ModelSerializer):
    proceso_formativo_nombre = serializers.CharField(
        source='proceso_formativo.nombre_proceso',
        read_only=True
    )
    
    acta_sustentacion_nombre_documento = serializers.CharField(
        source='acta_sustentacion.nombre_documento',
        read_only=True
    )
    
    class Meta:
        model = EventoEvaluativo
        fields = '__all__'


class FlujoProcesoSerializer(serializers.ModelSerializer):
    modalidad_nombre = serializers.CharField(
        source='modalidad.nombre_modalidad',
        read_only=True
    )
    
    class Meta:
        model = FlujoProceso
        fields = '__all__'


class HomologacionSerializer(serializers.ModelSerializer):
    proceso_nombre = serializers.CharField(
        source='proceso_formativo.nombre_proceso',
        read_only=True
    )
    
    acta_homologacion_nombre_documento = serializers.CharField(
        source='acta_homologacion.nombre_documento',
        read_only=True
    )
    
    aprobado_por_username = serializers.CharField(
        source='aprobado_por.username',
        read_only=True
    )
    
    class Meta:
        model = Homologacion
        fields = '__all__'


class InstanciaEtapaSerializer(serializers.ModelSerializer):
    proceso_nombre = serializers.CharField(
        source='proceso_formativo.nombre_proceso',
        read_only=True
    )
    
    etapa_nombre = serializers.CharField(
        source='etapa.nombre',
        read_only=True
    )
    
    class Meta:
        model = InstanciaEtapa
        fields = '__all__'
        
        
class ModalidadXFacultadSerializer(serializers.ModelSerializer):
    modalidad_nombre = serializers.CharField(
        source='modalidad.nombre_modalidad',
        read_only=True
    )
    facultad_nombre = serializers.CharField(
        source='facultad.nombre_facultad',
        read_only=True
    )

    class Meta:
        model = ModalidadXFacultad
        fields = '__all__'



class ParticipanteProcesoSerializer(serializers.ModelSerializer):
    proceso_formativo_nombre = serializers.CharField(
        source='proceso_formativo.nombre_proceso',
        read_only=True
    )
    
    persona_docmento = serializers.CharField(
        source='persona.documento',
        read_only=True
    )
    
    class Meta:
        model = ParticipanteProceso
        fields = '__all__'


class PlanTrabajoSerializer(serializers.ModelSerializer):
    proceso_nombre = serializers.CharField(
        source='proceso_formativo.nombre_proceso',
        read_only=True
    )
    
    aprobado_por_username = serializers.CharField(
        source='aprobado_por.username',
        read_only=True
    )
    
    class Meta:
        model = PlanTrabajo
        fields = '__all__'
        

class PostulacionProcesoSerializer(serializers.ModelSerializer):
    estudiante_persona_documento = serializers.CharField(
        source='estudiante.persona.documento',
        read_only=True
    )
    
    modalidad_nombre = serializers.CharField(
        source='modalidadxfacultad.modalidad.nombre_modalidad',
        read_only=True
    )    
    
    proceso_creado_nombre = serializers.CharField(
        source='proceso_formativo.nombre_proceso',
        read_only=True
    )
    
    class Meta:
        model = PostulacionProceso
        fields = '__all__'


class ProcesoFormativoXProyectoSerializer(serializers.ModelSerializer):
    proceso_formativo_nombre = serializers.CharField(
        source='proceso_formativo.nombre_proceso',
        read_only=True
    )
    proyecto_titulo = serializers.CharField(
        source='proyecto.titulo',
        read_only=True
    )

    class Meta:
        model = ProcesoFormativoXProyecto
        fields = '__all__'


class ProcesoFormativoSerializer(serializers.ModelSerializer):
    idea_titulo = serializers.CharField(
        source='idea.titulo',
        read_only=True
    )
    
    flujo_version_nombre = serializers.CharField(
        source='flujo_version.nombre',
        read_only=True
    )
    
    entidad_externa_nombre = serializers.CharField(
        source='entidad_externa.nombre',
        read_only=True
    )
    
    class Meta:
        model = ProcesoFormativo
        fields = '__all__'


class RegistroActividadesSerializer(serializers.ModelSerializer):
    proceso_nombre = serializers.CharField(
        source='proceso_formativo.nombre_proceso',
        read_only=True
    )
    
    registrado_por_username = serializers.CharField(
        source='registrado_por.username',
        read_only=True
    )
    
    documento_nombre_documento = serializers.CharField(
        source='documento.nombre_documento',
        read_only=True
    )
    
    class Meta:
        model = RegistroActividades
        fields = '__all__'


class RegistroHorasSerializer(serializers.ModelSerializer):
    proceso_nombre = serializers.CharField(
        source='proceso_formativo.nombre_proceso',
        read_only=True
    )
    
    class Meta:
        model = RegistroHoras
        fields = '__all__'


class ReglaFlujoSerializer(serializers.ModelSerializer):
    etapa_origen_nombre = serializers.CharField(
        source='etapa_origen.nombre',
        read_only=True
    )
    
    etapa_destino_nombre = serializers.CharField(
        source='etapa_destino.nombre',
        read_only=True
    )
    
    class Meta:
        model = ReglaFlujo
        fields = '__all__'


class RequisitoModalidadSerializer(serializers.ModelSerializer):
    modalidad_nombre = serializers.CharField(
        source='modalidad.nombre_modalidad',
        read_only=True
    )
    
    class Meta:
        model = RequisitoModalidad
        fields = '__all__'
        

class RevisionSerializer(serializers.ModelSerializer):
    instancia_etapa_etapa = serializers.CharField(
        source='instancia_etapa.etapa.nombre',
        read_only=True
    )
    
    class Meta:
        model = Revision
        fields = '__all__'


class SegundaInstanciaSerializer(serializers.ModelSerializer):
    proceso_nombre = serializers.CharField(
        source='proceso_formativo.nombre_proceso',
        read_only=True
    )
    
    instancia_etapa_etapa = serializers.CharField(
        source='instancia_etapa.etapa.nombre',
        read_only=True
    )
    
    evaluacion_nombre = serializers.CharField(
        source='evaluacion.nombre',
        read_only=True
    )
    
    etapa_retorno_nombre = serializers.CharField(
        source='etapa_retorno.nombre',
        read_only=True
    )
    
    class Meta:
        model = SegundaInstancia
        fields = '__all__'


class TransicionFlujoSerializer(serializers.ModelSerializer):
    etapa_origen_nombre = serializers.CharField(
        source='etapa_origen.nombre',
        read_only=True
    )
    
    etapa_destino_nombre = serializers.CharField(
        source='etapa_destino.nombre',
        read_only=True
    )
    
    class Meta:
        model = TransicionFlujo
        fields = '__all__'


class TutorSerializer(serializers.ModelSerializer):
    persona_documento = serializers.CharField(
        source='persona.documento',
        read_only=True
    )
    
    facultad_nombre = serializers.CharField(
        source='facultad.nombre_facultad',
        read_only=True
    )
    
    class Meta:
        model = Tutor
        fields = '__all__'


class ValidacionAntiplagioSerializer(serializers.ModelSerializer):
    instancia_etapa_etapa = serializers.CharField(
        source='instancia_etapa.etapa.nombre',
        read_only=True
    )
    
    documento_nombre_doumento = serializers.CharField(
        source='documento.nombre_documento',
        read_only=True
    )
    
    class Meta:
        model = ValidacionAntiplagio
        fields = '__all__'