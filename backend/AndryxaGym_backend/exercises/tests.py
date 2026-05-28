<<<<<<< HEAD
import pytest

from django.contrib.auth import get_user_model

from rest_framework.test import APIClient
from rest_framework import status

from exercises.models import MuscleGroup, Exercise


User = get_user_model()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        username='testuser',
        password='testpass123'
    )


@pytest.fixture
def admin_user(db):
    return User.objects.create_superuser(
        username='admin',
        password='admin123'
    )


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def muscle_group(db):
    return MuscleGroup.objects.create(name='Грудь')


@pytest.fixture
def exercise(db, muscle_group):
    return Exercise.objects.create(
        name='Жим лёжа',
        description='Базовое упражнение на грудь',
        muscle_group=muscle_group
    )


@pytest.mark.django_db
class TestMuscleGroup:

    def test_muscle_group_created(self, muscle_group):
        assert muscle_group.name == 'Грудь'

    def test_muscle_group_str(self, muscle_group):
        assert str(muscle_group) == 'Грудь'


@pytest.mark.django_db
class TestExercise:

    def test_exercise_created(self, exercise):
        assert exercise.name == 'Жим лёжа'

    def test_exercise_str(self, exercise):
        assert str(exercise) == 'Жим лёжа (Грудь)'

    def test_exercise_has_muscle_group(self, exercise, muscle_group):
        assert exercise.muscle_group == muscle_group


@pytest.mark.django_db
class TestExerciseAPI:

    def test_get_exercises_unauthorized(self, api_client):
        response = api_client.get('/api/v1/exercises/')

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_get_exercises_authorized(
        self,
        api_client,
        user,
        exercise
    ):
        api_client.force_authenticate(user=user)

        response = api_client.get('/api/v1/exercises/')

        assert response.status_code == status.HTTP_200_OK

    def test_admin_can_create_exercise(
        self,
        api_client,
        admin_user,
        muscle_group
    ):
        api_client.force_authenticate(user=admin_user)

        data = {
            'name': 'Присед',
            'description': 'Упражнение на ноги',
            'muscle_group': muscle_group.id
        }

        response = api_client.post('/api/v1/exercises/', data)

        assert response.status_code == status.HTTP_201_CREATED

    def test_regular_user_cannot_create_exercise(
        self,
        api_client,
        user,
        muscle_group
    ):
        api_client.force_authenticate(user=user)

        data = {
            'name': 'Становая тяга',
            'description': 'Упражнение на спину',
            'muscle_group': muscle_group.id
        }

        response = api_client.post('/api/v1/exercises/', data)

        assert response.status_code == status.HTTP_403_FORBIDDEN
=======
from django.test import TestCase

# Create your tests here.
>>>>>>> origin/main
