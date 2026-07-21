from django.db import models

class ProductoXProyecto(models.Model):
    producto_x_grupo = models.ForeignKey("investigacion_formal.ProductoXGrupo", on_delete=models.CASCADE)
    proyecto = models.ForeignKey("investigacion_formal.Proyecto", on_delete=models.CASCADE)
    tipo_documento = models.ForeignKey('common.TipoDocumento', on_delete=models.CASCADE, null=True, blank=True)
    activo = models.BooleanField()
    entregado = models.BooleanField()    
    documento = models.CharField(max_length=255, null=True, blank=True)
    categoria = models.CharField(max_length=30)
    puntaje = models.IntegerField()
    gruplac = models.BooleanField(default=False)

    class Meta:
        unique_together = ('producto_x_grupo', 'proyecto', 'tipo_documento')
    
    def __str__(self):
        return f"{self.producto_x_grupo} - {self.proyecto} - {self.tipo_documento}"