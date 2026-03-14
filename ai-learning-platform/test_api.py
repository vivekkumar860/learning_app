#!/usr/bin/env python3
import requests
import json

BASE_URL = "http://localhost:8000"

def test_registration():
    """Test user registration"""
    print("\n1. Testing Registration...")

    # Use a shorter password that bcrypt can handle
    data = {
        "email": "test@example.com",
        "password": "pass123",  # Short password
        "full_name": "Test User",
        "role": "student"
    }

    response = requests.post(f"{BASE_URL}/api/auth/register", json=data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print("✅ Registration successful!")
        print(f"Response: {response.json()}")
    else:
        print(f"❌ Registration failed: {response.text}")

    return response.status_code == 200

def test_login():
    """Test user login"""
    print("\n2. Testing Login...")

    data = {
        "email": "test@example.com",
        "password": "pass123"
    }

    response = requests.post(f"{BASE_URL}/api/auth/login", json=data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print("✅ Login successful!")
        tokens = response.json()
        print(f"Access Token: {tokens.get('access_token')[:20]}...")
        return tokens.get('access_token')
    else:
        print(f"❌ Login failed: {response.text}")
        return None

def test_protected_endpoint(token):
    """Test accessing a protected endpoint"""
    print("\n3. Testing Protected Endpoint...")

    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/courses", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print("✅ Protected endpoint accessible!")
        print(f"Courses: {response.json()}")
    else:
        print(f"❌ Protected endpoint failed: {response.text}")

if __name__ == "__main__":
    print("🧪 Testing AI Learning Platform API...")
    print("=" * 50)

    # Test registration
    if test_registration():
        # Test login
        token = test_login()
        if token:
            # Test protected endpoint
            test_protected_endpoint(token)

    print("\n" + "=" * 50)
    print("✨ Testing complete!")