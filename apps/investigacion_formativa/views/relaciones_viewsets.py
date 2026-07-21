from rest_framework import viewsets

from apps.investigacion_formativa.models import ActividadFormativa
from apps.investigacion_formativa.serializers import ActividadFormativaSerializer

from apps.investigacion_formativa.models import BancoIdeas
from apps.investigacion_formativa.serializers import BancoIdeasSerializer

from apps.investigacion_formativa.models import CertificacionExterna
from apps.investigacion_formativa.serializers import CertificacionExternaSerializer

from apps.investigacion_formativa.models import Estudiante
from apps.investigacion_formativa.serializers import EstudianteSerializer

from apps.investigacion_formativa.models import EtapaFlujo
from apps.investigacion_formativa.serializers import EtapaFlujoSerializer

from apps.investigacion_formativa.models import EvaluacionProceso
from apps.investigacion_formativa.serializers import EvaluacionProcesoSerializer

from apps.investigacion_formativa.models import EventoEvaluativo
from apps.investigacion_formativa.serializers import EventoEvaluativoSerializer

from apps.investigacion_formativa.models import FlujoProceso
from apps.investigacion_formativa.serializers import FlujoProcesoSerializer

from apps.investigacion_formativa.models import Homologacion
from apps.investigacion_formativa.serializers import HomologacionSerializer

from apps.investigacion_formativa.models import InstanciaEtapa
from apps.investigacion_formativa.serializers import InstanciaEtapaSerializer

from apps.investigacion_formativa.models import ModalidadXFacultad
from apps.investigacion_formativa.serializers import ModalidadXFacultadSerializer

from apps.investigacion_formativa.models import ParticipanteProceso
from apps.investigacion_formativa.serializers import ParticipanteProcesoSerializer

from apps.investigacion_formativa.models import PlanTrabajo
from apps.investigacion_formativa.serializers import PlanTrabajoSerializer

from apps.investigacion_formativa.models import PostulacionProceso
from apps.investigacion_formativa.serializers import PostulacionProcesoSerializer

from apps.investigacion_formativa.models import ProcesoFormativoXProyecto
from apps.investigacion_formativa.serializers import ProcesoFormativoXProyectoSerializer

from apps.investigacion_formativa.models import ProcesoFormativo
from apps.investigacion_formativa.serializers import ProcesoFormativoSerializer

from apps.investigacion_formativa.models import RegistroActividades
from apps.investigacion_formativa.serializers import RegistroActividadesSerializer

from apps.investigacion_formativa.models import RegistroHoras
from apps.investigacion_formativa.serializers import RegistroHorasSerializer

from apps.investigacion_formativa.models import ReglaFlujo
from apps.investigacion_formativa.serializers import ReglaFlujoSerializer

from apps.investigacion_formativa.models import RequisitoModalidad
from apps.investigacion_formativa.serializers import RequisitoModalidadSerializer

from apps.investigacion_formativa.models import Revision
from apps.investigacion_formativa.serializers import RevisionSerializer

from apps.investigacion_formativa.models import SegundaInstancia
from apps.investigacion_formativa.serializers import SegundaInstanciaSerializer

from apps.investigacion_formativa.models import TransicionFlujo
from apps.investigacion_formativa.serializers import TransicionFlujoSerializer

from apps.investigacion_formativa.models import Tutor
from apps.investigacion_formativa.serializers import TutorSerializer

from apps.investigacion_formativa.models import ValidacionAntiplagio
from apps.investigacion_formativa.serializers import ValidacionAntiplagioSerializer


class ActividadFormativaViewSet(viewsets.ModelViewSet):
    queryset = ActividadFormativa.objects.select_related(
        'proceso_formativo',
        'documento_soporte',
        'responsable'
    )
    
    serializer_class = ActividadFormativaSerializer
    

class BancoIdeasViewSet(viewsets.ModelViewSet):
    queryset = BancoIdeas.objects.select_related(
        'facultad'
    )
    
    serializer_class = BancoIdeasSerializer


class CertificacionExternaViewSet(viewsets.ModelViewSet):
    queryset = CertificacionExterna.objects.select_related(
        'proceso',
        'certificado_asistencia',
        'certificado_aprobacion',
        'validado_por'
    )
    
    serializer_class = CertificacionExternaSerializer


class EstudianteViewSet(viewsets.ModelViewSet):
    queryset = Estudiante.objects.select_related(
        'persona',
        'modalidad_facultad'
    )
    
    serializer_class = EstudianteSerializer


class EtapaFlujoViewSet(viewsets.ModelViewSet):
    queryset = EtapaFlujo.objects.select_related(
        'flujo',
        'documento_requerido'
    )
    
    serializer_class = EtapaFlujoSerializer


class EvaluacionProcesoViewSet(viewsets.ModelViewSet):
    queryset = EvaluacionProceso.objects.select_related(
        'evaluador',
        'instancia_etapa'
    )
    
    serializer_class = EvaluacionProcesoSerializer


class EventoEvaluativoViewSet(viewsets.ModelViewSet):
    queryset = EventoEvaluativo.objects.select_related(
        'proceso_formativo',
        'acta_sustentacion'
    )
    
    serializer_class = EventoEvaluativoSerializer


class FlujoProcesoViewSet(viewsets.ModelViewSet):
    queryset = FlujoProceso.objects.select_related(
        'modalidad'
    )
    
    serializer_class = FlujoProcesoSerializer


class HomologacionViewSet(viewsets.ModelViewSet):
    queryset = Homologacion.objects.select_related(
        'proceso',
        'acta_homologacion',
        'aprobado_por'
    )
    
    serializer_class = HomologacionSerializer


class InstanciaEtapaViewSet(viewsets.ModelViewSet):
    queryset = InstanciaEtapa.objects.select_related(
        'proceso',
        'etapa'
    )
    
    serializer_class = InstanciaEtapaSerializer


class ModalidadXFacultadViewSet(viewsets.ModelViewSet):
    queryset = ModalidadXFacultad.objects.select_related(
        'facultad',
        'modalidad'
    )
    
    serializer_class = ModalidadXFacultadSerializer


class ParticipanteProcesoViewSet(viewsets.ModelViewSet):
    queryset = ParticipanteProceso.objects.select_related(
        'proceso_formativo',
        'persona'
    )
    
    serializer_class = ParticipanteProcesoSerializer


class PlanTrabajoViewSet(viewsets.ModelViewSet):
    queryset = PlanTrabajo.objects.select_related(
        'proceso',
        'aprobado_por'
    )
    
    serializer_class = PlanTrabajoSerializer


class PostulacionProcesoViewSet(viewsets.ModelViewSet):
    queryset = PostulacionProceso.objects.select_related(
        'estudiante',
        'modalidad',
        'proceso_creado'
    )
    
    serializer_class = PostulacionProcesoSerializer


class ProcesoFormativoXProyectoViewSet(viewsets.ModelViewSet):
    queryset = ProcesoFormativoXProyecto.objects.select_related(
        'proceso_formativo',
        'proyecto_formal'
    )
    
    serializer_class = ProcesoFormativoXProyectoSerializer


class ProcesoFormativoViewSet(viewsets.ModelViewSet):
    queryset = ProcesoFormativo.objects.select_related(
        'idea',
        'flujo_version',
        'entidad_externa'
    )
    
    serializer_class = ProcesoFormativoSerializer


class RegistroActividadesViewSet(viewsets.ModelViewSet):
    queryset = RegistroActividades.objects.select_related(
        'proceso',
        'registrado_por',
        'documento'
    )
    
    serializer_class = RegistroActividadesSerializer


class RegistroHorasViewSet(viewsets.ModelViewSet):
    queryset = RegistroHoras.objects.select_related(
        'proceso'
    )
    
    serializer_class = RegistroHorasSerializer


class ReglaFlujoViewSet(viewsets.ModelViewSet):
    queryset = ReglaFlujo.objects.select_related(
        'etapa_origen',
        'etapa_destino'
    )
    
    serializer_class = ReglaFlujoSerializer


class RequisitoModalidadViewSet(viewsets.ModelViewSet):
    queryset = RequisitoModalidad.objects.select_related(
        'modalidad',
    )
    
    serializer_class = RequisitoModalidadSerializer


class RevisionViewSet(viewsets.ModelViewSet):
    queryset = Revision.objects.select_related(
        'instancia_etapa'
    )
    
    serializer_class = RevisionSerializer


class SegundaInstanciaViewSet(viewsets.ModelViewSet):
    queryset = SegundaInstancia.objects.select_related(
        'proceso',
        'instancia_etapa',
        'evaluacion',
        'etapa_retorno'
    )
    
    serializer_class = SegundaInstanciaSerializer


class TransicionFlujoViewSet(viewsets.ModelViewSet):
    queryset = TransicionFlujo.objects.select_related(
        'etapa_origen',
        'etapa_destino'
    )
    
    serializer_class = TransicionFlujoSerializer


class TutorViewSet(viewsets.ModelViewSet):
    queryset = Tutor.objects.select_related(
        'persona',
        'facultad'
    )
    
    serializer_class = TutorSerializer


class ValidacionAntiplagioViewSet(viewsets.ModelViewSet):
    queryset = ValidacionAntiplagio.objects.select_related(
        'instancia_etapa',
        'documento'
    )
    
    serializer_class = ValidacionAntiplagioSerializer