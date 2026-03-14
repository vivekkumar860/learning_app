from typing import Dict, List, Optional, Any
import bcrypt
import secrets
from datetime import datetime, timedelta

# Mock in-memory databases using email/id as keys
users_db: Dict[str, Dict] = {}
courses_db: Dict[str, Dict] = {}
sessions_db: Dict[str, Dict] = {}
materials_db: Dict[str, Dict] = {}
quizzes_db: Dict[str, Dict] = {}
enrollments_db: Dict[str, Dict] = {}
suggestions_db: Dict[str, Dict] = {}

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

class MockSupabaseClient:
    def __init__(self):
        self.auth = self
        self.table = lambda name: MockTable(name)
        self.storage = MockStorage()

    def sign_up(self, credentials: dict):
        email = credentials.get("email")
        password = credentials.get("password")

        if email in users_db:
            raise Exception("User already exists")

        user_id = secrets.token_hex(16)
        users_db[email] = {
            "id": user_id,
            "email": email,
            "hashed_password": hash_password(password),
            "created_at": datetime.now().isoformat()
        }

        return {
            "user": {"id": user_id, "email": email},
            "session": {"access_token": secrets.token_hex(32)}
        }

    def sign_in_with_password(self, credentials: dict):
        email = credentials.get("email")
        password = credentials.get("password")

        if email not in users_db:
            raise Exception("Invalid credentials")

        user = users_db[email]
        if not verify_password(password, user["hashed_password"]):
            raise Exception("Invalid credentials")

        session_token = secrets.token_hex(32)
        sessions_db[session_token] = {
            "user_id": user["id"],
            "email": email,
            "expires_at": (datetime.now() + timedelta(days=7)).isoformat()
        }

        return {
            "user": {"id": user["id"], "email": email},
            "session": {"access_token": session_token}
        }

    def sign_out(self, jwt: str):
        if jwt in sessions_db:
            del sessions_db[jwt]
        return {"error": None}

class MockTable:
    def __init__(self, name: str):
        self.name = name
        self._data = globals().get(f"{name}_db", {})

    def select(self, *columns):
        self.columns = columns
        return self

    def insert(self, data):
        self.insert_data = data
        return self

    def update(self, data):
        self.update_data = data
        return self

    def delete(self):
        return self

    def eq(self, column, value):
        self.filter_column = column
        self.filter_value = value
        return self

    def single(self):
        return self

    def execute(self):
        class Result:
            def __init__(self, data, error=None):
                self.data = data
                self.error = error

        if hasattr(self, 'insert_data'):
            if isinstance(self.insert_data, list):
                inserted = []
                for item in self.insert_data:
                    item_id = item.get('id', secrets.token_hex(16))
                    item['id'] = item_id
                    item['created_at'] = datetime.now().isoformat()
                    self._data[item_id] = item
                    inserted.append(item)
                return Result(inserted)
            else:
                item_id = self.insert_data.get('id', secrets.token_hex(16))
                self.insert_data['id'] = item_id
                self.insert_data['created_at'] = datetime.now().isoformat()
                # Add is_active field for users table
                if self.name == 'users' and 'is_active' not in self.insert_data:
                    self.insert_data['is_active'] = True
                self._data[item_id] = self.insert_data
                return Result([self.insert_data])

        if hasattr(self, 'update_data'):
            for key, item in self._data.items():
                if item.get(self.filter_column) == self.filter_value:
                    item.update(self.update_data)
                    return Result([item])
            return Result(None, "Not found")

        if hasattr(self, 'filter_column'):
            results = []
            for item in self._data.values():
                if item.get(self.filter_column) == self.filter_value:
                    results.append(item)
            if hasattr(self, 'single') and results:
                return Result(results[0])
            return Result(results)

        return Result(list(self._data.values()))

class MockStorage:
    def __init__(self):
        self.files = {}

    def from_(self, bucket: str):
        self.bucket = bucket
        return self

    def upload(self, path: str, file_data: bytes, file_options: dict = None):
        self.files[f"{self.bucket}/{path}"] = file_data
        return {"data": {"path": path}, "error": None}

    def get_public_url(self, path: str):
        return {"data": f"http://localhost:8000/mock-storage/{self.bucket}/{path}"}