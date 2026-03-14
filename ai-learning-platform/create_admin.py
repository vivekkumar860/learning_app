#!/usr/bin/env python3
"""
Script to create an admin user for the AI Learning Platform
"""
import requests
import json
import sys

BASE_URL = "http://localhost:8000"

def create_admin():
    """Create an admin user account"""

    # Admin credentials
    admin_data = {
        "email": "admin@example.com",
        "password": "Admin123",
        "full_name": "Administrator",
        "role": "admin"
    }

    print("🔧 Creating admin account...")
    print(f"   Email: {admin_data['email']}")
    print(f"   Password: {admin_data['password']}")
    print(f"   Role: {admin_data['role']}")
    print()

    try:
        # Register admin
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=admin_data
        )

        if response.status_code == 200:
            print("✅ Admin account created successfully!")
            user = response.json()
            print(f"   User ID: {user.get('id')}")
            print("\n📝 Login Credentials:")
            print(f"   Email: {admin_data['email']}")
            print(f"   Password: {admin_data['password']}")
            return True
        elif response.status_code == 400:
            error_detail = response.json().get('detail', 'Unknown error')
            if 'already registered' in str(error_detail).lower():
                print("ℹ️  Admin account already exists!")
                print("\n📝 Login with:")
                print(f"   Email: {admin_data['email']}")
                print(f"   Password: {admin_data['password']}")
                return True
            else:
                print(f"❌ Registration failed: {error_detail}")
                return False
        else:
            print(f"❌ Registration failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False

    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server!")
        print("   Make sure the backend is running on http://localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_admin_login():
    """Test logging in with admin credentials"""
    print("\n🔐 Testing admin login...")

    login_data = {
        "email": "admin@example.com",
        "password": "Admin123"
    }

    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=login_data
        )

        if response.status_code == 200:
            tokens = response.json()
            print("✅ Login successful!")
            print(f"   Access token: {tokens.get('access_token', '')[:50]}...")
            return tokens.get('access_token')
        else:
            print(f"❌ Login failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return None

    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def main():
    print("=" * 60)
    print("🚀 AI Learning Platform - Admin Setup")
    print("=" * 60)
    print()

    # Create admin account
    if create_admin():
        # Test login
        token = test_admin_login()

        if token:
            print("\n" + "=" * 60)
            print("✨ Admin setup complete!")
            print("\n📱 Access the platform:")
            print("   Frontend: http://localhost:5173/")
            print("   Login with:")
            print("   - Email: admin@example.com")
            print("   - Password: Admin123")
            print("\n🔑 Admin capabilities:")
            print("   - Manage all users")
            print("   - Create/edit/delete all courses")
            print("   - Access all platform features")
            print("   - Change user roles")
            print("=" * 60)
        else:
            print("\n⚠️  Admin created but login test failed")
            print("   The database might not be properly set up")
            print("   Please run the migrations in Supabase first")
    else:
        print("\n❌ Admin setup failed")
        print("   Please check:")
        print("   1. Backend server is running (port 8000)")
        print("   2. Database migrations are applied in Supabase")
        print("   3. Supabase credentials are correct in .env")

if __name__ == "__main__":
    main()