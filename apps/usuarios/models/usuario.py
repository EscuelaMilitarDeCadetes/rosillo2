from django.contrib.auth.models import AbstractUser
from django.db import models

class Usuario(AbstractUser):
    """
    Modelo de Usuario personalizado integrado con el sistema de auth de Django.
    Hereda 'is_active' de AbstractUser, por lo que el campo 'estado' se elimina.
    """
    token_recuperacion = models.CharField(max_length=100, blank=True, null=True)
    token_creado_en = models.DateTimeField(blank=True, null=True)
    email = models.EmailField(unique=True)
    # Nuevo campo: fuerza el cambio de contraseña en el próximo login.
    # Se activa al crear credenciales iniciales (contraseña temporal).
    debe_cambiar_password = models.BooleanField(default=False)

    def __str__(self):
        return self.username

    class Meta:
        db_table = 'auth_user'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'