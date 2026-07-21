from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.usuarios.models import Usuario, RolPlataforma, RolXUsuario
from django.core.cache import cache


class LoginLogoutTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.rol_soporte = RolPlataforma.objects.create(
            nombre_rol='SOPORTE',
            descripcion='Gestiona usuarios'
        )
        self.user = Usuario.objects.create_user(
            username='testuser@esmic.edu.co',
            email='testuser@esmic.edu.co',
            password='password123',
            is_active=True
        )
        RolXUsuario.objects.create(
            usuario=self.user,
            rol=self.rol_soporte,
            estado=True
        )

    def test_login_exitoso(self):
        response = self.client.post(reverse('login'), {
            'username': 'testuser@esmic.edu.co',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_credenciales_invalidas(self):
        response = self.client.post(reverse('login'), {
            'username': 'testuser@esmic.edu.co',
            'password': 'wrongpassword'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_usuario_inactivo(self):
        self.user.is_active = False
        self.user.save()
        response = self.client.post(reverse('login'), {
            'username': 'testuser@esmic.edu.co',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_exitoso(self):
        login = self.client.post(reverse('login'), {
            'username': 'testuser@esmic.edu.co',
            'password': 'password123'
        })
        refresh_token = login.data['refresh']
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login.data['access']}"
        )
        response = self.client.post(reverse('logout'), {
            'refresh': refresh_token
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_logout_sin_refresh_token(self):
        login = self.client.post(reverse('login'), {
            'username': 'testuser@esmic.edu.co',
            'password': 'password123'
        })
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login.data['access']}"
        )
        response = self.client.post(reverse('logout'), {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
    def test_login_usuario_inexistente(self):
        response = self.client.post(
            reverse("login"),
            {
                "username": "noexiste@esmic.edu.co",
                "password": "Password123*"
            }
        )
        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )
        
    def test_logout_refresh_invalido(self):
        login = self.client.post(
            reverse("login"),
            {
                "username": "testuser@esmic.edu.co",
                "password": "password123"
            }
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login.data['access']}"
        )
        response = self.client.post(
            reverse("logout"),
            {
                "refresh": "token_invalido"
            }
        )
        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        
    def test_login_rate_throttle(self):
        cache.clear()
        # Los primeros cinco intentos son válidos
        for _ in range(5):
            response = self.client.post(
                reverse("login"),
                {
                    "username": "testuser@esmic.edu.co",
                    "password": "password123",
                }
            )
            self.assertEqual(
                response.status_code,
                status.HTTP_200_OK
            )
        # El sexto debe ser bloqueado
        response = self.client.post(
            reverse("login"),
            {
                "username": "testuser@esmic.edu.co",
                "password": "password123",
            }
        )
        self.assertEqual(
            response.status_code,
            status.HTTP_429_TOO_MANY_REQUESTS
        )
        
    def test_login_reporta_debe_cambiar_password(self):
        self.user.debe_cambiar_password = True
        self.user.save(update_fields=['debe_cambiar_password'])
        response = self.client.post(reverse('login'), {
            'username': 'testuser@esmic.edu.co',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['debe_cambiar_password'])
