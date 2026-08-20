CREATE DATABASE ModernTech_Solutions;
USE ModernTech_Solutions;

-- ==========================================
-- 1. USERS TABLE (for login authentication)
-- ==========================================
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'hr_staff', 'manager', 'employee') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Valid bcrypt hash for 'password123'
INSERT INTO users (username, email, password_hash, first_name, last_name, role)
VALUES 
('hr@moderntech.com', 'hr@moderntech.com', '$2b$10$U/mtiFlJ8.Co8YWGtf/Hg.h00thLkFeV98ZKlf/IraHvkORW4U22C', 'HR', 'Admin', 'hr_staff'),
('sibongile.nkosi@moderntech.com', 'sibongile.nkosi@moderntech.com', '$2b$10$U/mtiFlJ8.Co8YWGtf/Hg.h00thLkFeV98ZKlf/IraHvkORW4U22C', 'Sibongile', 'Nkosi', 'employee'),
('lungile.moyo@moderntech.com', 'lungile.moyo@moderntech.com', '$2b$10$U/mtiFlJ8.Co8YWGtf/Hg.h00thLkFeV98ZKlf/IraHvkORW4U22C', 'Lungile', 'Moyo', 'hr_staff'),
('thabo.molefe@moderntech.com', 'thabo.molefe@moderntech.com', '$2b$10$U/mtiFlJ8.Co8YWGtf/Hg.h00thLkFeV98ZKlf/IraHvkORW4U22C', 'Thabo', 'Molefe', 'employee'),
('keshav.naidoo@moderntech.com', 'keshav.naidoo@moderntech.com', '$2b$10$U/mtiFlJ8.Co8YWGtf/Hg.h00thLkFeV98ZKlf/IraHvkORW4U22C', 'Keshav', 'Naidoo', 'employee'),
('zanele.khumalo@moderntech.com', 'zanele.khumalo@moderntech.com', '$2b$10$U/mtiFlJ8.Co8YWGtf/Hg.h00thLkFeV98ZKlf/IraHvkORW4U22C', 'Zanele', 'Khumalo', 'employee'),
('sipho.zulu@moderntech.com', 'sipho.zulu@moderntech.com', '$2b$10$U/mtiFlJ8.Co8YWGtf/Hg.h00thLkFeV98ZKlf/IraHvkORW4U22C', 'Sipho', 'Zulu', 'employee'),
('naledi.moeketsi@moderntech.com', 'naledi.moeketsi@moderntech.com', '$2b$10$U/mtiFlJ8.Co8YWGtf/Hg.h00thLkFeV98ZKlf/IraHvkORW4U22C', 'Naledi', 'Moeketsi', 'employee'),
('farai.gumbo@moderntech.com', 'farai.gumbo@moderntech.com', '$2b$10$U/mtiFlJ8.Co8YWGtf/Hg.h00thLkFeV98ZKlf/IraHvkORW4U22C', 'Farai', 'Gumbo', 'employee'),
('karabo.dlamini@moderntech.com', 'karabo.dlamini@moderntech.com', '$2b$10$U/mtiFlJ8.Co8YWGtf/Hg.h00thLkFeV98ZKlf/IraHvkORW4U22C', 'Karabo', 'Dlamini', 'employee'),
('fatima.patel@moderntech.com', 'fatima.patel@moderntech.com', '$2b$10$U/mtiFlJ8.Co8YWGtf/Hg.h00thLkFeV98ZKlf/IraHvkORW4U22C', 'Fatima', 'Patel', 'employee');

-- ==========================================
-- 2. EMPLOYEES TABLE
-- ==========================================
CREATE TABLE employees (
    emp_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NULL,
    position VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    hire_date DATE NOT NULL,
    employment_history TEXT NULL, -- FIX: Added column to store employment history
    employment_status ENUM('active', 'on_leave', 'terminated') DEFAULT 'active',
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

INSERT INTO employees (first_name, last_name, email, phone, position, department, hire_date, employment_status)
VALUES 
('Sibongile', 'Nkosi', 'sibongile.nkosi@moderntech.com', '0812345678', 'Software Engineer', 'Development', '2015-03-15', 'active'),
('Lungile', 'Moyo', 'lungile.moyo@moderntech.com', '0823456789', 'HR Manager', 'HR', '2013-06-01', 'active'),
('Thabo', 'Molefe', 'thabo.molefe@moderntech.com', '0834567890', 'Quality Analyst', 'QA', '2018-01-10', 'active'),
('Keshav', 'Naidoo', 'keshav.naidoo@moderntech.com', '0845678901', 'Sales Representative', 'Sales', '2020-03-20', 'active'),
('Zanele', 'Khumalo', 'zanele.khumalo@moderntech.com', '0856789012', 'Marketing Specialist', 'Marketing', '2019-07-15', 'active'),
('Sipho', 'Zulu', 'sipho.zulu@moderntech.com', '0867890123', 'UI/UX Designer', 'Design', '2016-05-01', 'active'),
('Naledi', 'Moeketsi', 'naledi.moeketsi@moderntech.com', '0878901234', 'DevOps Engineer', 'IT', '2017-09-10', 'active'),
('Farai', 'Gumbo', 'farai.gumbo@moderntech.com', '0889012345', 'Content Strategist', 'Marketing', '2021-01-15', 'active'),
('Karabo', 'Dlamini', 'karabo.dlamini@moderntech.com', '0890123456', 'Accountant', 'Finance', '2018-11-01', 'active'),
('Fatima', 'Patel', 'fatima.patel@moderntech.com', '0811234567', 'Customer Support Lead', 'Support', '2016-08-20', 'active');

-- ==========================================
-- 3. PAYROLL TABLE
-- ==========================================
CREATE TABLE payroll (
    payroll_id INT PRIMARY KEY AUTO_INCREMENT,
    emp_id INT NOT NULL,
    base_salary DECIMAL(10,2) NOT NULL,
    hourly_rate DECIMAL(10,2) NULL,
    tax_rate DECIMAL(5,2) DEFAULT 18.00,
    benefits DECIMAL(10,2) DEFAULT 0.00,
    deductions DECIMAL(10,2) DEFAULT 0.00,
    effective_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (emp_id) REFERENCES employees(emp_id) ON DELETE CASCADE
);

INSERT INTO payroll (emp_id, base_salary, hourly_rate, tax_rate, benefits, deductions, effective_date, is_active)
VALUES 
(1, 70000, 350.00, 18.00, 5000.00, 2000.00, '2024-01-01', TRUE),
(2, 80000, 400.00, 20.00, 6000.00, 2500.00, '2024-01-01', TRUE),
(3, 55000, 275.00, 15.00, 4000.00, 1500.00, '2024-01-01', TRUE),
(4, 60000, 300.00, 16.00, 4500.00, 1800.00, '2024-01-01', TRUE),
(5, 58000, 290.00, 16.00, 4300.00, 1700.00, '2024-01-01', TRUE),
(6, 65000, 325.00, 17.00, 4800.00, 1900.00, '2024-01-01', TRUE),
(7, 72000, 360.00, 18.00, 5200.00, 2200.00, '2024-01-01', TRUE),
(8, 56000, 280.00, 15.00, 4100.00, 1600.00, '2024-01-01', TRUE),
(9, 62000, 310.00, 17.00, 4600.00, 1850.00, '2024-01-01', TRUE),
(10, 58000, 290.00, 16.00, 4300.00, 1700.00, '2024-01-01', TRUE);

-- ==========================================
-- 4. PAYSLIPS TABLE
-- ==========================================
CREATE TABLE payslips (
    payslip_id INT PRIMARY KEY AUTO_INCREMENT,
    emp_id INT NOT NULL,
    payroll_id INT NOT NULL,
    payslip_period_start DATE NOT NULL,
    payslip_period_end DATE NOT NULL,
    gross_pay DECIMAL(10,2) NOT NULL,
    basic_salary DECIMAL(10,2) NOT NULL,
    overtime_pay DECIMAL(10,2) DEFAULT 0.00,
    bonus DECIMAL(10,2) DEFAULT 0.00,
    total_deductions DECIMAL(10,2) NOT NULL,
    tax_deducted DECIMAL(10,2) NOT NULL,
    net_pay DECIMAL(10,2) NOT NULL,
    status ENUM('draft', 'finalized', 'paid') DEFAULT 'draft',
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_date DATE NULL,
    FOREIGN KEY (emp_id) REFERENCES employees(emp_id) ON DELETE CASCADE,
    FOREIGN KEY (payroll_id) REFERENCES payroll(payroll_id) ON DELETE RESTRICT
);

INSERT INTO payslips (emp_id, payroll_id, payslip_period_start, payslip_period_end, gross_pay, basic_salary, overtime_pay, bonus, total_deductions, tax_deducted, net_pay, status)
VALUES 
(1, 1, '2026-07-01', '2026-07-31', 69500.00, 70000.00, 0, 0, 12510.00, 12510.00, 56990.00, 'finalized'),
(2, 2, '2026-07-01', '2026-07-31', 79000.00, 80000.00, 0, 0, 15800.00, 15800.00, 63200.00, 'finalized'),
(3, 3, '2026-07-01', '2026-07-31', 54800.00, 55000.00, 0, 0, 8220.00, 8220.00, 46580.00, 'finalized');

-- ==========================================
-- 5. TIMEOFF TABLE
-- ==========================================
CREATE TABLE timeoff (
    timeoff_id INT PRIMARY KEY AUTO_INCREMENT,
    emp_id INT NOT NULL,
    request_date DATETIME NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    timeoff_type ENUM('vacation', 'sick_leave', 'personal', 'unpaid_leave') NOT NULL,
    status ENUM('pending', 'approved', 'denied', 'cancelled') DEFAULT 'pending',
    reason VARCHAR(500) NULL,
    approver_id INT NULL,
    approved_date DATETIME NULL,
    denial_reason VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (emp_id) REFERENCES employees(emp_id) ON DELETE CASCADE,
    FOREIGN KEY (approver_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Using CURDATE() so time off requests are never in the past (preventing auto-deny)
INSERT INTO timeoff (emp_id, request_date, start_date, end_date, timeoff_type, status, reason)
VALUES 
(1, NOW(), CURDATE() + INTERVAL 5 DAY, CURDATE() + INTERVAL 5 DAY, 'sick_leave', 'approved', 'Sick Leave'),
(1, NOW(), CURDATE() + INTERVAL 10 DAY, CURDATE() + INTERVAL 10 DAY, 'personal', 'pending', 'Personal'),
(2, NOW(), CURDATE() + INTERVAL 15 DAY, CURDATE() + INTERVAL 15 DAY, 'personal', 'denied', 'Family Responsibility'),
(2, NOW(), CURDATE() + INTERVAL 20 DAY, CURDATE() + INTERVAL 24 DAY, 'vacation', 'approved', 'Vacation'),
(3, NOW(), CURDATE() + INTERVAL 2 DAY, CURDATE() + INTERVAL 2 DAY, 'sick_leave', 'approved', 'Medical Appointment'),
(3, NOW(), CURDATE() + INTERVAL 7 DAY, CURDATE() + INTERVAL 7 DAY, 'personal', 'pending', 'Personal'),
(4, NOW(), CURDATE() + INTERVAL 1 DAY, CURDATE() + INTERVAL 3 DAY, 'unpaid_leave', 'approved', 'Bereavement'),
(5, NOW(), CURDATE() + INTERVAL 8 DAY, CURDATE() + INTERVAL 8 DAY, 'personal', 'pending', 'Childcare');

-- ==========================================
-- 6. ATTENDANCE TABLE
-- ==========================================
CREATE TABLE attendance (
    attendance_id INT PRIMARY KEY AUTO_INCREMENT,
    emp_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('present', 'absent', 'late', 'half_day', 'on_leave') NOT NULL,
    check_in_time TIME NULL,
    check_out_time TIME NULL,
    hours_worked DECIMAL(5,2) NULL,
    notes VARCHAR(500) NULL,
    recorded_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (emp_id) REFERENCES employees(emp_id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(user_id) ON DELETE SET NULL,
    UNIQUE KEY unique_emp_date (emp_id, attendance_date)
);

-- Dynamically generate 14 days of history for all employees so the charts always look good
INSERT INTO attendance (emp_id, attendance_date, status, check_in_time, check_out_time, hours_worked, recorded_by, created_at, updated_at)
SELECT 
    e.emp_id, 
    DATE_SUB(CURDATE(), INTERVAL n.num DAY) AS attendance_date,
    CASE 
        WHEN RAND() < 0.75 THEN 'present'
        WHEN RAND() < 0.50 THEN 'absent'
        ELSE 'on_leave'
    END AS status,
    '08:00:00', '17:00:00', 8.0, 1, NOW(), NOW()
FROM employees e
CROSS JOIN (
    SELECT 0 AS num UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 
    UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 
    UNION SELECT 10 UNION SELECT 11 UNION SELECT 12 UNION SELECT 13
) n
WHERE e.is_deleted = FALSE;

-- Nullify check in/out for absent/on_leave (Subquery bypasses Safe Update Mode)
UPDATE attendance 
SET check_in_time = NULL, check_out_time = NULL, hours_worked = 0 
WHERE attendance_id IN (
    SELECT attendance_id FROM (
        SELECT attendance_id FROM attendance WHERE status IN ('absent', 'on_leave')
    ) AS temp
);

-- ==========================================
-- 7. PERFORMANCE REVIEWS TABLE
-- ==========================================
CREATE TABLE performance_reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    emp_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    review_date DATE NOT NULL,
    review_period_start DATE NOT NULL,
    review_period_end DATE NOT NULL,
    rating ENUM('poor', 'below_average', 'average', 'good', 'excellent') NOT NULL,
    performance_score DECIMAL(3,2) NULL,
    strengths TEXT NULL,
    areas_for_improvement TEXT NULL,
    goals_for_next_period TEXT NULL,
    comments TEXT NULL,
    status ENUM('draft', 'submitted', 'reviewed') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (emp_id) REFERENCES employees(emp_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(user_id) ON DELETE RESTRICT
);

INSERT INTO performance_reviews (emp_id, reviewer_id, review_date, review_period_start, review_period_end, rating, performance_score, strengths, areas_for_improvement, comments, status)
VALUES 
(5, 2, '2026-05-26', '2026-02-01', '2026-05-26', 'good', 4.0, 'Great performance in Q2 campaigns. Shows strong leadership and initiative.', 'Could improve documentation', 'Excellent performance', 'submitted'),
(1, 2, '2026-05-26', '2026-02-01', '2026-05-26', 'good', 4.0, 'Consistent code quality. Meets deadlines reliably. Good team player.', 'Needs to mentor juniors more', 'Reliable developer', 'submitted'),
(9, 2, '2026-05-26', '2026-02-01', '2026-05-26', 'good', 4.0, 'Excellent attention to detail. Handles financial reporting accurately.', 'Could be more proactive', 'Strong performer', 'submitted'),
(10, 2, '2026-05-26', '2026-02-01', '2026-05-26', 'good', 4.0, 'Great customer satisfaction scores. Resolves tickets efficiently.', 'None', 'Great work', 'submitted');