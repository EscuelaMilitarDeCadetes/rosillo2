from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

from apps.usuarios.models import (
    Usuario,
    RolPlataforma,
    RolXUsuario,
)


class PermissionTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        # ---------- Roles ----------
        self.rol_soporte = RolPlataforma.objects.create(
            nombre_rol="SOPORTE",
            descripcion="Administrador"
        )
        self.rol_supervisor = RolPlataforma.objects.create(
            nombre_rol="SUPERVISOR",
            descripcion="Auditor y personal administrativo"
        )
        self.rol_asesor = RolPlataforma.objects.create(
            nombre_rol="ASESOR",
            descripcion="Asesor de investigación"
        )
        self.rol_facultad = RolPlataforma.objects.create(
            nombre_rol="FACULTAD",
            descripcion="Coordinador de investigación"
        )
        self.rol_grupo = RolPlataforma.objects.create(
            nombre_rol="GRUPO",
            descripcion="Lider de grupo de investigacion"
        )
        self.rol_cinterno = RolPlataforma.objects.create(
            nombre_rol="CINTERNO",
            descripcion="Asesor de convocatorias internas"
        )
        self.rol_cexterno = RolPlataforma.objects.create(
            nombre_rol="CEXTERNO",
            descripcion="Asesor de convocatorias externas"
        )
        self.rol_decano = RolPlataforma.objects.create(
            nombre_rol="DECANO",
            descripcion="CEO de facultad"
        )
        # ---------- Usuario SOPORTE ----------
        self.soporte = Usuario.objects.create_user(
            username="soporte@esmic.edu.co",
            email="soporte@esmic.edu.co",
            password="Password123*",
        )
        RolXUsuario.objects.create(
            usuario=self.soporte,
            rol=self.rol_soporte,
            estado=True
        )
        # ---------- Usuario SUPERVISOR ----------
        self.supervisor = Usuario.objects.create_user(
            username="supervisor@esmic.edu.co",
            email="supervisor@esmic.edu.co",
            password="Password123*",
        )
        RolXUsuario.objects.create(
            usuario=self.supervisor,
            rol=self.rol_supervisor,
            estado=True
        )
        # ---------- Usuario ASESOR ----------
        self.asesor = Usuario.objects.create_user(
            username="asesor@esmic.edu.co",
            email="asesor@esmic.edu.co",
            password="Password123*",
        )
        RolXUsuario.objects.create(
            usuario=self.asesor,
            rol=self.rol_asesor,
            estado=True
        )
        # ---------- Usuario FACULTAD ----------
        self.facultad = Usuario.objects.create_user(
            username="facultad@esmic.edu.co",
            email="facultad@esmic.edu.co",
            password="Password123*",
        )
        RolXUsuario.objects.create(
            usuario=self.facultad,
            rol=self.rol_facultad,
            estado=True
        )
        # ---------- Usuario GRUPO ----------
        self.grupo = Usuario.objects.create_user(
            username="grupo@esmic.edu.co",
            email="grupo@esmic.edu.co",
            password="Password123*",
        )
        RolXUsuario.objects.create(
            usuario=self.grupo,
            rol=self.rol_grupo,
            estado=True
        )
        # ---------- Usuario CINTERNO ----------
        self.cinterno = Usuario.objects.create_user(
            username="cinterno@esmic.edu.co",
            email="cinterno@esmic.edu.co",
            password="Password123*",
        )
        RolXUsuario.objects.create(
            usuario=self.cinterno,
            rol=self.rol_cinterno,
            estado=True
        )
        # ---------- Usuario CEXTERNO ----------
        self.cexterno = Usuario.objects.create_user(
            username="cexterno@esmic.edu.co",
            email="cexterno@esmic.edu.co",
            password="Password123*",
        )
        RolXUsuario.objects.create(
            usuario=self.cexterno,
            rol=self.rol_cexterno,
            estado=True
        )
        # ---------- Usuario DECANO ----------
        self.decano = Usuario.objects.create_user(
            username="decano@esmic.edu.co",
            email="decano@esmic.edu.co",
            password="Password123*",
        )
        RolXUsuario.objects.create(
            usuario=self.decano,
            rol=self.rol_decano,
            estado=True
        )
        # ---------- Usuario sin rol ----------
        self.sin_rol = Usuario.objects.create_user(
            username="sinrol@esmic.edu.co",
            email="sinrol@esmic.edu.co",
            password="Password123*",
        )
        self.url = reverse("usuario-list")
        
    def test_soporte_puede_acceder(self):
        login = self.client.post(
            reverse("login"),
            {
                "username": "soporte@esmic.edu.co",
                "password": "Password123*"
            }
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login.data['access']}"
        )
        response = self.client.get(self.url)
        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )
        
    def test_supervisor_puede_acceder(self):
        login = self.client.post(
            reverse("login"),
            {
                "username": "supervisor@esmic.edu.co",
                "password": "Password123*"
            }
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login.data['access']}"
        )
        response = self.client.get(self.url)
        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )
        
    def test_asesor_puede_acceder(self):
        login = self.client.post(
            reverse("login"),
            {
                "username": "asesor@esmic.edu.co",
                "password": "Password123*"
            }
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login.data['access']}"
        )
        response = self.client.get(self.url)
        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )
        
    def test_facultad_puede_acceder(self):
        login = self.client.post(
            reverse("login"),
            {
                "username": "facultad@esmic.edu.co",
                "password": "Password123*"
            }
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login.data['access']}"
        )
        response = self.client.get(self.url)
        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )
        
    def test_grupo_puede_acceder(self):
        login = self.client.post(
            reverse("login"),
            {
                "username": "grupo@esmic.edu.co",
                "password": "Password123*"
            }
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login.data['access']}"
        )
        response = self.client.get(self.url)
        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )
        
    def test_cinterno_puede_acceder(self):
        login = self.client.post(
            reverse("login"),
            {
                "username": "cinterno@esmic.edu.co",
                "password": "Password123*"
            }
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login.data['access']}"
        )
        response = self.client.get(self.url)
        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )
        
    def test_cexterno_puede_acceder(self):
        login = self.client.post(
            reverse("login"),
            {
                "username": "cexterno@esmic.edu.co",
                "password": "Password123*"
            }
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login.data['access']}"
        )
        response = self.client.get(self.url)
        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )
        
    def test_decano_puede_acceder(self):
        login = self.client.post(
            reverse("login"),
            {
                "username": "decano@esmic.edu.co",
                "password": "Password123*"
            }
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login.data['access']}"
        )
        response = self.client.get(self.url)
        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )
            
    def test_estudiante_no_puede_acceder(self):
        login = self.client.post(
            reverse("login"),
            {
                "username": "estudiante@esmic.edu.co",
                "password": "Password123*"
            }
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login.data['access']}"
        )
        response = self.client.get(self.url)
        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )
            
    def test_gerente_no_puede_acceder(self):
        login = self.client.post(
            reverse("login"),
            {
                "username": "gerente@esmic.edu.co",
                "password": "Password123*"
            }
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login.data['access']}"
        )
        response = self.client.get(self.url)
        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )
            
    def test_jurado_no_puede_acceder(self):
        login = self.client.post(
            reverse("login"),
            {
                "username": "jurado@esmic.edu.co",
                "password": "Password123*"
            }
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login.data['access']}"
        )
        response = self.client.get(self.url)
        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )
            
    def test_tutor_no_puede_acceder(self):
        login = self.client.post(
            reverse("login"),
            {
                "username": "tutor@esmic.edu.co",
                "password": "Password123*"
            }
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login.data['access']}"
        )
        response = self.client.get(self.url)
        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )
        
    def test_usuario_sin_rol_no_puede_acceder(self):
        login = self.client.post(
            reverse("login"),
            {
                "username": "sinrol@esmic.edu.co",
                "password": "Password123*"
            }
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login.data['access']}"
        )
        response = self.client.get(self.url)
        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )
        
    def test_usuario_anonimo_no_puede_acceder(self):
        response = self.client.get(self.url)
        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )