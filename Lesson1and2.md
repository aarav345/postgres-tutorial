# PostgreSQL Database Design Course - Lessons 1 & 2

## 📚 Course Overview
This is a comprehensive PostgreSQL learning path from basic to advanced professional usage, covering theoretical concepts and practical applications.

---

## 📖 Lesson 1: Database Fundamentals & PostgreSQL Setup

### Learning Objectives
By the end of this lesson, you will:
- ✅ Understand what databases and DBMS are
- ✅ Know the difference between relational and non-relational databases
- ✅ Understand PostgreSQL architecture
- ✅ Install and configure PostgreSQL
- ✅ Connect using psql and pgAdmin
- ✅ Create your first database and table

### Topics Covered

#### 1. Database Fundamentals
- What is a database?
- What is a DBMS (Database Management System)?
- ACID properties and data consistency

#### 2. Relational vs Non-Relational Databases
**Relational (SQL):**
- Data stored in tables with rows and columns
- Strong relationships between tables
- Examples: PostgreSQL, MySQL, Oracle

**Non-Relational (NoSQL):**
- Flexible data structures (documents, key-value, graphs)
- Optimized for specific use cases
- Examples: MongoDB, Redis, Cassandra

**When to use PostgreSQL:**
- Structured, related data
- Data integrity is critical
- Complex queries and reporting needed
- ACID compliance required

#### 3. PostgreSQL Architecture
```
Client Application (psql, pgAdmin, your app)
         ↓
PostgreSQL Server
  ├── Query Processor (Parser, Planner, Executor)
  └── Storage Engine (Buffer Manager, WAL)
         ↓
Physical Storage (Data files on disk)
```

**Key Components:**
- **Database Cluster**: Collection of databases
- **Database**: Contains schemas
- **Schema**: Namespace for tables, views, functions
- **Table**: Where data is stored

#### 4. Installation

**Docker (Recommended):**
```bash
docker run --name postgres-learn \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_USER=myuser \
  -e POSTGRES_DB=learning_db \
  -p 5432:5432 \
  -d postgres:16
```

**macOS (Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Verify Installation:**
```bash
psql --version
```

#### 5. Connecting to PostgreSQL

**Using psql:**
```bash
psql -U myuser -d learning_db
```

**Essential psql Commands:**
```sql
\l              -- List all databases
\c database_name -- Connect to a database
\dt             -- List all tables
\d table_name   -- Describe table structure
\du             -- List all users/roles
\q              -- Quit psql
\h              -- SQL command help
\?              -- psql command help
```

**Using pgAdmin:**
- Download from pgadmin.org
- Create server connection with your credentials
- Navigate through GUI: Servers → Database → Schemas → Tables

#### 6. Your First Database

```sql
-- Create database
CREATE DATABASE my_first_db;

-- Connect to it
\c my_first_db

-- Create a simple table
CREATE TABLE users (
    id INTEGER,
    username TEXT,
    email TEXT,
    created_at DATE
);

-- Insert data
INSERT INTO users (id, username, email, created_at)
VALUES (1, 'john_doe', 'john@example.com', '2024-01-15');

-- Query data
SELECT * FROM users;
```

---

## 📖 Lesson 2: SQL Basics - Data Definition Language (DDL)

### Learning Objectives
By the end of this lesson, you will:
- ✅ Understand PostgreSQL data types
- ✅ Create tables with appropriate data types
- ✅ Apply constraints for data integrity
- ✅ Modify existing table structures
- ✅ Implement primary and foreign keys
- ✅ Use auto-incrementing IDs

### Topics Covered

#### 1. PostgreSQL Data Types

**Numeric Types:**
```sql
SMALLINT        -- -32,768 to 32,767
INTEGER         -- -2 billion to 2 billion
BIGINT          -- Very large numbers
DECIMAL(10,2)   -- Exact precision (10 digits, 2 decimal)
NUMERIC(10,2)   -- Same as DECIMAL
REAL            -- Floating point (6 decimal precision)
DOUBLE PRECISION -- Floating point (15 decimal precision)
SERIAL          -- Auto-incrementing INTEGER
BIGSERIAL       -- Auto-incrementing BIGINT
```

**Character/Text Types:**
```sql
CHAR(n)         -- Fixed length (padded)
VARCHAR(n)      -- Variable length (up to n)
TEXT            -- Unlimited length (recommended)
```

**Date and Time Types:**
```sql
DATE            -- Date only: 2024-01-15
TIME            -- Time only: 14:30:00
TIMESTAMP       -- Date and time: 2024-01-15 14:30:00
TIMESTAMPTZ     -- Timestamp with timezone (recommended)
INTERVAL        -- Duration: 2 days, 3 hours
```

**Other Important Types:**
```sql
BOOLEAN         -- TRUE/FALSE
JSON            -- JSON as text
JSONB           -- Binary JSON (faster, preferred)
INTEGER[]       -- Array of integers
TEXT[]          -- Array of text
UUID            -- Universally unique identifier
```

#### 2. CREATE TABLE

**Basic Syntax:**
```sql
CREATE TABLE table_name (
    column_name data_type constraints,
    column_name data_type constraints
);
```

**Example:**
```sql
CREATE TABLE employees (
    employee_id SERIAL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email TEXT,
    hire_date DATE,
    salary DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    department_id INTEGER
);
```

#### 3. Constraints

**NOT NULL** - Column cannot be empty:
```sql
CREATE TABLE customers (
    customer_id SERIAL,
    email TEXT NOT NULL,  -- Required
    phone TEXT            -- Optional
);
```

**PRIMARY KEY** - Unique identifier for each row:
```sql
CREATE TABLE students (
    student_id SERIAL PRIMARY KEY,
    student_email TEXT,
    full_name TEXT
);
```

**Composite Primary Key:**
```sql
CREATE TABLE course_enrollments (
    student_id INTEGER,
    course_id INTEGER,
    enrollment_date DATE,
    PRIMARY KEY (student_id, course_id)
);
```

**UNIQUE** - All values must be different:
```sql
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username TEXT UNIQUE,
    email TEXT UNIQUE
);
```

**CHECK** - Validates data against conditions:
```sql
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    product_name TEXT NOT NULL,
    price DECIMAL(10,2) CHECK (price > 0),
    stock_quantity INTEGER CHECK (stock_quantity >= 0),
    discount_percent INTEGER CHECK (discount_percent BETWEEN 0 AND 100)
);
```

**FOREIGN KEY** - Links tables together:
```sql
-- Parent table
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    department_name TEXT NOT NULL
);

-- Child table
CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    employee_name TEXT NOT NULL,
    department_id INTEGER,
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);
```

**DEFAULT** - Automatic values:
```sql
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    order_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending',
    total_amount DECIMAL(10,2) DEFAULT 0.00
);
```

#### 4. Auto-Incrementing IDs

**SERIAL (Legacy but common):**
```sql
CREATE TABLE posts (
    post_id SERIAL PRIMARY KEY,
    title TEXT
);
```

**IDENTITY (Modern SQL standard):**
```sql
CREATE TABLE posts (
    post_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title TEXT
);

-- With custom options
CREATE TABLE posts (
    post_id INTEGER GENERATED ALWAYS AS IDENTITY 
        (START WITH 1000 INCREMENT BY 1) PRIMARY KEY,
    title TEXT
);
```

**ALWAYS vs BY DEFAULT:**
- `GENERATED ALWAYS`: Cannot manually insert ID
- `GENERATED BY DEFAULT`: Can override if needed

#### 5. ALTER TABLE

**Add Column:**
```sql
ALTER TABLE employees
ADD COLUMN phone_number TEXT;

ALTER TABLE employees
ADD COLUMN birth_date DATE NOT NULL DEFAULT '1990-01-01';
```

**Drop Column:**
```sql
ALTER TABLE employees
DROP COLUMN phone_number;
```

**Modify Column:**
```sql
-- Change data type
ALTER TABLE employees
ALTER COLUMN salary TYPE NUMERIC(12,2);

-- Set NOT NULL
ALTER TABLE employees
ALTER COLUMN email SET NOT NULL;

-- Remove NOT NULL
ALTER TABLE employees
ALTER COLUMN email DROP NOT NULL;

-- Change default
ALTER TABLE employees
ALTER COLUMN is_active SET DEFAULT TRUE;
```

**Add/Drop Constraints:**
```sql
-- Add constraint
ALTER TABLE employees
ADD CONSTRAINT unique_email UNIQUE (email);

ALTER TABLE employees
ADD CONSTRAINT check_salary CHECK (salary > 0);

-- Drop constraint
ALTER TABLE employees
DROP CONSTRAINT unique_email;
```

**Rename:**
```sql
-- Rename table
ALTER TABLE employees RENAME TO staff;

-- Rename column
ALTER TABLE staff
RENAME COLUMN employee_name TO full_name;
```

#### 6. DROP TABLE

```sql
-- Delete table
DROP TABLE employees;

-- Delete only if exists
DROP TABLE IF EXISTS employees;

-- Delete with dependencies
DROP TABLE employees CASCADE;
```

---

## 🛠️ Practical Example: Blog System

Complete blog database schema:

```sql
-- 1. Users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- 2. Categories table
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- 3. Posts table
CREATE TABLE posts (
    post_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    category_id INTEGER,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    view_count INTEGER DEFAULT 0 CHECK (view_count >= 0),
    is_published BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- 4. Comments table
CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_approved BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (post_id) REFERENCES posts(post_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Insert sample data
INSERT INTO users (username, email, password_hash)
VALUES 
    ('alice', 'alice@example.com', 'hash123'),
    ('bob', 'bob@example.com', 'hash456');

INSERT INTO categories (category_name, description)
VALUES 
    ('Technology', 'Tech related posts'),
    ('Travel', 'Travel experiences');

INSERT INTO posts (user_id, category_id, title, content, slug, is_published)
VALUES 
    (1, 1, 'Getting Started with PostgreSQL', 'Content here...', 'getting-started-postgresql', TRUE),
    (2, 2, 'My Trip to Nepal', 'Amazing journey...', 'my-trip-nepal', TRUE);

INSERT INTO comments (post_id, user_id, content, is_approved)
VALUES 
    (1, 2, 'Great tutorial!', TRUE),
    (2, 1, 'Sounds amazing!', TRUE);
```

---

## 💪 Practice Exercises

### Exercise 1: Create an E-commerce Schema
Create tables for:
1. **Customers** (id, name, email, phone, registration_date)
2. **Products** (id, name, description, price, stock)
3. **Orders** (id, customer_id, order_date, status, total)

**Requirements:**
- Use appropriate data types
- Add primary keys to all tables
- Add foreign keys to link orders with customers

### Exercise 2: Constraints Practice
Enhance your e-commerce schema:
- Price must be positive
- Email must be unique
- Stock cannot be negative
- Order status must be one of: 'pending', 'shipped', 'delivered'
- Customer email is required

### Exercise 3: Modify Tables
Practice ALTER TABLE:
- Add a `discount_percent` column to Products
- Make customer phone required
- Rename Orders table to CustomerOrders
- Add a CHECK constraint to ensure discount is between 0 and 100

### Exercise 4: Build a Library System
Create a complete schema for:
- **Books** (id, title, isbn, publication_year, available_copies)
- **Members** (id, name, email, membership_date)
- **Loans** (id, book_id, member_id, loan_date, return_date, returned)

**Challenge:** Ensure a book can only be loaned if available_copies > 0

---

## 🎯 Key Takeaways

### Lesson 1:
- ✅ Databases organize data in structured, efficient ways
- ✅ PostgreSQL is a powerful, open-source relational DBMS
- ✅ Use psql for CLI or pgAdmin for GUI management
- ✅ Basic operations: CREATE DATABASE, CREATE TABLE, INSERT, SELECT

### Lesson 2:
- ✅ Choose appropriate data types for efficiency and correctness
- ✅ Constraints enforce data integrity automatically
- ✅ PRIMARY KEY uniquely identifies each row
- ✅ FOREIGN KEY maintains relationships between tables
- ✅ ALTER TABLE allows modifying existing structures
- ✅ Plan your schema carefully before implementation

---

## 📚 Additional Resources

**Official Documentation:**
- [PostgreSQL Official Docs](https://www.postgresql.org/docs/)
- [PostgreSQL Data Types](https://www.postgresql.org/docs/current/datatype.html)
- [PostgreSQL Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)

**Recommended Tools:**
- **psql**: Command-line interface (included with PostgreSQL)
- **pgAdmin**: Free GUI for PostgreSQL management
- **DBeaver**: Universal database tool with PostgreSQL support
- **DataGrip**: Premium IDE for databases

**Practice Platforms:**
- [PostgreSQL Exercises](https://pgexercises.com/)
- [SQLBolt](https://sqlbolt.com/)
- [HackerRank SQL](https://www.hackerrank.com/domains/sql)

---

## 🚀 Next Steps

After mastering Lessons 1 & 2, you'll be ready for:

**Lesson 3: SQL Basics - Data Manipulation Language (DML)**
- Advanced INSERT techniques
- Complex SELECT queries with WHERE, ORDER BY, LIMIT
- UPDATE and DELETE operations
- Pattern matching and NULL handling
- Aggregate functions

**What to Practice Before Moving On:**
1. Create at least 3 different database schemas
2. Practice all constraint types
3. Experiment with different data types
4. Get comfortable with ALTER TABLE operations
5. Try breaking constraints to understand error messages

---

## 🤝 Getting Help

**Common Issues:**

**Connection errors:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list                # macOS

# Check port availability
lsof -i :5432
```

**Permission denied:**
```sql
-- Grant necessary privileges
GRANT ALL PRIVILEGES ON DATABASE my_db TO myuser;
```

**Constraint violations:**
- Read error messages carefully - they tell you which constraint failed
- Use `\d table_name` to check existing constraints
- Test constraints with intentionally bad data

---

## 📝 Notes

- Always use `TEXT` instead of `VARCHAR` in PostgreSQL unless you specifically need length validation
- Prefer `TIMESTAMPTZ` over `TIMESTAMP` for timezone-aware applications
- Use `SERIAL` or `IDENTITY` for auto-incrementing primary keys
- Foreign keys are essential for maintaining data integrity
- Plan your schema on paper before writing SQL
- Use meaningful, consistent naming conventions

---

## ✅ Completion Checklist

- [ ] Installed PostgreSQL successfully
- [ ] Connected using both psql and pgAdmin
- [ ] Created first database and table
- [ ] Understand all major data types
- [ ] Can create tables with multiple constraints
- [ ] Successfully implemented primary and foreign keys
- [ ] Comfortable with ALTER TABLE operations
- [ ] Completed all practice exercises
- [ ] Built the blog system example
- [ ] Ready for Lesson 3!

---

**Course Progress:** 2/30 lessons completed (6.7%)

**Estimated Time:** Lesson 1 (2-3 hours) + Lesson 2 (3-4 hours) = 5-7 hours total

**Happy Learning! 🎉**