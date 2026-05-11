import random
from database import engine, SessionLocal
from models import Faculty, Base

# Ensure tables exist
Base.metadata.create_all(bind=engine)

def seed_faculty():
    db = SessionLocal()
    
    # Clear existing faculty members to start fresh with correct departments
    db.query(Faculty).delete()
    db.commit()

    first_names = ["Arjun", "Lakshmi", "Venkatesh", "Priya", "Karthik", "Sneha", "Rahul", "Meena", "Suresh", "Vidya", 
                   "Ganesh", "Deepa", "Hari", "Anitha", "Vijay", "Keerthi", "Madhav", "Sindhu", "Rajesh", "Kavitha",
                   "Manoj", "Divya", "Srinivas", "Ramya", "Bhaskar", "Pallavi", "Naveen", "Swathi"]
    last_names = ["Rao", "Reddy", "Iyer", "Nair", "Shetty", "Pillai", "Choudary", "Varma", "Kumar", "Murthy",
                  "Menon", "Naidu", "Bhat", "Goud", "Prasad", "Sarma", "Swamy", "Acharya", "Mani", "Dhar"]
    departments = ["CCE", "ECE", "CSE", "AIML", "VLSI", "MECH", "AIDS", "CSBS", "BT", "H&S"]
    designations = ["Professor", "Associate Professor", "Assistant Professor", "Lecturer"]

    for i in range(20):
        name = f"{random.choice(first_names)} {random.choice(last_names)}"
        department = random.choice(departments)
        designation = random.choice(designations)
        
        # Max duties between 5 and 15
        max_duties = random.randint(5, 15)
        
        faculty = Faculty(
            name=name,
            department=department,
            designation=designation,
            max_duties=max_duties,
            current_duties=0,
            availability="ANY",
            leave_dates="[]"
        )
        db.add(faculty)
    
    db.commit()
    print("Successfully seeded 20 faculty members.")
    db.close()

if __name__ == "__main__":
    seed_faculty()
