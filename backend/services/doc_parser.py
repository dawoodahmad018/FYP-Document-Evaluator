from pathlib import Path

import docx
import fitz


def extract_text(file_path: str) -> str:
    path = Path(file_path)
    suffix = path.suffix.lower()

    if suffix == ".pdf":
        return _parse_pdf(path)
    if suffix == ".docx":
        return _parse_docx(path)

    raise ValueError("Unsupported file type")


def _parse_pdf(path: Path) -> str:
    text_parts: list[str] = []
    with fitz.open(path) as pdf:
        for page in pdf:
            text_parts.append(page.get_text("text"))
    return "\n".join(text_parts).strip()


def _parse_docx(path: Path) -> str:
    document = docx.Document(path)
    return "\n".join([p.text for p in document.paragraphs if p.text.strip()]).strip()
