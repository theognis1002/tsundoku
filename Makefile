.PHONY: all build run test clean watch docker-run docker-down itest migrate db

# Create DB container
run:
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
stop:
	@if docker compose down 2>/dev/null; then \
		: ; \
	else \
		echo "Falling back to Docker Compose V1"; \
		docker compose down; \
	fi

# Destroy the application
destroy:
	@echo "Destroying..."
	@docker compose down -v --rmi all
	@docker system prune -af --volumes
	@echo "Destroyed"
