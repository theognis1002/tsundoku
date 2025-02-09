from pathlib import Path

from bs4 import BeautifulSoup
from ebooklib import epub


def read_epub(file_path: str | Path) -> dict[str, str]:
    """
    Read an EPUB file and extract chapter titles and content.

    Args:
        file_path: Path to the EPUB file

    Returns:
        Dictionary mapping chapter titles to their content
    """
    # Read the epub file
    book = epub.read_epub(str(file_path), {"ignore_ncx": True})
    chapters: dict[str, str] = {}

    # Process each item in the book
    for item in book.get_items():
        if isinstance(item, epub.EpubHtml):
            # Parse HTML content
            soup = BeautifulSoup(item.get_body_content(), "html.parser")

            # Extract title from headings
            title = None
            for heading in soup.find_all(["h1", "h2", "h3"]):
                if heading.text.strip():
                    title = heading.text.strip()
                    break

            # If no heading found, use item ID as title
            if not title:
                title = item.id

            # Extract and clean content
            content = soup.get_text().strip()

            chapters[title] = content

    return chapters


def main() -> None:
    """Example usage of the epub reader"""
    file_path = Path("ebook2.epub")
    if not file_path.exists():
        print(f"File not found: {file_path}")
        return

    try:
        chapters = read_epub(file_path)
        print(f"Found {len(chapters)} chapters:")
        for title, content in chapters.items():
            print(f"\nChapter: {title}")
            print(f"Content preview: {content[:50]}...")
            print("Length: ", len(content))
    except Exception as e:
        print(f"Error reading epub: {e}")


if __name__ == "__main__":
    main()
