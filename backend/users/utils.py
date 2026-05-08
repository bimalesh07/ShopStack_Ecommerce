import redis
import random
from django.conf import settings
r = redis.Redis.from_url(settings.REDIS_URL)

def generate_otp(email):
    """OTP generate karke Redis mein save karega (5 min limit)"""
    otp = str(random.randint(100000, 999999))
    try:
        r.set(f"otp:{email}", otp, ex=300) 
        return otp
    except Exception as e:
        print(f"Redis Connection Error: {e}")
        return None

def get_otp(email):
    """Redis se OTP mangwayega"""
    otp = r.get(f"otp:{email}")
    return otp.decode() if otp else None


def delete_otp(email):
    """
    OTP verify hote hi turant delete karne ke liye.
    Safety ke liye ye bahut zaroori hai.
    """
    r.delete(f"otp:{email}")

def get_client_ip(request):
    """Security ke liye user ka IP address nikalne ke liye"""
    x = request.META.get('HTTP_X_FORWARDED_FOR')
    return x.split(',')[0] if x else request.META.get('REMOTE_ADDR')