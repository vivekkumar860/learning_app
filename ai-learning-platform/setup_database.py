#!/usr/bin/env python3
"""
Script to set up database tables for the AI Learning Platform
"""
import os
import psycopg2
from psycopg2 import sql
import sys

# Database connection with your credentials
# Password contains @ so we need to URL encode it: @ becomes %40
DATABASE_URL = "postgresql://postgres:matapitaji%408991@db.zqhgpyagxlrpgjblxooc.supabase.co:5432/postgres"

def run_migrations():
    """Run all database migrations"""

    print("🔄 Connecting to Supabase database...")
    print("⚠️  Please make sure you've replaced [YOUR-PASSWORD] in this script with your actual database password!")
    print()

    try:
        # Connect to database
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        print("✅ Connected to database")

        # Enable UUID extension
        print("📦 Enabling UUID extension...")
        cur.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
        conn.commit()

        # Create users table
        print("📋 Creating users table...")
        cur.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                email           TEXT UNIQUE NOT NULL,
                full_name       TEXT NOT NULL,
                role            TEXT NOT NULL DEFAULT 'student'
                                CHECK (role IN ('student','teacher','admin')),
                hashed_password TEXT NOT NULL,
                is_active       BOOLEAN DEFAULT TRUE,
                created_at      TIMESTAMPTZ DEFAULT now()
            );
        ''')

        cur.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);')
        conn.commit()
        print("✅ Users table created")

        # Create courses table
        print("📋 Creating courses table...")
        cur.execute('''
            CREATE TABLE IF NOT EXISTS courses (
                id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                title        TEXT NOT NULL,
                description  TEXT,
                teacher_id   UUID REFERENCES users(id) ON DELETE CASCADE,
                is_published BOOLEAN DEFAULT FALSE,
                created_at   TIMESTAMPTZ DEFAULT now()
            );
        ''')
        conn.commit()
        print("✅ Courses table created")

        # Create modules table
        print("📋 Creating modules table...")
        cur.execute('''
            CREATE TABLE IF NOT EXISTS modules (
                id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                course_id   UUID REFERENCES courses(id) ON DELETE CASCADE,
                title       TEXT NOT NULL,
                description TEXT,
                "order"     INT DEFAULT 0,
                created_at  TIMESTAMPTZ DEFAULT now()
            );
        ''')
        conn.commit()
        print("✅ Modules table created")

        # Create enrollments table
        print("📋 Creating enrollments table...")
        cur.execute('''
            CREATE TABLE IF NOT EXISTS enrollments (
                id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
                course_id    UUID REFERENCES courses(id) ON DELETE CASCADE,
                progress_pct FLOAT DEFAULT 0,
                enrolled_at  TIMESTAMPTZ DEFAULT now(),
                UNIQUE(user_id, course_id)
            );
        ''')
        conn.commit()
        print("✅ Enrollments table created")

        # Create materials table
        print("📋 Creating materials table...")
        cur.execute('''
            CREATE TABLE IF NOT EXISTS materials (
                id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                title         TEXT NOT NULL,
                material_type TEXT NOT NULL CHECK (material_type IN ('pdf','docx','text','sheet')),
                module_id     UUID REFERENCES modules(id) ON DELETE CASCADE,
                storage_path  TEXT,
                storage_url   TEXT,
                raw_text      TEXT,
                status        TEXT DEFAULT 'pending'
                              CHECK (status IN ('pending','processing','ready','error')),
                created_at    TIMESTAMPTZ DEFAULT now()
            );
        ''')
        conn.commit()
        print("✅ Materials table created")

        # Create chunks table for RAG
        print("📋 Creating chunks table...")
        cur.execute('''
            CREATE TABLE IF NOT EXISTS chunks (
                id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
                chunk_text  TEXT NOT NULL,
                chunk_index INT NOT NULL,
                embedding   vector(1536),
                metadata    JSONB DEFAULT '{}',
                created_at  TIMESTAMPTZ DEFAULT now()
            );
        ''')

        cur.execute('CREATE INDEX IF NOT EXISTS idx_chunks_material_id ON chunks(material_id);')
        conn.commit()
        print("✅ Chunks table created")

        # Create MCQs table
        print("📋 Creating MCQs table...")
        cur.execute('''
            CREATE TABLE IF NOT EXISTS mcqs (
                id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                course_id     UUID REFERENCES courses(id) ON DELETE CASCADE,
                module_id     UUID REFERENCES modules(id) ON DELETE CASCADE,
                question      TEXT NOT NULL,
                options       JSONB NOT NULL,
                correct_index INT NOT NULL,
                explanation   TEXT,
                difficulty    TEXT DEFAULT 'medium'
                              CHECK (difficulty IN ('easy','medium','hard')),
                created_at    TIMESTAMPTZ DEFAULT now()
            );
        ''')
        conn.commit()
        print("✅ MCQs table created")

        # Create attempts table
        print("📋 Creating attempts table...")
        cur.execute('''
            CREATE TABLE IF NOT EXISTS attempts (
                id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
                mcq_id          UUID REFERENCES mcqs(id) ON DELETE CASCADE,
                selected_option INT NOT NULL,
                is_correct      BOOLEAN NOT NULL,
                attempted_at    TIMESTAMPTZ DEFAULT now()
            );
        ''')
        conn.commit()
        print("✅ Attempts table created")

        # Create suggestions table
        print("📋 Creating suggestions table...")
        cur.execute('''
            CREATE TABLE IF NOT EXISTS suggestions (
                id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
                course_id   UUID REFERENCES courses(id) ON DELETE CASCADE,
                title       TEXT NOT NULL,
                content     TEXT NOT NULL,
                status      TEXT DEFAULT 'pending'
                            CHECK (status IN ('pending','reviewed','approved','rejected')),
                created_at  TIMESTAMPTZ DEFAULT now()
            );
        ''')
        conn.commit()
        print("✅ Suggestions table created")

        # Check tables
        print("\n📊 Verifying tables...")
        cur.execute("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        tables = cur.fetchall()

        print("✅ Database tables created successfully:")
        for table in tables:
            print(f"   - {table[0]}")

        # Close connection
        cur.close()
        conn.close()

        print("\n" + "="*60)
        print("✨ Database setup complete!")
        print("="*60)
        print("\nNow you can run: python3 create_admin.py")
        print("to create an admin account")

        return True

    except psycopg2.OperationalError as e:
        print(f"❌ Database connection failed!")
        print(f"   Error: {e}")
        print("\n⚠️  Please check:")
        print("   1. Replace [YOUR-PASSWORD] with your actual Supabase database password")
        print("   2. Your Supabase project is active")
        print("   3. Database credentials are correct")
        return False

    except Exception as e:
        print(f"❌ Error running migrations: {e}")
        return False

if __name__ == "__main__":
    print("="*60)
    print("🚀 AI Learning Platform - Database Setup")
    print("="*60)
    print()

    if "[YOUR-PASSWORD]" in DATABASE_URL:
        print("⚠️  IMPORTANT: You need to edit this script first!")
        print("   1. Open setup_database.py")
        print("   2. Replace [YOUR-PASSWORD] with your actual Supabase database password")
        print("   3. Run this script again")
        print("\nYour database password can be found in:")
        print("   Supabase Dashboard → Settings → Database → Connection string")
    else:
        run_migrations()