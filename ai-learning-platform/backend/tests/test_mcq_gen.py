import pytest, json

SAMPLE_TEXT = """
Photosynthesis is the process by which plants convert sunlight into energy.
It occurs in the chloroplasts. The formula is 6CO2 + 6H2O + light -> C6H12O6 + 6O2.
"""

def test_mcq_json_structure(monkeypatch):
    from services import mcq_generator
    monkeypatch.setattr(
        mcq_generator, "chat",
        lambda *a, **kw: json.dumps([{
            "question": "Where does photosynthesis occur?",
            "options": ["Mitochondria", "Chloroplasts", "Nucleus", "Ribosome"],
            "correct_index": 1,
            "explanation": "Chloroplasts contain chlorophyll.",
            "topic_tag": "biology"
        }])
    )
    result = mcq_generator.generate_mcqs_from_text(SAMPLE_TEXT, count=1)
    assert isinstance(result, list)
    assert "question" in result[0]
    assert len(result[0]["options"]) == 4
