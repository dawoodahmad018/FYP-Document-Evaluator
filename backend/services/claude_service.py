import json
import re
from typing import Any

from groq import Groq
import groq

from config import settings

SYSTEM_PROMPT = """You are an expert academic document evaluator for
university Final Year Projects (FYP). You will evaluate
a student-submitted document and return a detailed
JSON evaluation.

Evaluate strictly on these 5 criteria:
1. grammar_score (0-10): English grammar, spelling, clarity
2. structure_score (0-10): Proper sections for the doc type
   - SRS: Introduction, Scope, Functional Requirements,
     Non-Functional, Use Cases, Diagrams references
   - SDD: System Architecture, Component Design,
     Database Design, Interface Design
   - Scope Document: Problem Statement, Objectives,
     Delimitations, Timeline
   - FYP Proposal: Title, Abstract, Introduction,
     Related Work, Methodology, Timeline, References
3. formatting_score (0-10): Proper headings, spacing,
   numbering, font consistency, professional layout
4. relevance_score (0-10): Content is relevant, coherent,
   and appropriate for document type
5. ai_detect_score (0-10): 10 = fully human written,
   0 = clearly AI generated. Look for unnatural phrasing,
   repetitive structures, lack of personal voice.

Also generate:
- 5 relevant questions with answers based on the document
- A professional overall summary (2-3 sentences)

Respond ONLY in this exact JSON format:
{
  \"grammar_score\": <number>,
  \"grammar_feedback\": \"<detailed feedback>\",
  \"structure_score\": <number>,
  \"structure_feedback\": \"<detailed feedback>\",
  \"formatting_score\": <number>,
  \"formatting_feedback\": \"<detailed feedback>\",
  \"relevance_score\": <number>,
  \"relevance_feedback\": \"<detailed feedback>\",
  \"ai_detect_score\": <number>,
  \"ai_detect_feedback\": \"<detailed feedback>\",
  \"overall_score\": <number>,
  \"summary\": \"<professional summary>\",
  \"questions_answers\": [
    {\"question\": \"<q1>\", \"answer\": \"<a1>\"},
    {\"question\": \"<q2>\", \"answer\": \"<a2>\"},
    {\"question\": \"<q3>\", \"answer\": \"<a3>\"},
    {\"question\": \"<q4>\", \"answer\": \"<a4>\"},
    {\"question\": \"<q5>\", \"answer\": \"<a5>\"}
  ]
}"""


DEFAULT_MODEL_CANDIDATES = [
    "llama-3.3-70b-versatile",
    "llama3-70b-8192",
    "llama3-8b-8192"
]


def evaluate_document(text: str, doc_type: str) -> dict[str, Any]:
    if not settings.GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is not set")

    client = Groq(api_key=settings.GROQ_API_KEY)
    
    # Increase text limit to 20,000 for Groq which is generous
    limited_text = text[:20000]

    model_candidates: list[str] = [settings.GROQ_MODEL] + DEFAULT_MODEL_CANDIDATES
    seen: set[str] = set()
    response_content = None
    last_error: Exception | None = None

    for model_name in model_candidates:
        if not model_name or model_name in seen:
            continue
        seen.add(model_name)
        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"Document Type: {doc_type}\n\nDocument Content:\n{limited_text}"}
                ],
                temperature=0.2,
                max_tokens=2000,
                response_format={"type": "json_object"}
            )
            response_content = response.choices[0].message.content
            break
        except groq.APIStatusError as exc:
            last_error = exc
        except groq.APIError as exc:
            last_error = exc

    if response_content is None:
        if last_error:
            raise last_error
        raise ValueError("No supported Groq model was available for this API key")

    if not response_content:
        raise ValueError("Empty response from Groq")

    json_text = _extract_json(response_content)
    payload = json.loads(json_text)
    return _normalize_payload(payload)


def _extract_json(raw_text: str) -> str:
    raw_text = raw_text.strip()

    if raw_text.startswith("```"):
        raw_text = raw_text.strip("`")
        raw_text = raw_text.replace("json\n", "", 1).strip()

    if raw_text.startswith("{") and raw_text.endswith("}"):
        return raw_text

    match = re.search(r"\{[\s\S]*\}", raw_text)
    if not match:
        raise ValueError("No JSON object found in Gemini response")
    return match.group(0)


def _normalize_payload(payload: dict[str, Any]) -> dict[str, Any]:
    keys = [
        "grammar_score",
        "grammar_feedback",
        "structure_score",
        "structure_feedback",
        "formatting_score",
        "formatting_feedback",
        "relevance_score",
        "relevance_feedback",
        "ai_detect_score",
        "ai_detect_feedback",
        "overall_score",
        "summary",
        "questions_answers",
    ]

    for key in keys:
        if key not in payload:
            raise ValueError(f"Missing key in evaluation payload: {key}")

    for score_key in [
        "grammar_score",
        "structure_score",
        "formatting_score",
        "relevance_score",
        "ai_detect_score",
        "overall_score",
    ]:
        payload[score_key] = max(0.0, min(10.0, float(payload[score_key])))

    qa = payload.get("questions_answers")
    if not isinstance(qa, list):
        payload["questions_answers"] = []
    else:
        payload["questions_answers"] = qa[:5]

    return payload
