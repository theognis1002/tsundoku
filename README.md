# Project tsundoku

Tsundoku is a Japanese word that describes the practice of buying books and leaving them unread. It can also refer to the books themselves that are piled up. The goal of this project is to help ease the burden of buying books and leaving them unread - even if that means just summarizing chapters and snippets of the book.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

## MakeFile Commands

Start the application with Docker Compose:

```bash
make run
```

Start only the database container and run migrations:

```bash
make db
```

Stop all containers:

```bash
make stop
```

Completely destroy all containers, volumes, and images:

```bash
make destroy
```

Note: The system will automatically fall back to Docker Compose V1 syntax if V2 is not available.
