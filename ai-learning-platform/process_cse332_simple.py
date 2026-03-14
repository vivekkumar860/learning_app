#!/usr/bin/env python3
"""
Simple CSE332 material processor that extracts content without requiring API keys
"""

import json
from pathlib import Path
from docx import Document
from datetime import datetime
import re


def extract_text_from_docx(file_path):
    """Extract all text from a DOCX file"""
    doc = Document(file_path)
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n\n".join(paragraphs)


def extract_topics_and_sections(content):
    """Extract topics and sections from the content"""
    topics = []
    sections = {}

    # Common OS topics patterns
    topic_patterns = [
        r"(?i)(process\s+management)",
        r"(?i)(thread\s+management)",
        r"(?i)(cpu\s+scheduling)",
        r"(?i)(process\s+synchronization)",
        r"(?i)(deadlock)",
        r"(?i)(memory\s+management)",
        r"(?i)(virtual\s+memory)",
        r"(?i)(file\s+system)",
        r"(?i)(i/o\s+system)",
        r"(?i)(storage\s+management)",
        r"(?i)(protection\s+and\s+security)",
        r"(?i)(distributed\s+system)",
        r"(?i)(real-time\s+system)",
        r"(?i)(system\s+call)",
        r"(?i)(inter-process\s+communication|ipc)",
        r"(?i)(paging)",
        r"(?i)(segmentation)",
        r"(?i)(page\s+replacement)",
        r"(?i)(disk\s+scheduling)",
    ]

    # Find all topics mentioned in content
    for pattern in topic_patterns:
        matches = re.findall(pattern, content)
        if matches:
            topic = matches[0].title()
            if topic not in topics:
                topics.append(topic)

                # Extract section around this topic
                topic_index = content.lower().find(topic.lower())
                if topic_index != -1:
                    start = max(0, topic_index - 100)
                    end = min(len(content), topic_index + 2000)
                    sections[topic] = content[start:end].strip()

    return topics, sections


def create_sample_quiz_questions(topics, sections):
    """Create sample quiz questions based on extracted topics"""
    questions = []

    # Sample questions for common OS topics
    topic_questions = {
        "Process Management": [
            {
                "question": "What is a process in an operating system?",
                "options": [
                    "A program in execution",
                    "A compiled program",
                    "A source code file",
                    "A system call"
                ],
                "correct_answer": 0,
                "explanation": "A process is a program in execution, including the program code, current activity, and allocated resources."
            },
            {
                "question": "Which of the following is NOT a process state?",
                "options": [
                    "Running",
                    "Ready",
                    "Waiting",
                    "Compiled"
                ],
                "correct_answer": 3,
                "explanation": "Compiled is not a process state. The main process states are New, Ready, Running, Waiting, and Terminated."
            }
        ],
        "CPU Scheduling": [
            {
                "question": "What is the purpose of CPU scheduling?",
                "options": [
                    "To maximize CPU utilization",
                    "To minimize CPU usage",
                    "To prevent processes from running",
                    "To slow down the system"
                ],
                "correct_answer": 0,
                "explanation": "CPU scheduling aims to maximize CPU utilization and system throughput by efficiently managing process execution."
            },
            {
                "question": "Which scheduling algorithm uses time quantum?",
                "options": [
                    "First Come First Serve (FCFS)",
                    "Shortest Job First (SJF)",
                    "Round Robin (RR)",
                    "Priority Scheduling"
                ],
                "correct_answer": 2,
                "explanation": "Round Robin scheduling uses a time quantum to allocate CPU time to processes in a circular manner."
            }
        ],
        "Memory Management": [
            {
                "question": "What is virtual memory?",
                "options": [
                    "Physical RAM",
                    "CPU cache",
                    "Technique that allows execution of processes not completely in memory",
                    "Hard disk space"
                ],
                "correct_answer": 2,
                "explanation": "Virtual memory is a memory management technique that provides an illusion of larger physical memory."
            },
            {
                "question": "What is a page fault?",
                "options": [
                    "An error in the program",
                    "When a page is not found in main memory",
                    "A hardware failure",
                    "A compilation error"
                ],
                "correct_answer": 1,
                "explanation": "A page fault occurs when a program accesses a page that is not currently in main memory."
            }
        ],
        "Deadlock": [
            {
                "question": "How many conditions must hold simultaneously for a deadlock to occur?",
                "options": [
                    "2",
                    "3",
                    "4",
                    "5"
                ],
                "correct_answer": 2,
                "explanation": "Four conditions must hold for deadlock: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait."
            },
            {
                "question": "Which is NOT a deadlock prevention technique?",
                "options": [
                    "Resource ordering",
                    "Banker's algorithm",
                    "Eliminating hold and wait",
                    "Process termination"
                ],
                "correct_answer": 3,
                "explanation": "Process termination is a deadlock recovery technique, not a prevention technique."
            }
        ]
    }

    # Add questions for found topics
    for topic in topics:
        for key in topic_questions:
            if key.lower() in topic.lower():
                questions.extend(topic_questions[key])

    # Add some general OS questions
    general_questions = [
        {
            "question": "What is the main purpose of an operating system?",
            "options": [
                "To manage computer hardware and software resources",
                "To compile programs",
                "To browse the internet",
                "To create documents"
            ],
            "correct_answer": 0,
            "explanation": "The OS manages hardware and software resources and provides common services for computer programs."
        },
        {
            "question": "What is a system call?",
            "options": [
                "A phone call to tech support",
                "An interface between a process and the operating system",
                "A function call within a program",
                "A hardware interrupt"
            ],
            "correct_answer": 1,
            "explanation": "System calls provide an interface between a running process and the operating system."
        }
    ]

    questions.extend(general_questions)

    return questions


def create_flashcards(topics, sections):
    """Create flashcards for key OS concepts"""
    flashcards = []

    # Core OS concepts flashcards
    core_flashcards = [
        {
            "front": "Process",
            "back": "A program in execution, including program code, current activity, and allocated resources"
        },
        {
            "front": "Thread",
            "back": "The smallest unit of execution within a process, sharing process resources but having its own program counter and stack"
        },
        {
            "front": "Context Switching",
            "back": "The process of storing and restoring the state of a process so that execution can be resumed from the same point later"
        },
        {
            "front": "Semaphore",
            "back": "A synchronization primitive used to control access to shared resources by multiple processes"
        },
        {
            "front": "Mutex",
            "back": "A mutual exclusion object that allows only one thread to access a resource at a time"
        },
        {
            "front": "Deadlock",
            "back": "A situation where processes are blocked forever, waiting for each other to release resources"
        },
        {
            "front": "Virtual Memory",
            "back": "Memory management technique that provides an illusion of larger physical memory using disk space"
        },
        {
            "front": "Page Table",
            "back": "Data structure used by the OS to store the mapping between virtual and physical addresses"
        },
        {
            "front": "Thrashing",
            "back": "Excessive paging activity when a system spends more time paging than executing"
        },
        {
            "front": "File System",
            "back": "Method and data structure that the OS uses to control how data is stored and retrieved on disk"
        },
        {
            "front": "FCFS Scheduling",
            "back": "First-Come-First-Served - simplest scheduling algorithm where processes are executed in arrival order"
        },
        {
            "front": "Round Robin Scheduling",
            "back": "Scheduling algorithm where each process gets a fixed time quantum in circular order"
        },
        {
            "front": "Priority Scheduling",
            "back": "Scheduling algorithm where processes are executed based on their priority levels"
        },
        {
            "front": "Banker's Algorithm",
            "back": "Deadlock avoidance algorithm that tests for safe state before resource allocation"
        },
        {
            "front": "TLB (Translation Lookaside Buffer)",
            "back": "Cache that stores recent virtual to physical address translations for faster memory access"
        }
    ]

    flashcards.extend(core_flashcards)

    # Add topic-specific flashcards
    topic_flashcards = {
        "Process Management": [
            {"front": "PCB (Process Control Block)", "back": "Data structure containing process information like state, program counter, registers, etc."},
            {"front": "Process States", "back": "New, Ready, Running, Waiting/Blocked, Terminated"},
            {"front": "Fork System Call", "back": "Creates a new process by duplicating the calling process"}
        ],
        "Memory Management": [
            {"front": "Paging", "back": "Memory management scheme that eliminates external fragmentation by dividing memory into fixed-size pages"},
            {"front": "Segmentation", "back": "Memory management scheme that divides memory into variable-sized logical segments"},
            {"front": "Page Replacement Algorithms", "back": "FIFO, LRU (Least Recently Used), Optimal, Clock"}
        ],
        "File System": [
            {"front": "Inode", "back": "Data structure that stores metadata about a file in Unix-like systems"},
            {"front": "Directory", "back": "Special file that contains a list of file names and their associated inodes"},
            {"front": "File Allocation Methods", "back": "Contiguous, Linked, Indexed allocation"}
        ]
    }

    # Add flashcards for found topics
    for topic in topics:
        for key in topic_flashcards:
            if key.lower() in topic.lower():
                flashcards.extend(topic_flashcards[key])

    return flashcards


def chunk_content(content, chunk_size=1500):
    """Split content into smaller chunks for processing"""
    words = content.split()
    chunks = []

    for i in range(0, len(words), chunk_size):
        chunk = ' '.join(words[i:i + chunk_size])
        chunks.append(chunk)

    return chunks


def main():
    """Main processing function"""
    print("\n🚀 CSE332 Operating Systems Material Processor")
    print("=" * 60)

    # File path
    docx_path = Path("CSE332_Complete_Study_Material (1).docx")

    if not docx_path.exists():
        print(f"❌ Error: File not found at {docx_path}")
        return

    print(f"📄 Processing: {docx_path.name}")

    # Extract content
    print("📖 Extracting content from DOCX...")
    content = extract_text_from_docx(docx_path)
    print(f"✅ Extracted {len(content)} characters")

    # Extract topics and sections
    print("🔍 Identifying topics...")
    topics, sections = extract_topics_and_sections(content)
    print(f"✅ Found {len(topics)} topics: {', '.join(topics[:5])}...")

    # Chunk content
    print("✂️ Chunking content...")
    chunks = chunk_content(content)
    print(f"✅ Created {len(chunks)} chunks")

    # Generate quiz questions
    print("❓ Generating quiz questions...")
    quiz_questions = create_sample_quiz_questions(topics, sections)
    print(f"✅ Created {len(quiz_questions)} quiz questions")

    # Generate flashcards
    print("🎴 Generating flashcards...")
    flashcards = create_flashcards(topics, sections)
    print(f"✅ Created {len(flashcards)} flashcards")

    # Create output directory
    output_dir = Path("processed_materials/CSE332")
    output_dir.mkdir(parents=True, exist_ok=True)

    # Save metadata
    metadata = {
        "course_code": "CSE332",
        "course_name": "Operating Systems",
        "document_name": docx_path.name,
        "processed_at": datetime.now().isoformat(),
        "topics": topics,
        "total_characters": len(content),
        "total_chunks": len(chunks),
        "total_questions": len(quiz_questions),
        "total_flashcards": len(flashcards)
    }

    with open(output_dir / "metadata.json", "w", encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    # Save content chunks
    with open(output_dir / "chunks.json", "w", encoding='utf-8') as f:
        json.dump({"chunks": chunks}, f, indent=2, ensure_ascii=False)

    # Save full content
    with open(output_dir / "content.txt", "w", encoding='utf-8') as f:
        f.write(content)

    # Save topic sections
    with open(output_dir / "topics.json", "w", encoding='utf-8') as f:
        json.dump({"topics": topics, "sections": sections}, f, indent=2, ensure_ascii=False)

    # Save quiz questions
    with open(output_dir / "quiz_questions.json", "w", encoding='utf-8') as f:
        json.dump({"questions": quiz_questions}, f, indent=2, ensure_ascii=False)

    # Save flashcards
    with open(output_dir / "flashcards.json", "w", encoding='utf-8') as f:
        json.dump({"flashcards": flashcards}, f, indent=2, ensure_ascii=False)

    print(f"\n💾 All data saved to: {output_dir.absolute()}")

    # Print summary
    print("\n" + "=" * 60)
    print("📊 PROCESSING SUMMARY")
    print("=" * 60)
    print(f"✅ Topics identified: {len(topics)}")
    print(f"✅ Content chunks: {len(chunks)}")
    print(f"✅ Quiz questions: {len(quiz_questions)}")
    print(f"✅ Flashcards: {len(flashcards)}")

    # Show sample outputs
    print("\n📝 SAMPLE CONTENT (first 500 chars):")
    print("-" * 40)
    print(content[:500] + "...")

    if quiz_questions:
        print("\n❓ SAMPLE QUIZ QUESTION:")
        print("-" * 40)
        q = quiz_questions[0]
        print(f"Q: {q['question']}")
        for i, opt in enumerate(q['options']):
            print(f"   {i+1}. {opt}")
        print(f"Answer: {q['options'][q['correct_answer']]}")
        print(f"Explanation: {q['explanation']}")

    if flashcards:
        print("\n🎴 SAMPLE FLASHCARDS:")
        print("-" * 40)
        for card in flashcards[:3]:
            print(f"Front: {card['front']}")
            print(f"Back: {card['back']}")
            print()

    print("=" * 60)
    print("✅ Processing complete!\n")


if __name__ == "__main__":
    main()