# ScamLens 🛡️
> **"Think Before You Click"** — AI-Powered Scam Detection & Digital Safety Android Application

ScamLens is a production-quality mobile cybersecurity application designed to help everyday smartphone users identify and protect themselves against digital fraud, phishing, OTP scams, UPI fraud, malicious links, and social engineering attacks.

---

## 📱 Features

1. **AI-Powered Message Analysis**:
   - Paste SMS, WhatsApp, Email, or Telegram messages.
   - Hybrid engine: 3-layer architecture combining real-time local rule-based heuristics with backend LLM contextual analysis.
   - Structured risk reports: Risk Level (`LOW`, `CAUTION`, `HIGH`, `CRITICAL`), Risk Score (0–100), detected indicators, and actionable precautions.
2. **📸 Screenshot & Chat Image Analyser (OCR)**:
   - Pick any chat screenshot or snap a photo of a suspicious message.
   - Extracts on-image text and executes instant multi-indicator scam analysis.
3. **🚨 Emergency Scam Incident Response (SOS Wizard)**:
   - Immediate containment protocol for victims who transferred money or shared OTPs.
   - **One-tap dial to 1930** (National Cyber Crime Helpline) & direct bank freeze hotlines (SBI, HDFC, ICICI, Axis).
   - 5-step containment checklist (Account freeze, SIM lock, password revocation).
   - Auto-generates formal police FIR complaint drafts ready to copy & paste into `cybercrime.gov.in`.
4. **🎮 Interactive Threat Arena (Scam Simulator)**:
   - Gamified scenario simulator to train students, professionals, and elderly family members.
   - Realistic message simulators (Digital arrest, fake electricity cutoff, Telegram jobs, counterfeit courier fees) with scoring, red-flag breakdowns, and cybersecurity rank ratings.
5. **🔍 Data Leak & Breach Radar**:
   - Enter email or phone number to check against public database leak archives.
   - Visualizes compromised data classes (passwords, phone numbers, physical addresses) with actionable security remedies.
6. **🔔 Notification Shield Simulator**:
   - Background cross-app notification interception simulator.
   - Intercepts incoming messages, executes local rule-based threat evaluation, and pushes instant high-risk device alerts with `expo-notifications`.
7. **Suspicious Link Analyser**:
   - Evaluates domain lookalikes, URL shorteners, IP-based URLs, HTTPS security, and suspicious subdomains without auto-navigating to malicious sites.
8. **QR Code Scanner**:
   - Camera-based barcode scanner with preview safety gate before URL navigation.
9. **Reports & Detection History**:
   - Filter by risk severity (`LOW`, `CAUTION`, `HIGH`, `CRITICAL`), search content, and view previous scan audits.
10. **Scam Knowledge Centre**:
   - Educational guides on 10 common fraud vectors (Banking, UPI, Job Offers, Phishing, OTP, Investment, Delivery, Government Impersonation, QR Code, Social Media) with official helpline details (`1930` & `cybercrime.gov.in`).
11. **User Authentication & Profile**:
   - JWT-based authentication with bcrypt password hashing, guest mode support, and local data wipe controls.

---

## 🚀 How to Run the Project

### 1. Run the Mobile App (React Native / Expo)

Open a terminal and navigate to `my-app`:

```powershell
cd c:\Users\Asus\Desktop\native_project\Native_Project\my-app
```

Start the Expo development server:

```powershell
npx expo start
```

#### Choose how to view:
- **On Android Emulator**: Press `a` in the terminal (ensure Android Studio and an emulator or device is running).
- **On Physical Phone**: Install **Expo Go** from Google Play Store, open the app, and scan the QR code displayed in your terminal.
- **On Web Browser**: Press `w` in the terminal to preview in your browser.

> **Tip for Android Emulator & Physical Devices**:
> In [apiService.ts](file:///c:/Users/Asus/Desktop/native_project/Native_Project/my-app/src/services/apiService.ts):
> - If running on **Android Emulator**, the API defaults to `http://10.0.2.2:5000/api` (standard Android localhost mapping).
> - If testing on a **physical phone**, set `EXPO_PUBLIC_API_URL=http://<YOUR_COMPUTER_LOCAL_IP>:5000/api` in your `.env`.

---

### 2. Run the Backend (Node.js & Express)

Open a second terminal and navigate to `backend`:

```powershell
cd c:\Users\Asus\Desktop\native_project\Native_Project\backend
```

Run the backend server:

```powershell
npm start
```
*(Or with live-reload: `npm run dev`)*

The server will start at:
- **Base URL**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`

---

## ⚙️ Environment Variables (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/scamlens` |
| `JWT_SECRET` | Secret key for JWT signing | `scamlens_super_secret_jwt_key_2026_production` |
| `AI_PROVIDER` | AI provider (`openai` or `gemini`) | `openai` |
| `OPENAI_API_KEY` | *(Optional)* OpenAI API key | - |
| `GEMINI_API_KEY` | *(Optional)* Google Gemini API key | - |

> **Graceful Fallback**: If no AI API key or MongoDB instance is provided, ScamLens automatically runs on its deterministic **Rule-Based Engine** both on the backend and offline in the mobile app. All message analysis, URL analysis, and reporting work seamlessly even with zero external API credentials!

---

## 📂 Project Structure

```
Native_Project/
├── my-app/                         # React Native / Expo Mobile App
│   ├── src/
│   │   ├── app/
│   │   │   ├── (tabs)/
│   │   │   │   ├── _layout.tsx     # 5-tab bottom navigation
│   │   │   │   ├── index.tsx       # Home Dashboard & Quick Actions
│   │   │   │   ├── scan.tsx        # Scan & Detection Hub
│   │   │   │   ├── reports.tsx     # Detection History & Filtering
│   │   │   │   ├── learn.tsx       # Scam Knowledge Centre
│   │   │   │   └── profile.tsx     # User Profile & Preferences
│   │   │   ├── analysis/
│   │   │   │   ├── message.tsx     # Message analysis input & trigger
│   │   │   │   ├── result.tsx      # Comprehensive scan report view
│   │   │   │   ├── link.tsx        # Suspicious URL analysis
│   │   │   │   └── qr.tsx          # Camera QR barcode scanner
│   │   │   ├── auth/
│   │   │   │   ├── login.tsx       # User login screen
│   │   │   │   └── register.tsx    # User registration screen
│   │   │   └── _layout.tsx         # Root stack layout
│   │   ├── components/ui/          # Reusable Card, Button, Badge, Skeleton
│   │   ├── constants/theme.ts      # Cybersecurity UI theme & tokens
│   │   ├── context/AppContext.tsx  # Global state & offline storage
│   │   └── services/
│   │       ├── apiService.ts       # Backend REST API client
│   │       └── ruleEngine.ts       # Deterministic rule engine & regex heuristics
│   ├── app.json                    # Expo config & Android permissions
│   └── package.json
│
├── backend/                        # Node.js Express REST API
│   ├── src/
│   │   ├── config/db.js            # MongoDB Mongoose connection
│   │   ├── controllers/            # Auth, Analysis, and Report controllers
│   │   ├── models/                 # User, Report, Feedback schemas
│   │   ├── routes/                 # Express route definitions
│   │   ├── services/
│   │   │   ├── aiService.js        # OpenAI / Gemini LLM provider
│   │   │   └── ruleEngine.js       # Backend fallback rule engine
│   │   ├── middleware/             # JWT auth & error handling
│   │   ├── app.js                  # Express middleware setup
│   │   └── server.js               # HTTP server entry point
│   ├── package.json
│   └── .env.example
└── README.md
```

---

## 🧪 Testing Scenarios

Try pasting the following sample messages in the **Analyse Message** screen:

1. **High Risk (Banking / OTP Scam)**:
   > *"URGENT: Your SBI account #4829 has been suspended due to pending KYC update. Click http://bit.ly/sbi-verify-kyc now and enter your OTP to avoid permanent account block."*
   - Detects: Urgency manipulation, OTP request, Shortened URL, Bank Impersonation, Account suspension threat.
2. **Safe Message**:
   > *"Hey Mom, I will be home by 6 PM today. Let me know if you need anything from the grocery store."*
   - Detects: Low risk, legitimate communication.
3. **Job Scam**:
   > *"Congratulations! You have been selected for Amazon Work From Home job. Earn ₹5000 daily with no experience. Send ₹500 registration fee via UPI to start."*
   - Detects: Too-good-to-be-true job, upfront fee demand, UPI payment demand.

