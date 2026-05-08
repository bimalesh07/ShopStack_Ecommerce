from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings

@shared_task
def send_verification_email(email, otp):
    subject = f"{otp} is your ShopStack Verification Code"
    
    html_message = f"""
    <div style="font-family: Helvetica, Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #eeeeee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Verify Your Email</h2>
        <p style="font-size: 16px; color: #555;">Hello,</p>
        <p style="font-size: 16px; color: #555;">Thank you for choosing <b>ShopStack</b>. Use the following OTP to complete your registration. This code is valid for 5 minutes.</p>
        
        <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="letter-spacing: 5px; color: #2563eb; margin: 0;">{otp}</h1>
        </div>
        
        <p style="font-size: 14px; color: #888; text-align: center;">If you did not request this code, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
        <p style="font-size: 12px; color: #aaa; text-align: center;">&copy; 2026 ShopStack Inc.</p>
    </div>
    """
    
    send_mail(
        subject,
        f"Your OTP is {otp}",
        settings.DEFAULT_FROM_EMAIL,
        [email],
        html_message=html_message,
        fail_silently=False,
    )

@shared_task
def send_customer_welcome_email(email, name):
    subject = "Welcome to ShopStack! Your journey starts here ✨"
   
    html_message = f"""
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; padding: 40px 20px; color: #1f2937;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            
            <div style="background-color: #2563eb; padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">ShopStack</h1>
            </div>

            <div style="padding: 40px 30px; text-align: center;">
                <h2 style="color: #111827; font-size: 24px; margin-bottom: 16px;">Welcome aboard, {name}!</h2>
                <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 30px;">
                    We're thrilled to have you with us. Your account is now fully active and verified. 
                    Get ready to explore the best deals and a seamless shopping experience.
                </p>
                
                <a href="http://localhost:5173" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; transition: background-color 0.3s ease;">
                    Start Shopping Now
                </a>
            </div>

            <div style="padding: 30px; background-color: #f3f4f6; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="font-size: 14px; color: #6b7280; margin: 0;">
                    Need help? Reply to this email or visit our Help Center.
                </p>
                <p style="font-size: 12px; color: #9ca3af; margin-top: 12px;">
                    &copy; 2026 ShopStack Inc. All rights reserved.
                </p>
            </div>
        </div>
    </div>
    """

    send_mail(
        subject,
        f"Hi {name}, Welcome to ShopStack! Your account is active.",
        settings.DEFAULT_FROM_EMAIL,
        [email],
        html_message=html_message,
        fail_silently=False,
    )