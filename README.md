# Medicaid Frailty Assessment Application

A healthcare application designed to help Indiana Medicaid patients assess their eligibility for medical frailty exemptions and navigate the complexities of maintaining coverage.

## Overview

This platform leverages AI-powered assessments to predict medical frailty and generate personalized reports, guiding users through the process of understanding and maintaining their Medicaid coverage.

## Features

- **Health Assessment**: Comprehensive evaluation of health metrics including chronic conditions, medications, hospitalizations, mobility, and cognitive status
- **Frailty Scoring**: Automated calculation of medical frailty scores based on evidence-based criteria
- **Personalized Reports**: Detailed assessment reports with actionable recommendations and next steps
- **Tailored Guidance**: Context-aware resources and advice based on individual health profiles
- **User-Friendly Interface**: Intuitive design with clear navigation and accessible information

## Technology Stack

### Backend
- **Framework**: Encore.ts
- **Database**: PostgreSQL (managed by Encore)
- **Services**:
  - Assessment Service: Health metric collection and frailty scoring
  - Report Service: Report generation and management
  - Guidance Service: Resource delivery and personalization

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **State Management**: TanStack Query
- **Routing**: React Router

## Project Structure

```
/
├── backend/
│   ├── db/
│   │   ├── index.ts
│   │   └── migrations/
│   ├── assessment/
│   │   ├── encore.service.ts
│   │   ├── create.ts
│   │   ├── list.ts
│   │   └── get.ts
│   ├── report/
│   │   ├── encore.service.ts
│   │   ├── generate.ts
│   │   ├── list.ts
│   │   └── get.ts
│   └── guidance/
│       ├── encore.service.ts
│       ├── list.ts
│       └── personalized.ts
└── frontend/
    ├── App.tsx
    ├── components/
    │   └── Navigation.tsx
    └── pages/
        ├── LandingPage.tsx
        ├── DashboardPage.tsx
        ├── AssessmentPage.tsx
        ├── ReportPage.tsx
        └── GuidancePage.tsx
```

## User Journey

1. **Landing**: Introduction to Centauri Health Solutions and service overview
2. **Dashboard**: Central hub for accessing all features and viewing status
3. **Assessment**: Complete health questionnaire to evaluate medical frailty
4. **Report Generation**: Automatic generation of personalized assessment reports
5. **Guidance**: Access tailored resources and recommendations

## Database Schema

### Users Table
- Stores user profile information with string-based user_id (prepared for Clerk integration)
- Basic demographic and contact information

### Assessments Table
- Health metrics and responses
- Calculated frailty scores and risk levels
- Timestamped for tracking changes over time

### Reports Table
- Generated assessment reports
- Recommendations and next steps
- Linked to specific assessments

### Guidance Resources Table
- Categorized support resources
- Applicability criteria for personalization
- Priority-based ordering

## Frailty Scoring Algorithm

The frailty score is calculated based on:
- Number and severity of chronic conditions
- Medication count
- Recent hospitalization frequency
- Mobility limitations
- Cognitive impairment
- Activities of daily living (ADL) scores

Risk levels are categorized as:
- **Low** (score < 0.4): Minimal frailty indicators
- **Moderate** (0.4 ≤ score < 0.7): Some frailty concerns
- **High** (score ≥ 0.7): Significant frailty indicators

## Future Enhancements

- Integration with CLEAR API for identity verification
- AI-powered report generation with advanced natural language processing
- Healthcare provider portal for collaborative care
- Document upload and management for medical records
- Appeals assistance workflow
- Multi-language support
