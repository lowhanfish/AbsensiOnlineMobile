from locust import HttpUser, task, between

class VerifyUploadsUser(HttpUser):
    wait_time = between(1, 3)

    @task
    def verify_uploads(self):
        url = "/api/v1/verify-uploads"
        payload = {
            "reference": "1769051194795.JPEG",
            "probe1": "1769051219418.JPEG",
            "probe2": "1768965768998.JPEG"
        }
        headers = {"Content-Type": "application/json"}
        self.client.post(url, json=payload, headers=headers)
