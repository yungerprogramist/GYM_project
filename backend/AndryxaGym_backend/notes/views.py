from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Note
from .serializers import NoteSerializer


class NoteView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        note, created = Note.objects.get_or_create(user=request.user)
        serializer = NoteSerializer(note)
        return Response(serializer.data)

    def put(self, request):
        note, created = Note.objects.get_or_create(user=request.user)
        serializer = NoteSerializer(note, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request):
        note = Note.objects.filter(user=request.user).first()
        if note:
            note.delete()
        return Response(status=204)