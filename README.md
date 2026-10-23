# AI Verify — Intelligent Application & Compliance Platform

AI Verify is an enterprise-grade, AI-assisted platform engineered to validate submitted applications, extract and cross-compare information from documents, detect indicators of tampering or inconsistencies, and evaluate dossiers against configurable regulatory requirements with human-in-the-loop oversight.

---

## 1. Architectural Overview

The platform cleanly decouples client and server responsibilities:

- **Frontend (`/frontend`)**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, React Router v7, Recharts, and accessible enterprise UI components.
- **Backend (`/backend`)**: Python FastAPI, Pydantic v2, SQLAlchemy 2.0 ORM, SQLite / PostgreSQL, ReportLab PDF generation, Pillow / pypdf document inspection, and Google GenAI SDK integration with graceful deterministic fallback.
- **Security & Storage**: SHA-256 cryptographic digests, magic-byte file signature validation, private object sandbox, JWT bearer authentication, and role-based access control (RBAC).

---

## 2. Default Seed Accounts

The platform comes pre-seeded with synthetic accounts across all three operational tiers:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Applicant** | `applicant@aiverify.org` | `Applicant123!` | Create applications, upload documents, track status |
| **Compliance Reviewer** | `reviewer@aiverify.org` | `Reviewer123!` | Inspect queues, review extractions, record determinations |
| **Administrator** | `admin@aiverify.org` | `Admin123!` | Executive metrics, user governance, rules engine, audit logs |

---

## 3. Quickstart & Local Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+

### A. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize database tables and synthetic seed data
python -m app.db.init_db

# Run automated tests
pytest -v

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

FastAPI OpenAPI interactive documentation is available at: `http://localhost:8000/docs`

### B. Frontend Setup

```bash
cd frontend

# Install packages
npm install

# Build for production
npm run build

# Start Vite development server
npm run dev
```

Frontend application will be available at: `http://localhost:5173`

---

## 4. Key Verification Features

### A. Document Intelligence & OCR Pipeline
- **Magic-Byte Signature Checks**: Evaluates real file headers (`%PDF-`, `\x89PNG`, `\xff\xd8`) to reject disguised executables.
- **Safe Extraction**: Machine-readable text extraction via `pypdf` and metadata inspection via `Pillow`.
- **Interchangeable AI Provider**: Uses Google Gemini 2.5 Flash via `google-genai` when `GEMINI_API_KEY` is provided; falls back to deterministic local NLP simulation in Demo Mode.
- **Field Comparison**: Automatically cross-references applicant names, document identification numbers, issue dates, expiry dates, and declared financials.

### B. Authenticity & Tampering Indicators
- **Duplicate Hash Detection**: Compares SHA-256 digests across all applications to catch re-used documentation.
- **Metadata Anomaly Check**: Detects modified timestamps earlier than creation timestamps or consumer rasterization software (Photoshop, GIMP).
- **Name Variance Analysis**: Differentiates between minor spelling variations (e.g. middle initials) vs major mismatches.
- **Validity & Expiration**: Automatically flags elapsed credentials.

### C. Regulatory Compliance Engine
- Fully configurable rule matrix supporting:
  - Document presence checks
  - Mandatory field validations
  - Document validity & expiration thresholds
  - Numeric financial ceilings and GPA floors
- Categorized outcomes: `PASSED`, `FAILED`, `WARNING`, `NOT_APPLICABLE`, `UNABLE_TO_EVALUATE`.
- Sample rules clearly labeled: *"Demonstration Rule — Not Legal Advice"*.

### D. Human-in-the-Loop Review
- Mandatory written justification and reason codes for all adverse and verification determinations.
- Immutable audit event logging with actor attribution, resource pointers, and timestamps.
- Downloadable ReportLab PDF verification reports stamped: *"AI-Assisted Preliminary Assessment"*.

---

## 5. Security & Legal Boundaries

1. **Preliminary Indicator Status**: Automated AI findings are decision-support indicators, not infallible legal determinations or proof of issuing authority authenticity.
2. **Adverse Action Safeguard**: No rejection or adverse determination may be issued solely by an automated AI score.
3. **Private File Storage**: Document binaries are stored in private, sandboxed filesystem storage and never exposed through public URLs.
