from locust import HttpUser, task, between
import random

class BookifyUser(HttpUser):
    host = "http://127.0.0.1:8000"
    wait_time = between(1, 5)  # time between requests (seconds)

    @task(2)
    def get_books(self):
        self.client.get("/api/books/")

    @task(1)
    def create_book(self):
        book_data = {
            "title": f"Test Book {random.randint(1,10000)}",
            "author": "Locust User",
            "description": "Performance test book",
            "price": round(random.uniform(10, 50), 2),
            "isbn": str(random.randint(1000000000000, 9999999999999))
        }
        self.client.post("/api/books/", json=book_data)

    # @task(2)
    # def search_books(self):
    #     self.client.get("/api/search/?q=python")
