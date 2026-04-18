from datetime import datetime
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def _score_color(score: float) -> str:
    if score >= 8:
        return "#1f9d55"
    if score >= 5:
        return "#f18701"
    return "#f35b04"


def _score_label(score: float) -> str:
    if score >= 8:
        return "Excellent"
    if score >= 5:
        return "Good"
    return "Needs Work"


def generate_report_pdf(report_data: dict, output_path: str) -> str:
    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)

    doc = SimpleDocTemplate(str(output), pagesize=A4, rightMargin=2 * cm, leftMargin=2 * cm)
    styles = getSampleStyleSheet()
    story = []

    title_style = ParagraphStyle("TitleStyle", parent=styles["Title"], textColor=colors.HexColor("#3d348b"))
    heading_style = ParagraphStyle("HeadingStyle", parent=styles["Heading2"], textColor=colors.HexColor("#f35b04"))

    story.append(Paragraph("FYP Document Evaluation Report", title_style))
    story.append(Paragraph("University Logo: [Placeholder]", styles["Italic"]))
    story.append(Spacer(1, 12))

    doc_info = [
        ["Filename", report_data["filename"]],
        ["Type", report_data["doc_type"]],
        ["Date", datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")],
        ["Student", report_data["student_name"]],
    ]
    info_table = Table(doc_info, colWidths=[5 * cm, 10 * cm])
    info_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f7b801")),
                ("TEXTCOLOR", (0, 0), (-1, -1), colors.black),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ]
        )
    )
    story.append(info_table)
    story.append(Spacer(1, 12))

    story.append(Paragraph("Score Summary", heading_style))
    score_rows = [
        ["Criterion", "Score"],
        ["Grammar", f"{report_data['grammar_score']:.1f}/10"],
        ["Structure", f"{report_data['structure_score']:.1f}/10"],
        ["Formatting", f"{report_data['formatting_score']:.1f}/10"],
        ["Relevance", f"{report_data['relevance_score']:.1f}/10"],
        ["AI Detection", f"{report_data['ai_detect_score']:.1f}/10"],
    ]
    score_table = Table(score_rows, colWidths=[8 * cm, 4 * cm])
    score_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#7678ed")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ]
        )
    )
    story.append(score_table)
    story.append(Spacer(1, 10))

    overall_score = report_data["overall_score"]
    overall_color = _score_color(overall_score)
    story.append(
        Paragraph(
            f"Overall Score: <font color='{overall_color}'><b>{overall_score:.1f}/10 ({_score_label(overall_score)})</b></font>",
            styles["Heading1"],
        )
    )
    story.append(Spacer(1, 12))

    feedback_sections = [
        ("Grammar Feedback", report_data["grammar_feedback"]),
        ("Structure Feedback", report_data["structure_feedback"]),
        ("Formatting Feedback", report_data["formatting_feedback"]),
        ("Relevance Feedback", report_data["relevance_feedback"]),
        ("AI Detection Feedback", report_data["ai_detect_feedback"]),
    ]

    for title, body in feedback_sections:
        story.append(Paragraph(title, heading_style))
        story.append(Paragraph(body, styles["BodyText"]))
        story.append(Spacer(1, 8))

    story.append(PageBreak())
    story.append(Paragraph("Questions and Answers", heading_style))
    for idx, qa in enumerate(report_data["questions_answers"], start=1):
        story.append(Paragraph(f"Q{idx}: {qa.get('question', '')}", styles["Heading4"]))
        story.append(Paragraph(f"A{idx}: {qa.get('answer', '')}", styles["BodyText"]))
        story.append(Spacer(1, 8))

    story.append(Paragraph("Professional Summary", heading_style))
    story.append(Paragraph(report_data["summary"], styles["BodyText"]))

    def _add_page_number(canvas, _doc):
        canvas.saveState()
        canvas.setFont("Helvetica", 9)
        canvas.drawRightString(19.5 * cm, 1 * cm, f"Page {canvas.getPageNumber()}")
        canvas.restoreState()

    doc.build(story, onFirstPage=_add_page_number, onLaterPages=_add_page_number)
    return str(output)
