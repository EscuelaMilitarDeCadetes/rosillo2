from apps.usuarios.serializers.login_serializer import LoginSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from apps.common.services.historial_service import HistorialService
from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny
from apps.usuarios.throttles import LoginRateThrottle


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [LoginRateThrottle]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        user = authenticate(request=request, username=username, password=password)
        if user is None:
            return Response(
                {"error": "Credenciales inválidas"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        refresh = RefreshToken.for_user(user)
        HistorialService.registrar(user, "Inicio de sesión exitoso.")
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            },
            # el frontend usa este flag para forzar la redirección
            # a change-password antes de permitir el resto de la navegación
            "debe_cambiar_password": user.debe_cambiar_password,
        })

class LogoutView(APIView):
    """
    Endpoint para cerrar sesión y anular el Refresh Token.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"error": "Se requiere el refresh token."},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()            
            HistorialService.registrar(request.user, "Cierre de sesión exitoso.")
            return Response({"message": "Sesión cerrada correctamente."}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"error": "Token inválido o ya expirado."}, status=status.HTTP_400_BAD_REQUEST)