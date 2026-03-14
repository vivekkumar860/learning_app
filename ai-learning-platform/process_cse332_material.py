#!/usr/bin/env python3
"""
Process CSE332 study material and prepare it for the AI Learning Platform
"""

import os
import sys
import json
from pathlib import Path
from docx import Document
import hashlib
from datetime import datetime

# Add backend to path for imports
sys.path.append(str(Path(__file__).parent / 'backend'))

from utils.docx_parser import extract_text_from_docx
from utils.chunker import chunk_text
from services.llm import LLMService
from services.mcq_generator import MCQGenerator
from services.summariser import Summariser

class CSE332Processor:
    def __init__(self, docx_path):
        self.docx_path = Path(docx_path)
        self.llm_service = LLMService()
        self.mcq_generator = MCQGenerator()
        self.summariser = Summariser()
        self.content = None
        self.chunks = []
        self.metadata = {
            "course_code": "CSE332",
            "course_name": "Operating Systems",
            "document_name": self.docx_path.name,
            "processed_at": datetime.now().isoformat()
        }

    def extract_content(self):
        """Extract text content from the DOCX file"""
        print("📄 Extracting content from DOCX file...")

        with open(self.docx_path, 'rb') as f:
            file_bytes = f.read()

        self.content = extract_text_from_docx(file_bytes)

        # Extract key topics from content
        self.extract_topics()

        print(f"✅ Extracted {len(self.content)} characters of content")
        return self.content

    def extract_topics(self):
        """Extract main topics from the content"""
        print("🔍 Identifying key topics...")

        # Simple topic extraction based on common OS topics and headings
        topics = []
        content_lower = self.content.lower()

        # Common OS topics to look for
        os_topics = [
            "Process Management",
            "Thread Management",
            "CPU Scheduling",
            "Process Synchronization",
            "Deadlock",
            "Memory Management",
            "Virtual Memory",
            "File System",
            "I/O Systems",
            "Storage Management",
            "Protection and Security",
            "Distributed Systems",
            "Real-Time Systems",
            "Virtualization",
            "System Calls",
            "Inter-Process Communication",
            "Paging",
            "Segmentation",
            "Page Replacement",
            "Disk Scheduling"
        ]

        for topic in os_topics:
            if topic.lower() in content_lower:
                topics.append(topic)

        self.metadata["topics"] = topics
        print(f"✅ Identified {len(topics)} topics: {', '.join(topics[:5])}...")

        return topics

    def chunk_content(self, chunk_size=1500):
        """Chunk the content for processing"""
        print("✂️ Chunking content for processing...")

        self.chunks = chunk_text(self.content, chunk_size=chunk_size, overlap=200)

        print(f"✅ Created {len(self.chunks)} chunks")
        return self.chunks

    def generate_summary(self):
        """Generate a comprehensive summary of the material"""
        print("📝 Generating summary...")

        # Take first few chunks for summary (to stay within token limits)
        summary_text = "\n\n".join(self.chunks[:5]) if len(self.chunks) > 5 else self.content

        summary_prompt = f"""
        Create a comprehensive study guide summary for the following Operating Systems content.
        Include key concepts, definitions, and important points.

        Content:
        {summary_text[:8000]}

        Format the summary with clear sections and bullet points.
        """

        try:
            summary = self.summariser.summarise(summary_text[:8000])
            self.metadata["summary"] = summary
            print("✅ Summary generated successfully")
            return summary
        except Exception as e:
            print(f"⚠️ Could not generate summary: {e}")
            self.metadata["summary"] = "Summary generation failed"
            return None

    def generate_quiz_questions(self, num_questions=20):
        """Generate MCQ questions from the content"""
        print(f"❓ Generating {num_questions} quiz questions...")

        questions = []

        # Generate questions from different chunks to get variety
        chunks_to_use = min(10, len(self.chunks))

        for i in range(0, chunks_to_use, 2):  # Use every other chunk
            try:
                chunk_questions = self.mcq_generator.generate_mcqs(
                    self.chunks[i],
                    num_questions=2
                )
                questions.extend(chunk_questions)

                if len(questions) >= num_questions:
                    break

            except Exception as e:
                print(f"⚠️ Error generating questions from chunk {i}: {e}")
                continue

        # Limit to requested number
        questions = questions[:num_questions]

        print(f"✅ Generated {len(questions)} quiz questions")
        return questions

    def generate_flashcards(self, num_cards=30):
        """Generate flashcards for key concepts"""
        print(f"🎴 Generating {num_cards} flashcards...")

        flashcard_prompt = """
        Create flashcards for Operating Systems concepts from this content.
        Each flashcard should have:
        - Front: A term, concept, or question
        - Back: The definition, explanation, or answer

        Content:
        {content}

        Generate {num} flashcards in JSON format:
        [
            {{"front": "...", "back": "..."}},
            ...
        ]
        """

        flashcards = []

        # Generate flashcards from different parts of content
        for i in range(0, min(5, len(self.chunks))):
            try:
                prompt = flashcard_prompt.format(
                    content=self.chunks[i][:2000],
                    num=6
                )

                response = self.llm_service.generate(prompt)

                # Try to parse JSON response
                if "[" in response and "]" in response:
                    start = response.find("[")
                    end = response.rfind("]") + 1
                    json_str = response[start:end]
                    cards = json.loads(json_str)
                    flashcards.extend(cards)

            except Exception as e:
                print(f"⚠️ Error generating flashcards from chunk {i}: {e}")
                continue

        # Limit to requested number
        flashcards = flashcards[:num_cards]

        print(f"✅ Generated {len(flashcards)} flashcards")
        return flashcards

    def save_processed_data(self):
        """Save all processed data to files"""
        output_dir = Path("ai-learning-platform/processed_materials/CSE332")
        output_dir.mkdir(parents=True, exist_ok=True)

        # Save metadata
        with open(output_dir / "metadata.json", "w") as f:
            json.dump(self.metadata, f, indent=2)

        # Save chunks
        with open(output_dir / "chunks.json", "w") as f:
            json.dump({"chunks": self.chunks}, f, indent=2)

        # Save full content
        with open(output_dir / "full_content.txt", "w") as f:
            f.write(self.content)

        print(f"💾 Saved processed data to {output_dir}")
        return output_dir

    def process(self):
        """Run the complete processing pipeline"""
        print("\n🚀 Starting CSE332 Material Processing Pipeline\n")
        print("=" * 60)

        # Extract content
        self.extract_content()

        # Chunk content
        self.chunk_content()

        # Generate summary
        summary = self.generate_summary()

        # Generate quiz questions
        quiz_questions = self.generate_quiz_questions(20)

        # Generate flashcards
        flashcards = self.generate_flashcards(30)

        # Save everything
        output_dir = self.save_processed_data()

        # Save quiz questions
        if quiz_questions:
            with open(output_dir / "quiz_questions.json", "w") as f:
                json.dump({"questions": quiz_questions}, f, indent=2)

        # Save flashcards
        if flashcards:
            with open(output_dir / "flashcards.json", "w") as f:
                json.dump({"flashcards": flashcards}, f, indent=2)

        print("\n" + "=" * 60)
        print("✅ Processing Complete!")
        print(f"📊 Summary:")
        print(f"   - Topics identified: {len(self.metadata.get('topics', []))}")
        print(f"   - Content chunks: {len(self.chunks)}")
        print(f"   - Quiz questions: {len(quiz_questions)}")
        print(f"   - Flashcards: {len(flashcards)}")
        print(f"   - Output saved to: {output_dir}")
        print("=" * 60 + "\n")

        return {
            "metadata": self.metadata,
            "summary": summary,
            "quiz_questions": quiz_questions,
            "flashcards": flashcards,
            "output_dir": str(output_dir)
        }


def main():
    """Main function to process the CSE332 material"""

    # Check if the file exists
    docx_path = "ai-learning-platform/CSE332_Complete_Study_Material (1).docx"

    if not Path(docx_path).exists():
        print(f"❌ Error: File not found at {docx_path}")
        print("Please ensure the DOCX file is in the correct location.")
        sys.exit(1)

    # Create processor and run
    processor = CSE332Processor(docx_path)

    try:
        result = processor.process()

        # Print sample outputs
        if result.get("summary"):
            print("\n📝 SAMPLE SUMMARY (first 500 chars):")
            print("-" * 40)
            print(result["summary"][:500] + "...")

        if result.get("quiz_questions"):
            print("\n❓ SAMPLE QUIZ QUESTION:")
            print("-" * 40)
            q = result["quiz_questions"][0]
            print(f"Q: {q.get('question', 'N/A')}")
            print(f"Options: {q.get('options', [])}")
            print(f"Answer: {q.get('correct_answer', 'N/A')}")

        if result.get("flashcards"):
            print("\n🎴 SAMPLE FLASHCARD:")
            print("-" * 40)
            card = result["flashcards"][0]
            print(f"Front: {card.get('front', 'N/A')}")
            print(f"Back: {card.get('back', 'N/A')}")

    except Exception as e:
        print(f"\n❌ Processing failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()