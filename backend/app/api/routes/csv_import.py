from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Dict
import json
from backend.app.core.database import get_db
from backend.app.models.entities import AuditLog
from backend.app.services.csv_service import CSVService
from pydantic import BaseModel

router = APIRouter()

class CSVPreviewInput(BaseModel):
    csv_content: str

class CSVImportInput(BaseModel):
    csv_content: str
    project_id: int
    column_mapping: Dict[str, str]

@router.post("/preview")
def preview_csv_data(payload: CSVPreviewInput):
    return CSVService.preview_csv(payload.csv_content)

@router.post("/import-tasks")
def import_tasks_data(payload: CSVImportInput, db: Session = Depends(get_db)):
    result = CSVService.import_tasks_csv(
        file_content=payload.csv_content,
        mapping=payload.column_mapping,
        project_id=payload.project_id,
        db=db
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "CSV import failed"))

    db.add(AuditLog(
        action="CSV_TASK_IMPORT",
        resource_type="PROJECT",
        resource_id=str(payload.project_id),
        details=f"Imported {result['imported_count']} tasks via CSV (skipped {result['skipped_count']} duplicates).",
        ip_address="127.0.0.1"
    ))
    db.commit()
    return result

@router.post("/upload")
async def upload_csv_file(file: UploadFile = File(...)):
    content = await file.read()
    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        text = content.decode("latin-1")
    return CSVService.preview_csv(text)
