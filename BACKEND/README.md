1. Complete README.md File
Copy the block below and paste it into your README.md file:
# Digital Banking System API

A functional RESTful banking backend built with Node.js, Express, and MongoDB (Mongoose).

## Features
- **User Onboarding:** Identity registration with BVN/NIN checks.
- **Account Creation:** Automatic 10-digit account generation pre-funded with ₦15,000.
- **Banking Operations:** Account balance checks and recipient name enquiry.
- **Funds Transfer:** Intra-bank transfers with instant debit/credit updates.
- **Transaction History:** Audit logging with unique transaction reference generation.

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Divine-AC/divine-bank.git](https://github.com/Divine-AC/divine-bank.git)


Install dependencies:npm install


Set up environment variables:
Create a .env file in the root directory and add:PORT=2000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=supersecretkey123


Start the server:npm run dev



API Endpoints Overview
MethodEndpointDescription
POST/api/v1/onboard   Register a new user
POST/api/v1/accounts   Create a pre-funded bank account
GET/api/v1/accounts/balance   Query account balance (?accountNumber=...)
POST/api/v1/banking/name-enquiry   Verify account holder name
POST/api/v1/banking/transfer   Execute intra-bank transfer
GET/api/v1/transactions   Fetch transaction logs (?accountId=...)
