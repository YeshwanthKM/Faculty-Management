from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database
from database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Faculty Invigilation API")
templates = Jinja2Templates(directory="templates")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Startup Event (Automatic Seeding) ---
@app.on_event("startup")
def startup_event():
    print("DEBUG: Application starting - initializing fresh database...")
    from database import SessionLocal
    db = SessionLocal()
    try:
        # 1. Create tables if they don't exist
        models.Base.metadata.create_all(bind=engine)
        
        # 2. CLEAR ALL DATA for a fresh start
        db.query(models.Allocation).delete()
        db.query(models.ExamSchedule).delete()
        db.query(models.Faculty).delete()
        db.commit()
        
        # 3. SEED 20 South Indian Faculty
        import random
        first_names = ["Arjun", "Lakshmi", "Venkatesh", "Priya", "Karthik", "Sneha", "Rahul", "Meena", "Suresh", "Vidya", 
                       "Ganesh", "Deepa", "Hari", "Anitha", "Vijay", "Keerthi", "Madhav", "Sindhu", "Rajesh", "Kavitha"]
        last_names = ["Rao", "Reddy", "Iyer", "Nair", "Shetty", "Pillai", "Choudary", "Varma", "Kumar", "Murthy"]
        departments = ["CCE", "ECE", "CSE", "AIML", "VLSI", "MECH", "AIDS", "CSBS", "BT", "H&S"]
        designations = ["Assistant Professor", "Associate Professor", "Professor"]
        
        for _ in range(20):
            faculty = models.Faculty(
                name=f"{random.choice(first_names)} {random.choice(last_names)}",
                department=random.choice(departments),
                designation=random.choice(designations),
                current_duties=0,
                leave_dates="[]"
            )
            db.add(faculty)
        db.commit()
        print("DEBUG: Fresh database initialized with 20 seeded faculty members.")
    except Exception as e:
        print(f"ERROR during startup: {str(e)}")
        db.rollback()
    finally:
        db.close()

# --- API Routes should come BEFORE Static Files ---

# --- Faculty Routes ---
@app.get("/api/faculty", response_model=List[schemas.Faculty])
def get_faculty(db: Session = Depends(get_db)):
    return db.query(models.Faculty).all()

@app.post("/api/faculty", response_model=schemas.Faculty)
def create_faculty(faculty: schemas.FacultyCreate, db: Session = Depends(get_db)):
    db_faculty = models.Faculty(**faculty.dict())
    db.add(db_faculty)
    db.commit()
    db.refresh(db_faculty)
    return db_faculty

@app.delete("/api/faculty/{id}")
def delete_faculty(id: int, db: Session = Depends(get_db)):
    db.query(models.Faculty).filter(models.Faculty.id == id).delete()
    db.commit()
    return {"message": "Deleted"}

# --- Exam Routes ---
@app.get("/api/exams", response_model=List[schemas.ExamSchedule])
def get_exams(db: Session = Depends(get_db)):
    return db.query(models.ExamSchedule).all()

@app.post("/api/exams", response_model=schemas.ExamSchedule)
def create_exam(exam: schemas.ExamScheduleCreate, db: Session = Depends(get_db)):
    db_exam = models.ExamSchedule(**exam.dict())
    db.add(db_exam)
    db.commit()
    db.refresh(db_exam)
    return db_exam

@app.delete("/api/exams/{id}")
def delete_exam(id: int, db: Session = Depends(get_db)):
    db.query(models.ExamSchedule).filter(models.ExamSchedule.id == id).delete()
    db.commit()
    return {"message": "Deleted"}

@app.post("/api/exams/bulk_with_allocations")
def create_bulk_exams(bulk_data: schemas.ExamBulkCreate, db: Session = Depends(get_db)):
    print(f"DEBUG: Starting bulk creation for {bulk_data.schedule_name}")
    try:
        # Step 0: Clear all previous data
        db.query(models.Allocation).delete()
        db.query(models.ExamSchedule).delete()
        # Reset faculty duties
        db.query(models.Faculty).update({models.Faculty.current_duties: 0})
        db.commit()
        print("DEBUG: Previous data cleared and duties reset.")

        created_allocations_count = 0
        created_schedules_count = 0
        
        # Refresh faculty list from DB
        all_faculty = db.query(models.Faculty).all()
        if not all_faculty:
            print("DEBUG: No faculty found in database!")
            return {"message": "No faculty found", "created_schedules": 0, "allocations": 0}

        for exam_info in bulk_data.exams:
            # Pre-check availability for this specific session
            eligible_for_session = []
            for f in all_faculty:
                if f.leave_dates and str(exam_info.exam_date) in f.leave_dates:
                    continue
                if f.availability and f.availability != "ANY" and exam_info.session.upper() not in f.availability.upper():
                    continue
                if f.current_duties >= f.max_duties:
                    continue
                eligible_for_session.append(f)
            
            required_for_session = len(bulk_data.hall_numbers) * 1 # 1 invigilator per hall
            if len(eligible_for_session) < required_for_session:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Not enough faculty available for {exam_info.exam_date} ({exam_info.session}). Required: {required_for_session}, Available: {len(eligible_for_session)}"
                )

            print(f"DEBUG: Processing exam for {exam_info.exam_date} {exam_info.session}")
            for hall in bulk_data.hall_numbers:
                # Create ExamSchedule
                exam = models.ExamSchedule(
                    exam_name=bulk_data.schedule_name,
                    exam_date=exam_info.exam_date,
                    session=exam_info.session,
                    hall_number=hall,
                    department_conducting=exam_info.department_conducting,
                    student_count=exam_info.student_count,
                    required_invigilators=exam_info.required_invigilators,
                    status="Generated"
                )
                db.add(exam)
                db.commit()
                db.refresh(exam)
                created_schedules_count += 1
                
                # Allocation Logic
                eligible = []
                for f in all_faculty:
                    # Refresh faculty object to get latest duties
                    db.refresh(f)
                    
                    # 1. Leave check
                    if f.leave_dates and str(exam.exam_date) in f.leave_dates:
                        continue
                    # 2. Availability check
                    if f.availability and f.availability != "ANY" and exam.session.upper() not in f.availability.upper():
                        continue
                    # 3. Workload check
                    if f.current_duties >= f.max_duties:
                        continue
                    # 4. Department check
                    if exam.department_conducting != "COMMON" and f.department.lower() == exam.department_conducting.lower():
                        continue
                    
                    # 5. Clash check
                    clash = db.query(models.Allocation).join(models.ExamSchedule).filter(
                        models.Allocation.faculty_id == f.id,
                        models.ExamSchedule.exam_date == exam.exam_date,
                        models.ExamSchedule.session == exam.session
                    ).first()
                    if clash:
                        continue
                    
                    eligible.append(f)

                # Sort by workload
                eligible.sort(key=lambda x: x.current_duties)
                
                # Allocate up to required count
                for i in range(min(len(eligible), exam.required_invigilators)):
                    faculty = eligible[i]
                    alloc = models.Allocation(faculty_id=faculty.id, schedule_id=exam.id)
                    db.add(alloc)
                    faculty.current_duties += 1
                    db.commit()
                    created_allocations_count += 1
                    print(f"DEBUG: Allocated {faculty.name} to {hall}")
        
        print(f"DEBUG: Finished. Created {created_schedules_count} schedules and {created_allocations_count} allocations.")
        return {
            "message": "Success", 
            "created_schedules": created_schedules_count, 
            "allocations": created_allocations_count
        }
    except Exception as e:
        print(f"ERROR: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/exams/by_session")
def delete_exam_session(exam_date: str, session: str, db: Session = Depends(get_db)):
    from datetime import datetime
    print(f"DEBUG: Deleting session for {exam_date} {session}")
    try:
        # Convert string to date object
        date_obj = datetime.strptime(exam_date, "%Y-%m-%d").date()
        
        # 1. Find all schedules for this date/session
        schedules = db.query(models.ExamSchedule).filter(
            models.ExamSchedule.exam_date == date_obj,
            models.ExamSchedule.session == session
        ).all()
        schedule_ids = [s.id for s in schedules]
        
        if not schedule_ids:
            return {"message": "No exams found for this session"}

        # 2. Find allocations and decrement faculty duties
        allocations = db.query(models.Allocation).filter(
            models.Allocation.schedule_id.in_(schedule_ids)
        ).all()
        
        for alloc in allocations:
            faculty = db.query(models.Faculty).filter(models.Faculty.id == alloc.faculty_id).first()
            if faculty and faculty.current_duties > 0:
                faculty.current_duties -= 1
        
        # 3. Delete data
        db.query(models.Allocation).filter(models.Allocation.schedule_id.in_(schedule_ids)).delete(synchronize_session=False)
        db.query(models.ExamSchedule).filter(models.ExamSchedule.id.in_(schedule_ids)).delete(synchronize_session=False)
        
        db.commit()
        return {"status": "success", "message": f"Session {exam_date} {session} deleted successfully"}
    except Exception as e:
        print(f"ERROR in delete_session: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# --- Allocation Logic ---
@app.get("/api/allocations", response_model=List[schemas.Allocation])
def get_allocations(db: Session = Depends(get_db)):
    return db.query(models.Allocation).all()

@app.post("/api/allocations/generate/{schedule_id}")
def generate_allocation(schedule_id: int, db: Session = Depends(get_db)):
    schedule = db.query(models.ExamSchedule).filter(models.ExamSchedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")

    # Clear existing allocations for this schedule
    db.query(models.Allocation).filter(models.Allocation.schedule_id == schedule_id).delete()

    # Step 1: Get all faculty
    all_faculty = db.query(models.Faculty).all()

    # Step 2: Filter available faculty
    eligible = []
    for f in all_faculty:
        if f.leave_dates and str(schedule.exam_date) in f.leave_dates:
            continue
        if f.availability and f.availability != "ANY" and schedule.session.upper() not in f.availability.upper():
            continue
        if f.current_duties >= f.max_duties:
            continue
        if f.department.lower() == schedule.department_conducting.lower():
            continue
        clash = db.query(models.Allocation).join(models.ExamSchedule).filter(
            models.Allocation.faculty_id == f.id,
            models.ExamSchedule.exam_date == schedule.exam_date,
            models.ExamSchedule.session == schedule.session
        ).first()
        if clash:
            continue
        eligible.append(f)

    eligible.sort(key=lambda x: x.current_duties)

    new_allocations = []
    for i in range(min(len(eligible), schedule.required_invigilators)):
        faculty = eligible[i]
        alloc = models.Allocation(faculty_id=faculty.id, schedule_id=schedule.id)
        db.add(alloc)
        faculty.current_duties += 1
        db.commit()
        db.refresh(alloc)
        new_allocations.append(alloc)

    return new_allocations

@app.get("/api/insights", response_model=schemas.Insights)
def get_insights(db: Session = Depends(get_db)):
    total_faculty = db.query(models.Faculty).count()
    total_exams = db.query(models.ExamSchedule).count()
    
    # Dept workload
    faculties = db.query(models.Faculty).all()
    dept_workload = {}
    for f in faculties:
        dept_workload[f.department] = dept_workload.get(f.department, 0) + f.current_duties
        
    # Highest workload dept
    highest_dept = max(dept_workload, key=dept_workload.get) if dept_workload else "N/A"
    
    # Max duties faculty
    max_faculty = db.query(models.Faculty).order_by(models.Faculty.current_duties.desc()).first()
    max_fac_name = max_faculty.name if max_faculty else "N/A"
    
    # Underutilized (0 duties)
    underutilized = db.query(models.Faculty).filter(models.Faculty.current_duties == 0).count()
    
    # Status summary
    exams = db.query(models.ExamSchedule).all()
    status_summary = {}
    for e in exams:
        status_summary[e.status] = status_summary.get(e.status, 0) + 1
        
    return {
        "highest_workload_dept": highest_dept,
        "max_duties_faculty": max_fac_name,
        "underutilized_count": underutilized,
        "total_faculty": total_faculty,
        "total_exams": total_exams,
        "dept_workload": dept_workload,
        "status_summary": status_summary
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Serve static files from the "static" directory
app.mount("/", StaticFiles(directory="static", html=True), name="static")
