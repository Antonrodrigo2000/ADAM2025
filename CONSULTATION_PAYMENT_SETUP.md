# Consultation Payment Flow Setup

## Overview
The consultation payment flow implements a two-phase payment system:
1. **Phase 1**: Charge consultation product first (Genie product ID from env)
2. **Phase 2**: After third-party service approval, charge specific approved products

## Environment Configuration

### Required Environment Variables

Add the following to your environment configuration:

```bash
# Consultation product ID from Genie (the actual consultation product)
CONSULTATION_PRODUCT_ID=genie_consultation_product_id_here

# Genie shop ID for order creation
GENIE_SHOP_ID=your_genie_shop_id

# Existing Genie Business Gateway variables
GENIE_API_URL=https://api.geniebiz.lk
GENIE_BUSINESS_API_KEY=your_api_key_here
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Local Development (.env.local)
```bash
CONSULTATION_PRODUCT_ID=dev_consultation_product_id
GENIE_SHOP_ID=dev_shop_id
GENIE_API_URL=https://sandbox-api.geniebiz.lk
GENIE_BUSINESS_API_KEY=your_sandbox_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Production (.env.production)
```bash
CONSULTATION_PRODUCT_ID=prod_consultation_product_id
GENIE_SHOP_ID=prod_shop_id
GENIE_API_URL=https://api.geniebiz.lk
GENIE_BUSINESS_API_KEY=your_production_api_key
NEXT_PUBLIC_SITE_URL=https://yourproductiondomain.com
```

## Database Setup

### 1. Run Migrations
Ensure you've run the consultation payment flow migrations:

```bash
# Migration 021: Basic payment fields
# Migration 022: Consultation flow schema
npx supabase db push
```

### 2. Verify Database Functions
Check that the consultation flow functions are available:

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN (
  'create_consultation_payment_phase',
  'confirm_consultation_payment', 
  'approve_consultation'
);
```

## API Endpoints

The consultation payment flow provides these endpoints:

### 1. Create Consultation Order
```
POST /api/orders
```

### 2. Link Transaction to Order
```
POST /api/orders/link-transaction
```

### 3. Third-Party Approval Webhook (Triggers Product Payment)
```
POST /api/webhooks/third-party-approval
```
**Webhook payload:**
```json
{
  "orderId": "order-uuid",
  "approved": true,
  "products": [
    {
      "productId": "genie_product_id_1",
      "quantity": 2
    },
    {
      "productId": "genie_product_id_2", 
      "quantity": 1
    }
  ],
  "notes": "Patient approved for treatment",
  "approvedBy": "Dr. Smith"
}
```

### 4. Cancel Order
```
POST /api/orders/{orderId}/cancel
```

### 5. Get User's Genie Customer ID
```
GET /api/users/{userId}/genie-customer
```

## Usage Flow

### 1. Initialize Consultation Payment
```typescript
import { ConsultationPaymentFlowService } from '@/lib/services/consultation-payment-flow'

const result = await ConsultationPaymentFlowService.createConsultationPayment(
  userId,
  cartItems,
  paymentMethodId,
  deliveryAddress,
  sessionId
)
```

### 2. Webhook Handles Payment Confirmation
- Webhook receives payment confirmation from Genie
- Automatically updates order status to `physician_review`
- Uses database function `confirm_consultation_payment()`

### 3. Third-Party Service Reviews and Approves
- External service sends webhook to `/api/webhooks/third-party-approval`
- Webhook contains specific products and quantities to approve
- System automatically processes only the approved products

### 4. Product Payment Automatically Processed
- Third-party webhook calculates approved products amount
- Creates new Genie transaction with specific products
- Charges stored payment method for approved amount only
- Updates order to `processing` status

## Database Views

Monitor the consultation flow using these views:

```sql
-- Orders pending consultation payment
SELECT * FROM orders_pending_consultation;

-- Orders awaiting physician review
SELECT * FROM orders_for_physician_review;

-- Orders pending product payment
SELECT * FROM orders_pending_product_payment;
```

## Order Status Flow

```
pending → physician_review → approved_pending_payment → processing → shipped
   ↓           ↓                      ↓                     ↓
consultation  consultation           product             product
payment       approval              payment             fulfilled
```

## Testing

### 1. Test Consultation Product ID
```javascript
const productId = ConsultationPaymentFlowService.getConsultationProductId()
console.log('Consultation product ID:', productId) // Should output your Genie product ID
```

### 2. Test Payment Flow Analysis
```javascript
const analysis = await ConsultationPaymentFlowService.analyzePaymentFlow(cartItems)
console.log('Flow type:', analysis.flowType) // 'consultation_first' or 'full_upfront'
console.log('Consultation fee total:', analysis.consultationFeeTotal)
```

## Troubleshooting

### Environment Variable Not Set
```
Error: CONSULTATION_PRODUCT_ID environment variable not set
```
**Solution**: Add `CONSULTATION_PRODUCT_ID=your_genie_consultation_product_id` to your environment configuration

### Missing Shop ID
```
Error: GENIE_SHOP_ID environment variable not set
```
**Solution**: Add `GENIE_SHOP_ID=your_genie_shop_id` to your environment configuration

### Database Function Not Found
```
Error: function confirm_consultation_payment does not exist
```
**Solution**: Run `npx supabase db push` to apply migration 022

### Webhook Not Processing Consultation Payments
Check that webhook URL is configured correctly in Genie dashboard and matches:
```
https://yourdomain.com/api/webhooks/genie-payments
```

## Security Notes

- All API endpoints validate user authorization
- Users can only access their own orders
- Physician approval requires authenticated physician user
- Payment methods are validated against user ownership
- All transactions use Genie Business Gateway's secure tokenization