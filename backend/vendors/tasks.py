from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings

@shared_task
def send_registration_thankyou_email(email, name):
    subject = "Application Received! - ShopStack Vendor 🚀"
    
    html_message = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #2563eb; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">ShopStack Vendor Central</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
            <h2 style="color: #1e293b;">Hi {name},</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                Thank you for verifying your email! We have successfully received your vendor application for <b>ShopStack</b>.
            </p>
            <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
                <p style="color: #1e40af; margin: 0; font-size: 15px;">
                    <b>Status: Pending Admin Approval</b><br>
                    Our team is currently reviewing your shop details. This usually takes 24-48 hours.
                </p>
            </div>
            <p style="color: #475569; font-size: 14px;">
                You will receive a final confirmation email once your account is activated. We appreciate your patience!
            </p>
        </div>
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                Best Regards,<br><b>The ShopStack Team</b>
            </p>
        </div>
    </div>
    """
    
    send_mail(
        subject,
        f"Hi {name}, Application received. Pending admin approval.",
        settings.DEFAULT_FROM_EMAIL,
        [email],
        html_message=html_message,
        fail_silently=False,
    )


@shared_task
def send_verified_welcome_email(email, name):
    subject = "Congratulations! Your Vendor Account is Verified 🎉"
    login_url = "http://localhost:5173/login" 
    
    html_message = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        <div style="background-color: #059669; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700;">Welcome to ShopStack!</h1>
        </div>
        
        <div style="padding: 40px 30px; background-color: #ffffff;">
            <h2 style="color: #1e293b; margin-top: 0; font-size: 20px;">Hello {name},</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                Great news! Your <b>Vendor Account</b> has been officially approved. You can now start selling on our platform.
            </p>
            
            <div style="text-align: center; margin: 35px 0;">
                <a href="{login_url}" style="background-color: #059669; color: #ffffff; padding: 16px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                    Access Your Dashboard
                </a>
            </div>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                You can now list your products, manage inventory, and track your orders from the dashboard.
            </p>
        </div>
        
        <div style="background-color: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #f1f5f9;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                Wishing you great sales,<br>
                <b>ShopStack Vendor Success Team</b>
            </p>
        </div>
    </div>
    """
    
    send_mail(
        subject,
        f"Congratulations {name}! Your vendor account is approved.",
        settings.DEFAULT_FROM_EMAIL,
        [email],
        html_message=html_message,
        fail_silently=False,
    )