from django.db import models

class PostulacionProceso(models.Model):
    ESTADO_CHOICES = [
        ("BORRADOR", "Borrador"),
        ("ENVIADA", "Enviada"),
        ("EN_VALIDACION", "En validación de requisitos"),
        ("APROBADA", "Aprobada"),
        ("RECHAZADA", "Rechazada"),
    ]
    estudiante = models.ForeignKey("investigacion_formativa.Estudiante", on_delete=models.CASCADE, related_name="postulaciones")
    modalidad = models.ForeignKey("investigacion_formativa.ModalidadXFacultad", on_delete=models.CASCADE)
    proceso_creado = models.ForeignKey("investigacion_formativa.ProcesoFormativo", on_delete=models.SET_NULL, null=True, blank=True, related_name="postulacion_origen", help_text="Proceso de grado generado al aprobar esta postulación")
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default="BORRADOR")
    promedio_actual = models.FloatField(help_text="Promedio académico acumulado al momento de la postulación")
    fecha_postulacion = models.DateTimeField(auto_now_add=True)
    fecha_decision = models.DateTimeField(null=True, blank=True)
    observacion_coordinacion = models.TextField(null=True, blank=True, help_text="Motivo de rechazo o comentarios del coordinador")    
    
    class Meta:
        verbose_name = "Postulación a Proceso de Grado"
        verbose_name_plural = "Postulaciones a Proceso de Grado"
        unique_together = ('estudiante', 'modalidad')
        
    def __str__(self):
        return f"{self.estudiante} → {self.modalidad.modalidad.nombre} [{self.get_estado_display()}]"