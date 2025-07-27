# Real Payment Integration Setup Guide

## 🏦 Payment Providers for Zambia

### 1. MTN Mobile Money (MoMo API)
**Best for:** MTN mobile money payments in Zambia
- **Website:** https://momodeveloper.mtn.com/
- **Documentation:** https://momodeveloper.mtn.com/docs/services/collection/
- **Sandbox:** Free testing environment
- **Production:** Requires business verification

**Setup Steps:**
1. Register at https://momodeveloper.mtn.com/
2. Create a new app
3. Subscribe to "Collection" product
4. Get your API keys:
   - Primary Key (Ocp-Apim-Subscription-Key)
   - Secondary Key
   - API User ID
   - API Key

### 2. Flutterwave (Recommended - Supports Multiple Methods)
**Best for:** Card payments, mobile money, bank transfers
- **Website:** https://flutterwave.com/
- **Supports:** Visa, Mastercard, MTN, Airtel, Zamtel
- **Documentation:** https://developer.flutterwave.com/

**Setup Steps:**
1. Register at https://flutterwave.com/
2. Complete business verification
3. Get API keys from dashboard
4. Test with sandbox first

### 3. Paystack (Alternative)
**Best for:** Card payments and mobile money
- **Website:** https://paystack.com/
- **Documentation:** https://paystack.com/docs/

### 4. Stripe (International Cards)
**Best for:** International card payments
- **Website:** https://stripe.com/
- **Documentation:** https://stripe.com/docs/

## 🎯 Recommended Approach
**Primary:** Flutterwave (supports all Zambian payment methods)
**Secondary:** MTN MoMo API (direct MTN integration)
**Cards:** Stripe or Flutterwave
