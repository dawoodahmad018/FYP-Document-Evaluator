from datetime import datetime

from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: int
    user_id: int
    filename: str
    doc_type: str
    uploaded_at: datetime
    status: str

    class Config:
        from_attributes = True
