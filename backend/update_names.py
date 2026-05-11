import sqlite3
import random
import os

def update_names():
    db_path = 'backend/faculty_invigilation.db'
    if not os.path.exists(db_path):
        db_path = 'faculty_invigilation.db'
        
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    first_names = ["Arjun", "Lakshmi", "Venkatesh", "Priya", "Karthik", "Sneha", "Rahul", "Meena", "Suresh", "Vidya", 
                   "Ganesh", "Deepa", "Hari", "Anitha", "Vijay", "Keerthi", "Madhav", "Sindhu", "Rajesh", "Kavitha",
                   "Manoj", "Divya", "Srinivas", "Ramya", "Bhaskar", "Pallavi", "Naveen", "Swathi"]
    last_names = ["Rao", "Reddy", "Iyer", "Nair", "Shetty", "Pillai", "Choudary", "Varma", "Kumar", "Murthy",
                  "Menon", "Naidu", "Bhat", "Goud", "Prasad", "Sarma", "Swamy", "Acharya", "Mani", "Dhar"]
    
    cursor.execute("SELECT id FROM faculty")
    faculty_ids = cursor.fetchall()
    
    for (fid,) in faculty_ids:
        new_name = f"{random.choice(first_names)} {random.choice(last_names)}"
        cursor.execute("UPDATE faculty SET name = ? WHERE id = ?", (new_name, fid))
    
    conn.commit()
    conn.close()
    print("Successfully updated faculty names to South Indian names.")

if __name__ == "__main__":
    update_names()
