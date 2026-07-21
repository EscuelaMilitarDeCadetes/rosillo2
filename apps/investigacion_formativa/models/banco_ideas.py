from django.db import models

class BancoIdeas(models.Model):
    ESTADO_CHOICES = [
        ('DISPONIBLE', 'Disponible'),
        ('SEPARADA', 'Separada'),
        ('TOMADA', 'Tomada'),
    ]
    
    facultad = models.ForeignKey('institucional.FacultadEscuela', on_delete=models.CASCADE)
    idea = models.CharField(max_length=255)
    descripcion = models.CharField(max_length=255)
    linea_investigacion = models.CharField(max_length=255)
    palabras_clave = models.CharField(max_length=255)
    estado = models.CharField(max_length=10, choices=ESTADO_CHOICES, default='DISPONIBLE')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)    
    
    class Meta:
        unique_together = ('facultad', 'idea')
        verbose_name = "Banco de Ideas"
        verbose_name_plural = "Banco de Ideas"

    def __str__(self):
        return self.idea