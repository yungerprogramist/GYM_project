from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Note
from .serializers import NoteSerializer


class NoteViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        # если нет создаёт, если есть - возвращает, замена read
        note, created = Note.objects.get_or_create(user=request.user)
        serializer = NoteSerializer(note)
        return Response(serializer.data)

    def update(self, request):
        note, created = Note.objects.get_or_create(user=request.user)
        serializer = NoteSerializer(note, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
        
    def destroy(self, request):
        note = Note.objects.get_or_create(user=request.user)[0]
        note.delete()
        return Response(status=204)