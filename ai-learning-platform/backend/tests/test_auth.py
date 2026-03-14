import pytest
from utils.auth_helpers import hash_password, verify_password

def test_password_hashing():
    hashed = hash_password("secret123")
    assert verify_password("secret123", hashed)
    assert not verify_password("wrong", hashed)
