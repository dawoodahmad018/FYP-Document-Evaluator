import sys
sys.path.append('.')
try:
    from database import SessionLocal
    from models.document import Document
    from services.doc_parser import extract_text
    from services.claude_service import evaluate_document

    db = SessionLocal()
    doc = db.query(Document).order_by(Document.id.desc()).first()
    print(f"Testing Latest Document: {doc.id} - {doc.filename}")
    
    text = extract_text(doc.file_path)
    print(f"Extracted Text Length: {len(text)}")
    print(f"Doc Type: {doc.doc_type}")
    
    res = evaluate_document(text, doc.doc_type)
    print("SUCCESS!", res)
except Exception as e:
    import traceback
    traceback.print_exc()
