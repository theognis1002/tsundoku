.PHONY: all build run test clean stop migrate migrations db

# Create DB container
run:
	@echo "Starting services..."
	docker compose up

# Shutdown DB containers
stop:
	@echo "Stopping services..."
	docker compose down

# Run DB container
db:
	@echo "Running DB container..."
	@docker compose up -d postgres
	@make migrate

# Run database migrations
migrate:
	@echo "Running database migrations..."
	@docker compose exec app alembic upgrade head

# Create new database migration
migrations:
	@echo "Creating new migration..."
	@docker compose exec app alembic init migrations
	@docker compose exec app alembic revision --autogenerate

# Build the backend
backend-build:
	@echo "Building backend..."
	docker compose build

# Build the application
build: backend-build migrate
	@echo "Build completed."


# Destroy the application
destroy:
	@echo "Destroying..."
	@docker compose down -v --rmi all
	@docker system prune -af --volumes
	@echo "Destroyed"

# Rebuild the application
rebuild: destroy build
	@echo "Rebuilding the application..."
r: rebuild


shell:
	@echo "Starting IPython shell..."
	@docker compose exec app python backend/shell.py
