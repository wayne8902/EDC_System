import requests
import os
from dotenv import load_dotenv

from msal import ConfidentialClientApplication
class sendMail:
    def auth():

        load_dotenv()
        client_id = os.getenv("ONEDRIVE_ClientID")
        client_secret = os.getenv("ONEDRIVE_client_secret")
        tenant_id = os.getenv("ONEDRIVE_TenantID")
        scope = ["https://graph.microsoft.com/.default"]

        app = ConfidentialClientApplication(
            client_id=client_id,
            client_credential=client_secret,
            authority=f"https://login.microsoftonline.com/{tenant_id}"
        )

        result = app.acquire_token_for_client(scopes=scope)
        access_token = result["access_token"]
        # print(access_token)
        os.environ['ONEDRIVE_sendMail_access_token'] = access_token
        return access_token

    def sendmail(access_token,data=None,user_principal_name=None):
        if user_principal_name==None:
            user_principal_name = "no-reply@united-khh.com.tw"
        endpoint = f"https://graph.microsoft.com/v1.0/users/{user_principal_name}/sendMail"

        
        if data==None:
            data = {
              "message": {
                "subject": "測試郵件主旨",
                "body": {
                  "contentType": "HTML",
                  "content": "<h2>這是 HTML 格式內容</h2><p>這是一封自動寄送的測試郵件。</p>"
                },
                "toRecipients": [
                  {
                    "emailAddress": {
                      "address": "lc12310@gmail.com"
                    }
                  },
                  {
                    "emailAddress": {
                      "address": "pswei@united-khh.com.tw"
                    }
                  }
                ],
                "attachments": [
                  {
                    "@odata.type": "#microsoft.graph.fileAttachment",
                    "name": "hello.txt",
                    "contentType": "text/plain",
                    "contentBytes": "aGVsbG8gd29ybGQh" 
                  }
                ]
              },
              "saveToSentItems": True
            }


        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        response = requests.post(endpoint, headers=headers, json=data)

        # print(response.status_code)
        # print(response.text)
        return response
    def send(data=None,user_principal_name=None):
        access_token = os.getenv("ONEDRIVE_sendMail_access_token")
        response=sendMail.sendmail(access_token,data=data,user_principal_name=user_principal_name)
        if (response.status_code!=202) and (response.status_code!=200):
            print("reAuth on microsoft graph")
            access_token=sendMail.auth()
            response=sendMail.sendmail(access_token,data=data,user_principal_name=user_principal_name)
        return response