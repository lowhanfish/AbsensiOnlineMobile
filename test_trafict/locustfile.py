from locust import HttpUser, task, between

class VerifyUploadsUser(HttpUser):
    wait_time = between(1, 3)
    host = "http://121.52.72.109"  # dummy host agar Locust tidak error

    @task
    def verify_and_upload(self):
        # Request 1: verify-uploads (host 5010)
        verify_url = "http://121.52.72.109:5010/api/v1/verify-uploads"
        verify_payload = {
            "reference": "1769051194795.JPEG",
            "probe1": "1769051219418.JPEG",
            "probe2": "1768965768998.JPEG"
        }
        headers = {"Content-Type": "application/json"}
        verify_response = self.client.post(verify_url, json=verify_payload, headers=headers, name="verify-uploads")

        # Request 2: uploads (host 5009)
        upload_url = "http://121.52.72.109:5009/api/v1/uploads"
        upload_payload = {
            "filename": "1768913420754.jpeg"
        }
        upload_response = self.client.post(upload_url, json=upload_payload, headers=headers, name="uploads")

        # Optional: cek jika kedua request selesai
        if verify_response.ok and upload_response.ok:
            pass  # Keduanya sukses
        # Jika ingin log atau aksi lain, bisa ditambahkan di sini
