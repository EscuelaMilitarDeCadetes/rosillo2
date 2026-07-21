from rest_framework.routers import DefaultRouter


from apps.investigacion_formativa.views import *


router = DefaultRouter()


router.register(r'actividad-formativa', ActividadFormativaViewSet)
router.register(r'banco-ideas', BancoIdeasViewSet)
router.register(r'certificacion-externa', CertificacionExternaViewSet)
router.register(r'estudiante', EstudianteViewSet)
router.register(r'etapa-flujo', EtapaFlujoViewSet)
router.register(r'evaluacion-proceso', EvaluacionProcesoViewSet)
router.register(r'evento-evaluativo', EventoEvaluativoViewSet)
router.register(r'flujo-proceso', FlujoProcesoViewSet)
router.register(r'homologacion', HomologacionViewSet)
router.register(r'instancia-etapa', InstanciaEtapaViewSet)
router.register(r'modalidad-facultad', ModalidadXFacultadViewSet)
router.register(r'modalidad', ModalidadViewSet)
router.register(r'participante-proceso', ParticipanteProcesoViewSet)
router.register(r'plan-trabajo', PlanTrabajoViewSet)
router.register(r'postulacion-proceso', PostulacionProcesoViewSet)
router.register(r'proceso-formativo-proyecto', ProcesoFormativoXProyectoViewSet)
router.register(r'proceso-formativo', ProcesoFormativoViewSet)
router.register(r'registro-actividades', RegistroActividadesViewSet)
router.register(r'registro-horas', RegistroHorasViewSet)
router.register(r'regla-flujo', ReglaFlujoViewSet)
router.register(r'requisito-modalidad', RequisitoModalidadViewSet)
router.register(r'revision', RevisionViewSet)
router.register(r'segunda-instancia', SegundaInstanciaViewSet)
router.register(r'transicion-flujo', TransicionFlujoViewSet)
router.register(r'tutor', TutorViewSet)
router.register(r'validacion-antiplagio', ValidacionAntiplagioViewSet)


urlpatterns = router.urls