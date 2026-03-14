import pytest
from utils.chunker import chunk_text
from utils.pdf_parser import extract_text_from_pdf

def test_chunk_text_basic():
    text = " ".join(["word"] * 1000)
    chunks = chunk_text(text, chunk_size=100, overlap=10)
    assert len(chunks) > 1
    for c in chunks:
        assert len(c) > 0

def test_chunk_text_short():
    chunks = chunk_text("Short text.", chunk_size=500, overlap=50)
    assert len(chunks) == 1
