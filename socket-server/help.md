To run this system
docker-compose up -d
docker-compose logs -f

to stop
docker-compose down


--------or----------
docker build -t websocket-server .
docker run -d \
  --name websocket-server \
  -p 8080:8080 \
  -e REDIS_URL="rediss://default:your_password@your-redis-host:6379" \
  -e WS_PORT=8080 \
  -e NODE_ENV=production \
  --cpus=0.5 \
  --memory=512m \
  websocket-server