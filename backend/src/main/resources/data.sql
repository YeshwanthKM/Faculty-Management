-- Updated Sample Data for Faculty Invigilation System with User Departments

-- Clear existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE allocation;
TRUNCATE TABLE faculty;
TRUNCATE TABLE exam_schedule;
SET FOREIGN_KEY_CHECKS = 1;

-- Seed Faculty
INSERT INTO faculty (name, department, designation, max_duties, current_duties, availability, leave_dates) VALUES
('Dr. Santhanaprabhu', 'CSE', 'Professor', 12, 0, 'ANY', ''),
('Prof. Priya Sharma', 'AIDS', 'Associate Professor', 10, 0, 'ANY', ''),
('Dr. Rajesh Kumar', 'AIML', 'Professor', 10, 0, 'ANY', ''),
('Prof. Sneha Reddy', 'CCE', 'Assistant Professor', 8, 0, 'ANY', ''),
('Dr. Vikram Singh', 'ECE', 'Professor', 12, 0, 'ANY', ''),
('Prof. Ananya Das', 'MECH', 'Associate Professor', 10, 0, 'ANY', ''),
('Dr. Manish Gupta', 'VLSI', 'Professor', 10, 0, 'ANY', ''),
('Prof. Kavita Rao', 'BT', 'Assistant Professor', 8, 0, 'ANY', ''),
('Dr. Arjun Mehta', 'CSBS', 'Professor', 10, 0, 'ANY', ''),
('Dr. S. K. Panda', 'H&S', 'Professor', 10, 0, 'ANY', ''),
('Prof. Meera Nair', 'CSE', 'Assistant Professor', 8, 0, 'ANY', '');

-- Seed Exam Schedules
INSERT INTO exam_schedule (exam_date, session, hall_number, department_conducting, student_count, required_invigilators) VALUES
('2026-05-15', 'FN', 'LH-101', 'CSE', 60, 2),
('2026-05-15', 'FN', 'LH-102', 'AIDS', 40, 1),
('2026-05-15', 'AN', 'LH-201', 'AIML', 120, 4),
('2026-05-16', 'FN', 'LH-401', 'CCE', 30, 1),
('2026-05-16', 'AN', 'LH-301', 'ECE', 90, 3),
('2026-05-17', 'FN', 'LH-501', 'BT', 50, 2);
