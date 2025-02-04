.PHONY: all build run test clean watch docker-run docker-down itest migrate db

# Build the application
all: build test

build:
	@echo "Building..."
	@go build -o main cmd/api/main.go
	@echo "Build successful"

# Run the application
run:
	@make db
	@go run cmd/api/main.go &
	@npm install --prefer-offline --no-fund --prefix ./frontend
	@npm run dev --prefix ./frontend

# Create DB container
docker-run:
	@if docker compose up --build 2>/dev/null; then \
		: ; \
	else \
		echo "Falling back to Docker Compose V1"; \
		docker compose up --build; \
	fi
	

db:
	@echo "Running DB container..."
	@docker compose up -d postgres
	@make migrate

# Shutdown DB container
docker-down:
	@if docker compose down 2>/dev/null; then \
		: ; \
	else \
		echo "Falling back to Docker Compose V1"; \
		docker compose down; \
	fi

# Test the application
test:
	@echo "Testing..."
	@go test ./... -v

# Integrations Tests for the application
itest:
	@echo "Running integration tests..."
	@go test ./internal/database -v

# Clean the binary
clean:
	@echo "Cleaning..."
	@rm -f main

# Live Reload
watch:
	@if command -v air > /dev/null; then \
            air; \
            echo "Watching...";\
        else \
            read -p "Go's 'air' is not installed on your machine. Do you want to install it? [Y/n] " choice; \
            if [ "$$choice" != "n" ] && [ "$$choice" != "N" ]; then \
                go install github.com/air-verse/air@latest; \
                air; \
                echo "Watching...";\
            else \
                echo "You chose not to install air. Exiting..."; \
                exit 1; \
            fi; \
        fi

# Destroy the application
destroy:
	@echo "Destroying..."
	@docker compose down -v --rmi all
	@docker system prune -af --volumes
	@echo "Destroyed"

migrate:
	@echo "Running migrations..."
	@if [ -f .env ]; then \
		set -a; source .env; set +a; \
		migrate -path internal/database/migrations -database "postgresql://$$POSTGRES_USERNAME:$$POSTGRES_PASSWORD@$$POSTGRES_HOST:$$POSTGRES_PORT/$$POSTGRES_DATABASE?sslmode=disable" up; \
	else \
		echo "Error: .env file not found"; \
		exit 1; \
	fi
