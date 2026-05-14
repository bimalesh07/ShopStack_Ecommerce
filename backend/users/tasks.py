import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from django.conf import settings
from celery import shared_task

def get_brevo_api():
    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = settings.EMAIL_HOST_PASSWORD
    return sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))

@shared_task
def send_verification_email(email, otp):
    api_instance = get_brevo_api()
    subject = f"{otp} is your ShopStack Verification Code"
    
    html_content = f"""
    <div style="font-family: Arial; max-width: 500px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="text-align: center;">Verify Your Email</h2>
        <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 30px; letter-spacing: 5px; color: #2563eb;">
            {otp}
        </div>
        <p style="text-align: center; color: #888;">Valid for 5 minutes.</p>
    </div>
    """

    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": email}],
        sender={"name": "ShopStack", "email": settings.DEFAULT_FROM_EMAIL},
        subject=subject,
        html_content=html_content
    )

    try:
        api_instance.send_transac_email(send_smtp_email)
    except ApiException as e:
        print(f"Error: {e}")

@shared_task
def send_customer_welcome_email(email, name):
    api_instance = get_brevo_api()
    subject = "Welcome to ShopStack! ✨"
   
    html_content = f"""
    <div style="font-family: sans-serif; padding: 40px; background: #f9fafb;">
        <h1>Welcome board, {name}!</h1>
        <p>Your account is now fully active.</p>
        <a href="https://shop-stack-ecommerce.vercel.app" style="color: blue;">Start Shopping</a>
    </div>
    """

    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": email}],
        sender={"name": "ShopStack", "email": settings.DEFAULT_FROM_EMAIL},
        subject=subject,
        html_content=html_content
    )

    try:
        api_instance.send_transac_email(send_smtp_email)
    except ApiException as e:
        print(f"Error: {e}")