"""create books and chapters tables

Revision ID: xxxx
Revises: previous_revision_id
Create Date: 2024-xx-xx
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "xxxx"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Create books table
    op.create_table(
        "books",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("author", sa.String(length=255), nullable=True),
        sa.Column("file_path", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create chapters table
    op.create_table(
        "chapters",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("book_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("content", sa.Text(), nullable=True),
        sa.Column("order", sa.Integer(), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["book_id"],
            ["books.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create index on book_id for faster lookups
    op.create_index(op.f("ix_chapters_book_id"), "chapters", ["book_id"], unique=False)
    # Create index on order for faster sorting
    op.create_index(op.f("ix_chapters_order"), "chapters", ["order"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_chapters_order"), table_name="chapters")
    op.drop_index(op.f("ix_chapters_book_id"), table_name="chapters")
    op.drop_table("chapters")
    op.drop_table("books")
