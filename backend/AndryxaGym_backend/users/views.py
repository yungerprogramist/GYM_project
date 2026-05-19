from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from .models import UserProfile
from .serializers import (
    UserRegisterSerializer, 
    UserLoginSerializer, 
    UserProfileSerializer,
    UserSerializer
)

User = get_user_model()


# auth

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            UserProfile.objects.create(user=user) 

            refresh = RefreshToken.for_user(user)

            return Response({
                "message": "Регистрация прошла успешно!",
                "user": UserSerializer(user).data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = authenticate(
                username=serializer.validated_data['username'],
                password=serializer.validated_data['password']
            )

            if user:
                refresh = RefreshToken.for_user(user)
                return Response({
                    "message": "Успешный вход",
                    "user": UserSerializer(user).data,
                    "tokens": {
                        "refresh": str(refresh),
                        "access": str(refresh.access_token),
                    }
                })

        return Response({"error": "Неверный логин или пароль"}, 
                       status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            
            if not refresh_token:
                return Response({"error": "Refresh токен не передан"}, 
                              status=status.HTTP_400_BAD_REQUEST)

            token = RefreshToken(refresh_token)
            token.blacklist() 
            
            return Response({"message": "Вы успешно вышли из аккаунта"}, 
                          status=status.HTTP_205_RESET_CONTENT)
            
        except Exception as e:
            return Response({"error": "Неверный или истёкший refresh токен"}, 
                          status=status.HTTP_400_BAD_REQUEST)


# profile

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, user):
        profile, created = UserProfile.objects.get_or_create(user=user)
        return profile

    def get(self, request):
        profile = self.get_object(request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        profile = self.get_object(request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class UserSettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, user):
        profile, created = UserProfile.objects.get_or_create(user=user)
        return profile

    def get(self, request):
        profile = self.get_object(request.user)
        return Response({
            "language": profile.language,
            "theme": profile.theme
        })

    def patch(self, request):
        profile = self.get_object(request.user)

        if "language" in request.data:
            profile.language = request.data["language"]
        if "theme" in request.data:
            profile.theme = request.data["theme"]

        profile.save()
        return Response({
            "language": profile.language,
            "theme": profile.theme
        })