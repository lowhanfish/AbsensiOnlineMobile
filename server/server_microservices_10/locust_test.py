#!/usr/bin/env python3
"""
Locust Load Testing untuk Face Matching Microservice
Test concurrent requests dengan 1000+ users
"""

import os
import json
import base64
from locust import HttpUser, task, between
from locust.exception import StopUser


class FaceMatchingUser(HttpUser):
    """
    Simulasi user yang melakukan face matching requests
    """
    wait_time = between(1, 3)  # Wait 1-3 detik antara requests

    def on_start(self):
        """Setup saat user mulai"""
        self.test_images = self.load_test_images()

    def load_test_images(self):
        """Load test images dari folder uploads"""
        uploads_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "server", "uploads")

        # Cari file JPEG yang ada
        jpeg_files = []
        if os.path.exists(uploads_dir):
            for file in os.listdir(uploads_dir):
                if file.lower().endswith('.jpeg') or file.lower().endswith('.jpg'):
                    jpeg_files.append(file)

        # Ambil 3 gambar pertama untuk test
        test_files = jpeg_files[:3] if len(jpeg_files) >= 3 else jpeg_files

        if len(test_files) < 3:
            print(f"Warning: Only found {len(test_files)} JPEG files. Need at least 3 for testing.")
            # Fallback ke dummy data jika tidak cukup gambar
            return ["dummy1.jpeg", "dummy2.jpeg", "dummy3.jpeg"]

        return test_files

    @task(3)  # Weight 3 - paling sering
    def test_verify_uploads(self):
        """Test endpoint /api/v1/verify-uploads dengan JSON payload"""
        if len(self.test_images) < 3:
            return

        payload = {
            "reference": self.test_images[0],
            "probe1": self.test_images[1],
            "probe2": self.test_images[2]
        }

        headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'Locust-FaceMatching/1.0'
        }

        with self.client.post(
            "/api/v1/verify-uploads",
            json=payload,
            headers=headers,
            catch_response=True,
            timeout=30
        ) as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    # Validasi response structure
                    if "overall_result" in data and "performance" in data:
                        response.success()
                        # Log performance metrics
                        total_time = data.get("performance", {}).get("total_processing_time_ms", 0)
                        self.environment.events.request.fire(
                            request_type="POST",
                            name="/api/v1/verify-uploads",
                            response_time=response.elapsed.total_seconds() * 1000,
                            response_length=len(response.content),
                            exception=None,
                            context={"processing_time_ms": total_time}
                        )
                    else:
                        response.failure(f"Invalid response structure: {data}")
                except json.JSONDecodeError:
                    response.failure("Invalid JSON response")
            elif response.status_code == 404:
                response.failure("File not found - check test images")
            elif response.status_code == 500:
                response.failure("Server error")
            else:
                response.failure(f"HTTP {response.status_code}: {response.text}")

    @task(1)  # Weight 1 - kurang sering
    def test_health_check(self):
        """Test health check endpoint"""
        with self.client.get("/", catch_response=True) as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    if data.get("status") == "running":
                        response.success()
                    else:
                        response.failure(f"Service not healthy: {data}")
                except json.JSONDecodeError:
                    response.failure("Invalid JSON response")
            else:
                response.failure(f"Health check failed: {response.status_code}")

    @task(1)  # Weight 1 - kurang sering
    def test_invalid_request(self):
        """Test dengan invalid payload untuk error handling"""
        payload = {
            "reference": "nonexistent_file.jpeg"
        }

        with self.client.post(
            "/api/v1/verify-uploads",
            json=payload,
            catch_response=True,
            timeout=10
        ) as response:
            if response.status_code == 400 or response.status_code == 404:
                response.success()  # Expected error
            elif response.status_code == 200:
                response.failure("Should have failed with invalid input")
            else:
                response.failure(f"Unexpected error: {response.status_code}")


class FaceMatchingLoadTest(HttpUser):
    """
    Advanced load test dengan custom metrics
    """
    wait_time = between(0.5, 2)

    def on_start(self):
        self.request_count = 0
        self.success_count = 0
        self.total_processing_time = 0

    @task
    def heavy_load_test(self):
        """Test dengan beban berat"""
        # Simulate file upload test (multipart/form-data)
        # Note: Locust has limitations with file uploads, so we use JSON endpoint

        test_payload = {
            "reference": "1769051194795.JPEG",
            "probe1": "1769051219418.JPEG",
            "probe2": "1768965768998.JPEG"
        }

        start_time = self.environment.runner.stats.start_time

        with self.client.post(
            "/api/v1/verify-uploads",
            json=test_payload,
            catch_response=True,
            timeout=60  # Longer timeout for heavy load
        ) as response:
            self.request_count += 1

            if response.status_code == 200:
                try:
                    data = response.json()
                    processing_time = data.get("performance", {}).get("total_processing_time_ms", 0)
                    self.total_processing_time += processing_time
                    self.success_count += 1

                    # Custom metrics
                    avg_processing_time = self.total_processing_time / self.success_count

                    # Log custom metrics
                    self.environment.events.request.fire(
                        request_type="POST",
                        name="face_matching_heavy",
                        response_time=response.elapsed.total_seconds() * 1000,
                        response_length=len(response.content),
                        exception=None,
                        context={
                            "processing_time_ms": processing_time,
                            "avg_processing_time_ms": avg_processing_time,
                            "success_rate": (self.success_count / self.request_count) * 100
                        }
                    )

                    response.success()

                except json.JSONDecodeError:
                    response.failure("JSON decode error")
            else:
                response.failure(f"HTTP {response.status_code}")


# Configuration untuk Locust
# Run dengan: locust -f locust_test.py --host=http://121.52.72.109:5010

if __name__ == "__main__":
    # Standalone test
    print("Locust Load Test untuk Face Matching Microservice")
    print("=" * 60)
    print("Usage:")
    print("  locust -f locust_test.py --host=http://121.52.72.109:5010")
    print("  locust -f locust_test.py --host=http://127.0.0.1:5010")
    print("")
    print("Web UI: http://localhost:8089")
    print("Scenarios:")
    print("  1. Ramp up to 100 users over 60s")
    print("  2. Constant 1000 users for 300s")
    print("  3. Spike test: 1000 users for 30s")
    print("=" * 60)
