from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import UserProfile
from .serializers import UserProfileSerializer


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, user):
        profile, created = UserProfile.objects.get_or_create(user=user)
        return profile

    # GET /profile/
    def get(self, request):
        profile = self.get_object(request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    # PATCH /profile/
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

    # GET /settings/
    def get(self, request):
        profile = self.get_object(request.user)
        return Response({
            "language": profile.language,
            "theme": profile.theme
        })

    # PATCH /settings/
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