from rest_framework import serializers
from apps.investigacion_formal.models import ProyectoXConvocatoria, Monto
from apps.institucional.models import PersonaXGrupo


class ProyectoXConvocatoriaSerializer(serializers.ModelSerializer):
    proyecto_titulo = serializers.CharField(
        source='proyecto.titulo',
        read_only=True
    )
    proyecto_codigo = serializers.CharField(
        source='proyecto.codigo',
        read_only=True
    )
    convocatoria_nombre = serializers.CharField(
        source='convocatoria.nombre_convocatoria',
        read_only=True
    )
    convocatoria_interno = serializers.BooleanField(
        source='convocatoria.interno',
        read_only=True
    )
    monto_aprobado = serializers.SerializerMethodField()
    responsable = serializers.SerializerMethodField()

    class Meta:
        model = ProyectoXConvocatoria
        fields = '__all__'

    def get_monto_aprobado(self, obj):
        """
        Réplica de proyecto.montoFk.aprobado en el fragmento Thymeleaf
        modalProyectosPorConvocatoria.html. Se devuelve None cuando no hay
        monto o aún no ha sido aprobado (0/None); el frontend lo renderiza
        como 'sin aprobar', igual que hacía el th:if=... == 0 del original.
        """
        monto = Monto.objects.filter(proyecto_id=obj.proyecto_id).first()
        if monto is None or not monto.aprobado:
            return None
        return monto.aprobado

    def get_responsable(self, obj):
        """
        Réplica de usuarioFk.personaFk.personaXGrupoList[0] del original:
        sigla del grupo o abreviatura de la facultad del investigador
        responsable del proyecto. Misma consulta que
        ExportacionService._facultad_grupo_label().
        """
        pxg = (
            PersonaXGrupo.objects
            .filter(
                persona__asignaciones__usuario_id=obj.proyecto.usuario_id,
                persona__asignaciones__estado=True,
                estado=True,
            )
            .select_related('facultad', 'grupo')
            .first()
        )
        if pxg is None:
            return None
        if pxg.facultad_id:
            return pxg.facultad.abreviatura
        if pxg.grupo_id:
            return pxg.grupo.sigla_grupo
        return None