docker exec -it docker-backend-1 sh -c "cat > /entrypoint.sh << 'EOF'
#!/bin/sh
python AndryxaGym_backend/manage.py migrate
python AndryxaGym_backend/manage.py createsuperuser --noinput || true
python AndryxaGym_backend/manage.py runserver 0.0.0.0:8000
EOF"
docker exec -it docker-backend-1 chmod +x /entrypoint.sh
docker restart docker-backend-1