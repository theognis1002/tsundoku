import os

import groq
from sqlalchemy.orm import Session

from backend.models.book import Chapter


class SummaryController:
    """Controller for handling chapter summaries"""

    @staticmethod
    async def generate_summary(content: str) -> str:
        """Generate a summary using Groq API"""
        client = groq.AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

        prompt = f"""Please provide a concise summary of the following chapter text in 5-10 sentences:

{content}

Summary:"""

        chat_completion = await client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=os.getenv("LLM_MODEL", "gemma2-9b-it"),
            temperature=0,
            max_tokens=1000,
        )

        return chat_completion.choices[0].message.content.strip()

    @classmethod
    async def summarize_chapter(cls, chapter_id: int, db: Session) -> str:
        """Generate and save summary for a chapter"""
        chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
        if not chapter:
            raise ValueError("Chapter not found")

        summary = await cls.generate_summary(chapter.content)
        chapter.summary = summary
        db.commit()

        return summary
