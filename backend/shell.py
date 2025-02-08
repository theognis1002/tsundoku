import IPython
from sqlalchemy.orm import Session

from backend.database import SessionLocal
from backend.models.book import Book, Chapter  # noqa

# Start a new database session
db: Session = SessionLocal()

context = {
    "db": db,  # Database session
    "SessionLocal": SessionLocal,  # Session Factory
    # Add models for easier access
}

print("\nAvailable Variables:")
for key in context:
    print(f"  - {key}")

# Start IPython shell
IPython.start_ipython(argv=[], user_ns=context)

# Close DB session after shell exits
db.close()
