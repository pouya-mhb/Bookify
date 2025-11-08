# 📚 BookStore API

A simple Django REST API for managing books.  
This project is designed for **practicing software testing** in Python — including unit, integration, functional, regression, smoke, and API testing.

---

## 🚀 Features

- Add, view, update, and delete books
- Filter books by author or publication year
- REST API built with Django Rest Framework
- Ready for automated testing with Pytest

---

## 🧪 Testing Types to Practice

| Test Type | Example |
|------------|----------|
| Unit | Test the Book model logic |
| Integration | Test views + database together |
| Functional | Test API endpoints using requests |
| Regression | Ensure updates don’t break existing features |
| Smoke | Run quick tests after deployment |
| API | Validate JSON responses and status codes |
| Performance | Measure response time and scalability |

---

## ⚙️ Setup Instructions

```bash
# Clone the repo
git clone https://github.com/pouya-mhb/Bookify.git
cd Bookify

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or on Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Run the server
python manage.py runserver
