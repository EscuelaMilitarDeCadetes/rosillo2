from django.db import models

class TipoDocumento(models.Model):
    nombre_documento = models.CharField(max_length=40, unique=True)
    grupo = models.CharField(max_length=30)

    def __str__(self):
        return self.nombre_documento