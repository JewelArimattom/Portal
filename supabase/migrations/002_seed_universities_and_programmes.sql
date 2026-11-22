-- ============================================================
-- UniMatch Seed Migration: 002_seed_universities_and_programmes.sql
-- Description: Comprehensive real university and course dataset for Germany & Austria
-- ============================================================

-- 1. Insert Subject Categories (Ensure they exist)
INSERT INTO subject_categories (id, name, parent_category, description)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Mathematics', NULL, 'Foundational and advanced mathematics courses'),
  ('c0000000-0000-0000-0000-000000000002', 'Computer Science', NULL, 'Core theoretical and practical computing subjects'),
  ('c0000000-0000-0000-0000-000000000003', 'Artificial Intelligence and Data Science', NULL, 'Machine learning, statistics, data analytics'),
  ('c0000000-0000-0000-0000-000000000004', 'Engineering', NULL, 'Mechanical, electrical, structural engineering'),
  ('c0000000-0000-0000-0000-000000000005', 'Business', NULL, 'Management, economics, business analytics')
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Real Universities
INSERT INTO universities (id, name, country, city, institution_type, official_website, admissions_website, is_public, is_demo)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Technical University of Munich (TUM)', 'Germany', 'Munich', 'public', 'https://www.tum.de', 'https://www.tum.de/en/studies/application', TRUE, FALSE),
  ('a0000000-0000-0000-0000-000000000002', 'RWTH Aachen University', 'Germany', 'Aachen', 'public', 'https://www.rwth-aachen.de', 'https://www.rwth-aachen.de/go/id/a/lidx/1', TRUE, FALSE),
  ('a0000000-0000-0000-0000-000000000003', 'Technical University of Berlin (TU Berlin)', 'Germany', 'Berlin', 'public', 'https://www.tu.berlin', 'https://www.tu.berlin/en/studying/applying-and-enrolling', TRUE, FALSE),
  ('a0000000-0000-0000-0000-000000000004', 'Heidelberg University', 'Germany', 'Heidelberg', 'public', 'https://www.uni-heidelberg.de', 'https://www.uni-heidelberg.de/en/study/application-enrolment', TRUE, FALSE),
  ('a0000000-0000-0000-0000-000000000005', 'University of Stuttgart', 'Germany', 'Stuttgart', 'public', 'https://www.uni-stuttgart.de', 'https://www.uni-stuttgart.de/en/study/application', TRUE, FALSE),
  ('a0000000-0000-0000-0000-000000000006', 'Karlsruhe Institute of Technology (KIT)', 'Germany', 'Karlsruhe', 'public', 'https://www.kit.edu', 'https://www.sle.kit.edu/english/vorstudium/application.php', TRUE, FALSE),
  ('a0000000-0000-0000-0000-000000000007', 'Technical University of Darmstadt (TU Darmstadt)', 'Germany', 'Darmstadt', 'public', 'https://www.tu-darmstadt.de', 'https://www.tu-darmstadt.de/studieren/bewerben/index.en.jsp', TRUE, FALSE),
  ('a0000000-0000-0000-0000-000000000008', 'University of Vienna (Universität Wien)', 'Austria', 'Vienna', 'public', 'https://www.univie.ac.at', 'https://studieren.univie.ac.at/en/admission', TRUE, FALSE),
  ('a0000000-0000-0000-0000-000000000009', 'Vienna University of Technology (TU Wien)', 'Austria', 'Vienna', 'public', 'https://www.tuwien.at', 'https://www.tuwien.at/en/studies/admission', TRUE, FALSE),
  ('a0000000-0000-0000-0000-000000000010', 'Graz University of Technology (TU Graz)', 'Austria', 'Graz', 'public', 'https://www.tugraz.at', 'https://www.tugraz.at/en/studying-and-teaching/studying-at-tu-graz', TRUE, FALSE),
  ('a0000000-0000-0000-0000-000000000011', 'Vienna University of Economics and Business (WU Wien)', 'Austria', 'Vienna', 'public', 'https://www.wu.ac.at', 'https://www.wu.ac.at/en/programs/application-and-admission', TRUE, FALSE),
  ('a0000000-0000-0000-0000-000000000012', 'Johannes Kepler University Linz (JKU)', 'Austria', 'Linz', 'public', 'https://www.jku.at', 'https://www.jku.at/en/degree-programs/admissions', TRUE, FALSE)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Diverse Degree Programmes across Germany & Austria
INSERT INTO programmes (id, university_id, name, degree_level, subject_area, specialization, description, teaching_language, duration_semesters, tuition_fee_per_semester, semester_contribution, application_fee, estimated_living_cost_monthly, official_programme_url, official_application_url, application_method, status, is_demo)
VALUES
  -- 1. TUM Informatics
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'M.Sc. Informatics (Computer Science)', 'master', 'Computer Science', 'Software & Distributed Systems', 'Research-oriented Master covering algorithms, distributed systems, AI, and computer architecture.', 'english', 4, NULL, 152.00, 0, 1050, 'https://www.cit.tum.de/en/cit/studies/degree-programs/master-informatics/', 'https://campus.tum.de', 'direct', 'published', FALSE),
  
  -- 2. TUM Data Engineering
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'M.Sc. Data Engineering and Analytics', 'master', 'Data Science & AI', 'Big Data, Cloud Analytics & Machine Learning', 'Interdisciplinary programme combining large-scale data engineering, distributed systems, machine learning, and statistical modeling.', 'english', 4, NULL, 152.00, 0, 1050, 'https://www.cit.tum.de/en/cit/studies/degree-programs/master-data-engineering-analytics/', 'https://campus.tum.de', 'direct', 'published', FALSE),

  -- 3. TUM Bachelor Information Engineering
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'B.Sc. Information Engineering', 'bachelor', 'Computer Science', 'Software, Hardware & Cyber-Physical Systems', 'Fully English-taught undergraduate degree programme at TUM Campus Heilbronn covering IT, electronics, software engineering, and business informatics.', 'english', 6, NULL, 102.00, 0, 890, 'https://www.cit.tum.de/en/cit/studies/degree-programs/bachelor-information-engineering/', 'https://campus.tum.de', 'direct', 'published', FALSE),

  -- 4. RWTH Aachen Data Science
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'M.Sc. Data Science', 'master', 'Data Science & AI', 'Big Data, Machine Learning & Mathematical Foundations', 'Rigorous engineering and mathematical curriculum focused on machine learning algorithms and high-dimensional statistics.', 'english', 4, NULL, 318.00, 0, 880, 'https://www.rwth-aachen.de/go/id/msc-data-science', 'https://online.rwth-aachen.de', 'direct', 'published', FALSE),

  -- 5. RWTH Aachen Automotive Engineering
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'M.Sc. Automotive Engineering', 'master', 'Engineering', 'Chassis, Autonomous Driving, Powertrains & Dynamics', 'World-renowned automotive engineering Master programme focusing on vehicle dynamics, electric powertrains, automated driving, and structural design.', 'english', 4, NULL, 318.00, 0, 880, 'https://www.rwth-aachen.de/go/id/msc-automotive', 'https://online.rwth-aachen.de', 'direct', 'published', FALSE),

  -- 6. TU Berlin Computer Science
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', 'M.Sc. Computer Science (Informatik)', 'master', 'Computer Science', 'Distributed Systems, Networks & Theory', 'Comprehensive graduate programme in Berlin covering theoretical computer science, networks, and distributed systems.', 'english', 4, NULL, 308.00, 75.00, 980, 'https://www.tu.berlin/en/studying/degree-programs/master/computer-science', 'https://www.uni-assist.de', 'uni_assist', 'published', FALSE),

  -- 7. TU Berlin Electrical Engineering
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000003', 'M.Sc. Electrical Systems Engineering', 'master', 'Engineering', 'Signal Processing, Automation, Power & Smart Grids', 'Advanced engineering programme covering power systems, renewable energy integration, and signal processing.', 'english', 4, NULL, 308.00, 75.00, 980, 'https://www.tu.berlin/en/studying/degree-programs/master/electrical-engineering', 'https://www.uni-assist.de', 'uni_assist', 'published', FALSE),

  -- 8. Heidelberg Scientific Computing
  ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000004', 'M.Sc. Scientific Computing', 'master', 'Computer Science', 'High Performance Computing & Numerical Modeling', 'Focuses on computational modeling, numerical simulation, and high-performance computing in Heidelberg.', 'english', 4, 1500.00, 171.80, 0, 920, 'https://www.uni-heidelberg.de/en/study/all-subjects/scientific-computing', 'https://hei-co.uni-heidelberg.de', 'direct', 'published', FALSE),

  -- 9. Heidelberg Biomedical Engineering
  ('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000004', 'M.Sc. Biomedical Engineering', 'master', 'Engineering', 'Medical Imaging, Biosensors & Biomechanics', 'Joint research programme with the German Cancer Research Center (DKFZ) focusing on medical physics and diagnostic imaging.', 'english', 4, 1500.00, 171.80, 0, 920, 'https://www.uni-heidelberg.de/en/study/all-subjects/biomedical-engineering', 'https://hei-co.uni-heidelberg.de', 'direct', 'published', FALSE),

  -- 10. University of Stuttgart COMMAS
  ('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000005', 'M.Sc. Computational Mechanics of Materials and Structures (COMMAS)', 'master', 'Engineering', 'Finite Element Analysis, Structural Mechanics & Continuum Physics', 'Prestigious international English-taught Master programme focused on computational engineering and continuum mechanics.', 'english', 4, 1500.00, 200.00, 0, 930, 'https://www.commas.uni-stuttgart.de', 'https://campus.uni-stuttgart.de', 'direct', 'published', FALSE),

  -- 11. KIT Carl Benz School Mechanical Engineering (Bachelor)
  ('b0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000006', 'B.Sc. Mechanical Engineering (International)', 'bachelor', 'Engineering', 'Automotive, Energy & Production Engineering', 'Fully English-taught undergraduate degree in mechanical engineering through the Carl Benz School of Engineering at KIT, Germany.', 'english', 6, 1500.00, 180.00, 0, 900, 'https://www.carlbenzschool.kit.edu', 'https://campus.kit.edu', 'direct', 'published', FALSE),

  -- 12. TU Darmstadt AI & Machine Learning
  ('b0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000007', 'M.Sc. Artificial Intelligence and Machine Learning', 'master', 'Data Science & AI', 'Deep Learning, Robotics, Cognitive AI & NLP', 'Leading European AI research programme at the Hessian Center for Artificial Intelligence (hessian.AI) in Darmstadt.', 'english', 4, NULL, 310.00, 75.00, 900, 'https://www.informatik.tu-darmstadt.de/study/master/ai_ml', 'https://www.uni-assist.de', 'uni_assist', 'published', FALSE),

  -- 13. University of Vienna Computer Science
  ('b0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000008', 'M.Sc. Computer Science', 'master', 'Computer Science', 'Scientific Computing, Algorithms & Multimedia', 'Renowned Austrian graduate programme covering algorithms, data science, visual computing, and cryptography in Vienna.', 'english', 4, 726.72, 22.70, 0, 950, 'https://studieren.univie.ac.at/en/degree-programmes/master-programmes/computer-science-master/', 'https://uspace.univie.ac.at', 'direct', 'published', FALSE),

  -- 14. University of Vienna Data Science
  ('b0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000008', 'M.Sc. Data Science', 'master', 'Data Science & AI', 'Statistical Inference, Machine Learning & Ethical AI', 'Interdisciplinary Master programme offered jointly by Computer Science, Mathematics, Business, and Social Sciences.', 'english', 4, 726.72, 22.70, 0, 950, 'https://studieren.univie.ac.at/en/degree-programmes/master-programmes/data-science-master/', 'https://uspace.univie.ac.at', 'direct', 'published', FALSE),

  -- 15. TU Wien Software Engineering
  ('b0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000009', 'M.Sc. Software Engineering & Internet Computing', 'master', 'Computer Science', 'Cloud Architectures & Distributed Services', 'Premier Austrian software engineering programme in Vienna emphasizing distributed systems, architectures, and web services.', 'english', 4, 726.72, 22.70, 0, 960, 'https://www.tuwien.at/en/studies/studies/master-programmes/software-engineering-and-internet-computing', 'https://tiss.tuwien.ac.at', 'direct', 'published', FALSE),

  -- 16. TU Graz Computer Science
  ('b0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000010', 'M.Sc. Computer Science', 'master', 'Computer Science', 'Information Security, Intelligent Systems & Vision', 'Renowned Austrian technical university in Graz offering cutting-edge specializations in cybersecurity and robotics.', 'english', 4, 726.72, 22.70, 0, 840, 'https://www.tugraz.at/en/studying-and-teaching/degree-programmes/master-programmes/computer-science', 'https://online.tugraz.at', 'direct', 'published', FALSE),

  -- 17. WU Vienna Business Analytics
  ('b0000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000011', 'M.Sc. Business Analytics', 'master', 'Business & Economics', 'Financial Analytics, Predictive Modeling & Business Intelligence', 'Europe’s leading triple-accredited business school (EQUIS, AACSB, AMBA) in Vienna blending quantitative analytics and strategy.', 'english', 4, 726.72, 22.70, 0, 960, 'https://www.wu.ac.at/en/programs/masters-programs/business-analytics', 'https://www.wu.ac.at/application', 'direct', 'published', FALSE),

  -- 18. WU Vienna Bachelor in Business and Economics (BBE)
  ('b0000000-0000-0000-0000-000000000018', 'a0000000-0000-0000-0000-000000000011', 'B.Sc. Business and Economics (BBE)', 'bachelor', 'Business & Economics', 'International Business, Economics, Finance & Management', 'Renowned 3-year English-taught undergraduate degree programme in Vienna offering global perspective on economics and management.', 'english', 6, 726.72, 22.70, 0, 960, 'https://www.wu.ac.at/en/programs/bachelors-programs/business-and-economics', 'https://www.wu.ac.at/application', 'direct', 'published', FALSE),

  -- 19. JKU Linz Artificial Intelligence
  ('b0000000-0000-0000-0000-000000000019', 'a0000000-0000-0000-0000-000000000012', 'M.Sc. Artificial Intelligence', 'master', 'Data Science & AI', 'Deep Learning, LSTM Lab, Robotics & Reasoning', 'Pioneering AI programme headed by the inventors of LSTM / Modern Hopfield networks in Linz, Austria.', 'english', 4, 726.72, 22.70, 0, 850, 'https://www.jku.at/en/degree-programs/types-of-degree-programs/master-degree-programs/ma-artificial-intelligence/', 'https://myjku.jku.at', 'direct', 'published', FALSE)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Programme Intakes (Upcoming application cycles)
INSERT INTO programme_intakes (programme_id, intake_name, academic_year, application_deadline, international_deadline, status)
SELECT 
  p.id, 
  'Winter 2026/2027', 
  '2026/27', 
  '2027-05-31'::date, 
  '2027-05-31'::date, 
  'open'::intake_status
FROM programmes p
ON CONFLICT DO NOTHING;

-- 5. Insert Core Admission Requirements for Programmes
INSERT INTO programme_requirements (programme_id, requirement_type, requirement_description, is_mandatory, operator, required_value, required_value_numeric, unit, subject_category_id, min_credits, credit_system_required)
SELECT
  p.id,
  'degree',
  CASE 
    WHEN p.degree_level = 'bachelor' THEN 'Higher Secondary School Certificate (Class 12) or equivalent HZB'
    ELSE 'Bachelor degree in relevant or related discipline'
  END,
  TRUE,
  'contains'::requirement_operator,
  CASE 
    WHEN p.degree_level = 'bachelor' THEN 'Class'
    WHEN p.subject_area = 'Engineering' THEN 'Engineering'
    ELSE 'Computer'
  END,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL
FROM programmes p
ON CONFLICT DO NOTHING;

-- Insert Language Requirement (IELTS 6.5) for all programmes
INSERT INTO programme_requirements (programme_id, requirement_type, requirement_description, is_mandatory, operator, required_value, required_value_numeric, unit)
SELECT
  p.id,
  'language',
  'English proficiency IELTS 6.5 or equivalent TOEFL',
  TRUE,
  'gte'::requirement_operator,
  '6.5',
  6.5,
  'ielts'
FROM programmes p
ON CONFLICT DO NOTHING;

-- Insert Mathematics Credit Requirement for Master Programmes
INSERT INTO programme_requirements (programme_id, requirement_type, requirement_description, is_mandatory, operator, required_value, required_value_numeric, unit, min_credits, credit_system_required)
SELECT
  p.id,
  'subject_credits',
  'At least 14 credits in Higher Mathematics, Linear Algebra, or Statistics',
  TRUE,
  'gte'::requirement_operator,
  '14',
  14.0,
  'credits',
  14.0,
  'indian_credits'::credit_system
FROM programmes p
WHERE p.degree_level = 'master'
ON CONFLICT DO NOTHING;
