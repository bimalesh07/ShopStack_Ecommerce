import razorpay
import hmac
import hashlib
from django.conf import settings


def get_razorpay_client():
    return razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )


def create_razorpay_order(amount):
    client = get_razorpay_client()
    
    # in Razorpay amout in paisa 
    data = {
        "amount": int(amount * 100),
        "currency": "INR",
        "payment_capture": 1,
    }
    return client.order.create(data=data)


def verify_razorpay_signature(razorpay_order_id,
                               razorpay_payment_id,
                               razorpay_signature):
    key_secret = settings.RAZORPAY_KEY_SECRET.encode()
    message = f"{razorpay_order_id}|{razorpay_payment_id}".encode()
    generated_signature = hmac.new(
        key_secret,
        message,
        hashlib.sha256
    ).hexdigest()
    return generated_signature == razorpay_signature