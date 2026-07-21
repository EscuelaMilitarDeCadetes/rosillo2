from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.usuarios.models import Usuario, RolPlataforma, RolXUsuario


class RolXUsuarioTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.rol_soporte = RolPlataforma.objects.create(
            nombre_rol='SOPORTE',
            descripcion='Gestiona usuarios'
        )
        self.rol_supervisor = RolPlataforma.objects.create(
            nombre_rol='SUPERVISOR',
            descripcion='Solo lectura'
        )
        self.admin = Usuario.objects.create_user(
            username='admin@esmic.edu.co',
            email='admin@esmic.edu.co',
            password='Admin123*',
            is_active=True
        )
        RolXUsuario.objects.create(
            usuario=self.admin,
            rol=self.rol_soporte,
            estado=True
        )
        self.target_user = Usuario.objects.create_user(
            username='target@esmic.edu.co',
            email='target@esmic.edu.co',
            password='Target123*',
            is_active=True
        )
        login = self.client.post(reverse('login'), {
            'username': 'admin@esmic.edu.co',
            'password': 'Admin123*'
        })
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login.data['access']}"
        )

    def test_delete_no_permitido_sobre_rol_plataforma(self):
        """
        RolPlataformaViewSet es un catálogo (viewsets.ViewSet puro):
        no define destroy(), por lo tanto DELETE debe responder 405.
        Los catálogos son permanentes, sin endpoint de borrado (11_backend_logic.md).
        """
        response = self.client.delete(f'/api/usuarios/roles/{self.rol_soporte.id}/')
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_agregar_rol(self):
        response = self.client.post(
            '/api/usuarios/roles-usuario/agregar-rol/',
            {
                'usuario_id': self.target_user.id,
                'rol_id': self.rol_supervisor.id
            }
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            RolXUsuario.objects.filter(
                usuario=self.target_user,
                rol=self.rol_supervisor,
                estado=True
            ).exists()
        )

    def test_borrar_rol(self):
        RolXUsuario.objects.create(
            usuario=self.target_user,
            rol=self.rol_supervisor,
            estado=True
        )
        response = self.client.post(
            '/api/usuarios/roles-usuario/borrar-rol/',
            {
                'usuario_id': self.target_user.id,
                'rol_id': self.rol_supervisor.id
            }
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(
            RolXUsuario.objects.filter(
                usuario=self.target_user,
                rol=self.rol_supervisor,
                estado=True
            ).exists()
        )

    def test_usuario_sin_rol_no_puede_acceder(self):
        usuario_sin_rol = Usuario.objects.create_user(
            username='sinrol@esmic.edu.co',
            email='sinrol@esmic.edu.co',
            password='Sinrol123*',
            is_active=True
        )
        login = self.client.post(reverse('login'), {
            'username': 'sinrol@esmic.edu.co',
            'password': 'Sinrol123*'
        })
        client_sin_rol = APIClient()
        client_sin_rol.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login.data['access']}"
        )
        response = client_sin_rol.get('/api/usuarios/usuarios')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
    def test_put_no_permitido_sobre_rol_x_usuario(self):
        rxu = RolXUsuario.objects.create(usuario=self.target_user, rol=self.rol_supervisor, estado=True)
        response = self.client.put(f'/api/usuarios/roles-usuario/{rxu.id}/', {})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_put_no_permitido_sobre_rol_plataforma(self):
        response = self.client.put(
            f'/api/usuarios/roles/{self.rol_soporte.id}/',
            {'nombre_rol': 'MODIFICADO'},
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        
    def test_historico_incluye_roles_inactivos(self):
        rxu = RolXUsuario.objects.create(usuario=self.target_user, rol=self.rol_supervisor, estado=True)
        rxu.estado = False
        rxu.save(update_fields=['estado'])
        response = self.client.get(f'/api/usuarios/roles-usuario/historico/{self.target_user.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(not r['estado'] for r in response.data))