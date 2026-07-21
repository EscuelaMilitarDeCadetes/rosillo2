from django.db import models

class ProcesoFormativoXProyecto(models.Model):
    proceso_formativo = models.ForeignKey("investigacion_formativa.ProcesoFormativo", on_delete=models.CASCADE, related_name="proyectos_vinculados")
    proyecto_formal = models.ForeignKey("investigacion_formal.Proyecto", on_delete=models.CASCADE, related_name="tesis_vinculadas")    

    class Meta:
        unique_together = ('proceso_formativo', 'proyecto_formal')
        verbose_name = "Vínculo Proceso-Proyecto Formal"
        verbose_name_plural = "Vínculos Proceso-Proyectos Formales"

    def __str__(self):
        return f"'{self.proceso_formativo.titulo}' vinculado a '{self.proyecto_formal.titulo}'"