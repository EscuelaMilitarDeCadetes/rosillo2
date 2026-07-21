from django.test import TestCase
from rest_framework.test import APIClient
from apps.usuarios.models import Usuario, UsuarioXPersona
from apps.institucional.models import Persona

class BaseUsuarioTestCase(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.usuario = Usuario.objects.create_user(username='testuser', password='testpass')
        self.persona = Persona.objects.create(nombre='Persona prueba', apellido='Apellido')
        self.persona_id = self.persona.id
        self.asignacion = UsuarioXPersona.objects.create(usuario=self.usuario, persona_id=self.persona_id, estado=True)
        self.client.force_authenticate(user=self.usuario)