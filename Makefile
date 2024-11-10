# Makefile for Docker Compose operations

# Default target, builds and runs the Docker Compose setup
up:
	docker-compose up -d --build

# Stops the running containers without removing them
stop:
	docker-compose stop

# Stops and removes the containers, networks, volumes, and images created by `up`
down:
	docker-compose down

# Rebuilds the images without using the cache
build:
	docker-compose build --progress=plain --no-cache

# Shows the status of running services
status:
	docker-compose ps

# Shows the logs from the running services
logs:
	docker-compose logs -f

# Remove all unused containers, networks, and images
clean:
	docker system prune -f