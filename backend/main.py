"""
TUG Enter — FastAPI Backend v2
Çoklu araştırmacı desteği: responsible alanı JSON array olarak saklanır
"""
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import Optional, List
import shutil, uuid, os, json
from pathlib import Path
from datetime import date
import httpx

from database import SessionLocal, engine
import models, schemas

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="TUG Enter API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://localhost:3000","*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

def get_db():
    db = SessionLocal()
    try:    yield db
    finally: db.close()

@app.get("/health")
def health():
    return {"status": "online", "system": "TUG Enter v2.0"}

@app.get("/api/observatory/weather")
async def observatory_weather():
    """TUG ve DAG gözlemevi canlı hava + astronomi verisi proxy"""
    TUG_URL = "https://trgozlemevleri.gov.tr/api/tugmeteo"
    DAG_URL = "https://trgozlemevleri.gov.tr/api/dagmeteo"
    headers = {"User-Agent": "TUGEnterApp/2.0"}
    tug_data, dag_data = None, None
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            r = await client.get(TUG_URL, headers=headers)
            if r.status_code == 200:
                tug_data = r.json()
        except Exception:
            pass
        try:
            r = await client.get(DAG_URL, headers=headers)
            if r.status_code == 200:
                raw = r.json()
                # DAG API: liste listesi, 3. eleman mevcut veriler
                if isinstance(raw, list) and len(raw) > 2:
                    inner = raw[2]
                    if isinstance(inner, list) and len(inner) > 0:
                        dag_data = inner[-1]  # en son kayıt
        except Exception:
            pass
    return {"tug": tug_data, "dag": dag_data}

@app.post("/api/projects", response_model=schemas.ProjectOut, status_code=201)
async def create_project(
    project_name: str = Form(...),
    purpose:      str = Form(...),
    # Araştırmacılar: JSON string array VEYA virgülle ayrılmış string
    responsible:  str = Form(...),
    start_date:   Optional[str] = Form(None),
    telescope:    Optional[str] = Form(None),
    image:        Optional[UploadFile] = File(None),
    db:           Session = Depends(get_db),
):
    # responsible: frontend JSON array gönderebilir ya da tek isim
    try:
        parsed = json.loads(responsible)
        if isinstance(parsed, list):
            responsible_str = ", ".join([r.strip() for r in parsed if r.strip()])
        else:
            responsible_str = str(parsed)
    except (json.JSONDecodeError, TypeError):
        responsible_str = responsible

    # Tarih parse
    parsed_date = None
    if start_date:
        try:
            parsed_date = date.fromisoformat(start_date)
        except ValueError:
            pass

    # Görsel kaydet
    image_path = None
    if image and image.filename:
        ext  = Path(image.filename).suffix or ".jpg"
        name = f"{uuid.uuid4().hex}{ext}"
        dest = UPLOAD_DIR / name
        with open(dest, "wb") as f:
            shutil.copyfileobj(image.file, f)
        image_path = f"/uploads/{name}"

    project = models.Project(
        project_name=project_name,
        purpose=purpose,
        responsible=responsible_str,
        start_date=parsed_date,
        telescope=telescope,
        image_path=image_path,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@app.get("/api/projects", response_model=List[schemas.ProjectOut])
def list_projects(db: Session = Depends(get_db)):
    return db.query(models.Project).filter(models.Project.is_completed == False).order_by(models.Project.created_at.desc()).all()

@app.get("/api/projects/completed", response_model=List[schemas.ProjectOut])
def list_completed_projects(db: Session = Depends(get_db)):
    return db.query(models.Project).filter(models.Project.is_completed == True).order_by(models.Project.updated_at.desc()).all()

@app.get("/api/projects/{project_id}", response_model=schemas.ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db)):
    p = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not p:
        raise HTTPException(404, "Proje bulunamadı")
    return p

@app.put("/api/projects/{project_id}/complete", response_model=schemas.ProjectOut)
async def complete_project(
    project_id: int, 
    evaluation: str = Form(...),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    p = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not p:
        raise HTTPException(404, "Proje bulunamadı")
    if p.is_completed:
        raise HTTPException(400, "Proje zaten sonlandırılmış")
    
    # Görsel kaydet (Eski ana resmi üzerine yazıyoruz ki arşivde kolaj görünsün)
    if image and image.filename:
        ext  = Path(image.filename).suffix or ".jpg"
        name = f"{uuid.uuid4().hex}{ext}"
        dest = UPLOAD_DIR / name
        with open(dest, "wb") as f:
            shutil.copyfileobj(image.file, f)
        p.image_path = f"/uploads/{name}"

    p.is_completed = True
    p.evaluation = evaluation
    db.commit()
    db.refresh(p)
    return p
@app.delete("/api/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    p = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not p:
        raise HTTPException(404, "Proje bulunamadı")
    db.delete(p)
    db.commit()
    return {"deleted": project_id}