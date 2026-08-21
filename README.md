# Talent Connect Pro

Build a Professional Consultancy & Recruitment Website

Build a modern, professional, production-ready corporate consultancy and recruitment website for a company that provides consultancy, staffing, recruitment, and talent services to large organizations.

The website must have two completely separate experiences:

Public Website — accessible to everyone without login.

Secure Admin Portal — accessible only to authorized administrators.

The candidate/customer must NEVER be required to create an account or log in.

1. Overall Objective

Create a premium corporate website where:

Visitors can learn about the company.

Visitors can browse all current job openings.

Visitors can search and filter jobs.

Visitors can open a detailed job description.

Visitors can click Apply Now.

Each job can have its own configurable Google Form.

Clicking Apply Now should open the Google Form configured for that specific job.

Candidates do not need to register or log in.

Admins can create, edit, publish, close, and archive jobs.

Admins can configure a different Google Form for every job.

Applications submitted through the recruitment process should generate email notifications.

Application information should be available to administrators.

Admins should be able to manage candidate/application status.

The website must be responsive and look excellent on desktop, tablet, and mobile.

The final product should look like a real professional consultancy/recruitment company website, NOT like a basic template or CRUD application.

2. Recommended Technology

Use the following stack where supported:

Frontend:

Next.js

React

TypeScript

Tailwind CSS

shadcn/ui

Backend:

Supabase

Database:

PostgreSQL

Authentication:

Supabase Auth for administrators only

Storage:

Supabase Storage where required

Email:

Resend or SendGrid

Hosting:

Vercel

Forms:

Google Forms initially

Architecture must be modular so Google Forms can later be replaced by an internal application form.

3. Brand & Visual Design

Create a premium B2B corporate design.

Design characteristics:

Clean

Modern

Professional

Trustworthy

Minimal

Corporate

Premium

Spacious

Excellent typography

Smooth animations

Strong visual hierarchy

Do NOT make it look like a generic job-board website.

Use:

Professional navigation

Large hero section

High-quality cards

Subtle shadows

Rounded corners

Clean icons

Smooth hover effects

Professional CTA buttons

Responsive layouts

Excellent spacing

Use a consistent design system throughout the entire application.

The design must work perfectly in:

Desktop

Laptop

Tablet

Mobile

4. Public Website Navigation

Create the following main navigation:

Home

About Us

Services

Industries

Careers

Contact Us

Header should also contain a strong CTA such as:

Talk to Us

The admin portal should NOT appear as a prominent public navigation item.

5. HOME PAGE

Create a premium corporate homepage.

Hero Section

Headline:

"Connecting Exceptional Talent With Leading Organizations"

Supporting text:

"We help organizations build high-performing teams through trusted consulting, staffing, recruitment, and talent solutions."

Buttons:

Explore Opportunities

Partner With Us

Use a professional background/visual treatment.

6. About Company Section

Include:

Who We Are

Explain that the company provides professional consultancy, staffing, recruitment, and talent solutions to organizations.

Include statistics such as:

Years of Experience

Professionals Placed

Enterprise Clients

Successful Projects

Make these values configurable later.

7. SERVICES SECTION

Create professional service cards.

Example services:

Talent Consulting

Helping organizations identify and acquire the right talent.

IT Consulting

Providing skilled technology professionals and consulting expertise.

Contract Staffing

Flexible staffing solutions for short-term and long-term requirements.

Recruitment

End-to-end recruitment and talent acquisition.

Staff Augmentation

Providing specialized professionals to strengthen existing teams.

Managed Services

Flexible workforce and technology solutions.

Each service should have:

Icon

Title

Short description

Learn More

8. INDUSTRIES SECTION

Create an industries section.

Example:

Information Technology

Banking & Financial Services

Healthcare

Retail

Manufacturing

Telecommunications

Insurance

Consulting

Use professional cards/icons.

9. WHY CHOOSE US

Create a premium section highlighting:

Experienced Professionals

Enterprise-Focused Solutions

Fast Talent Deployment

Quality-Driven Recruitment

Industry Expertise

Long-Term Partnerships

Use icons and short descriptions.

10. CAREERS PREVIEW ON HOME PAGE

Display the latest active job openings.

Heading:

"Explore Career Opportunities"

Display 3–6 latest jobs.

Each card should show:

Job Title

Location

Work Mode

Experience

Employment Type

Important skills

Button:

View Job

Also include:

View All Jobs

Only jobs with status = ACTIVE should appear publicly.

11. HIRING PROCESS

Create a visual four/five-step process:

Explore Opportunities

Submit Application

Application Review

Interview

Selection

Make this visually attractive.

12. CLIENT / PARTNER SECTION

Create an optional section for:

"Trusted By Leading Organizations"

Allow company/client logos to be added later.

Do not invent real client logos.

Use placeholder logos or neutral placeholders until actual company logos are provided.

13. CONTACT SECTION

Create a professional contact section.

Fields:

Name

Email

Phone

Company

Message

Button:

Send Inquiry

Also display:

Email

Phone

Office location

Business hours

Make these configurable.

14. CAREERS / JOB PORTAL

Create a dedicated:

/careers

page.

This is one of the most important sections.

Heading:

"Find Your Next Opportunity"

Subheading:

"Explore current opportunities and take the next step in your career."

15. JOB SEARCH

Add a professional search/filter interface.

Search by:

Job Title

Skill

Keyword

Filters:

Location

Experience

Work Mode

Employment Type

Department

Example:

Search:

[ Search job title, skills or keywords ]

Location:

[ All Locations ▼ ]

Experience:

[ All Experience Levels ▼ ]

Work Mode:

[ All ▼ ]

Employment Type:

[ All ▼ ]

Button:

Search Jobs

Also provide:

Clear Filters

16. JOB CARDS

Each job card should display:

Job title

Location

Work mode

Experience

Employment type

Department

Skills

Posted date

Buttons:

View Job

Do not show closed or archived jobs.

17. JOB DETAILS PAGE

Create dynamic job detail pages.

Recommended URL:

/careers/[job-slug]

Example:

/careers/software-qa-engineer-bangalore

Display:

Software QA Engineer

Location:
Bangalore

Experience:
2–5 Years

Work Mode:
Hybrid

Employment Type:
Full Time

Department:
Engineering

Skills:
Java, Selenium, API Testing, SQL

Then sections:

Job Description

Responsibilities

Requirements

Preferred Qualifications

Benefits

About the Role

At the bottom display a prominent:

APPLY NOW

button.

18. GOOGLE FORM INTEGRATION

This is extremely important.

Every job must support its own Google Form URL.

Database field:

google_form_url

Example:

Job A → Google Form A

Job B → Google Form B

Job C → Google Form C

When candidate clicks:

APPLY NOW

open the Google Form configured for that specific job.

Use a new browser tab where appropriate.

If no Google Form is configured, do NOT show a broken button.

Instead display an appropriate message or allow the admin to configure the form.

19. NO CANDIDATE LOGIN

There must be:

NO:

Candidate registration

Candidate login

Candidate password

Candidate account

Candidate dashboard

Candidate workflow:

Website → Careers → Job → Apply → Google Form → Submit

Keep the process extremely simple.

20. ADMIN PORTAL

Create a completely separate secure admin portal.

Recommended URL:

/admin

Admin must authenticate before accessing any admin page.

Use Supabase Authentication.

21. ADMIN LOGIN PAGE

Create a professional login page.

Fields:

Email

Password

Buttons:

Sign In

Forgot Password

Include:

Secure authentication

Validation

Error messages

Loading state

Logout functionality

Never expose admin credentials in frontend code.

22. ADMIN DASHBOARD

After login:

/admin/dashboard

Display:

Statistics

Total Jobs

Active Jobs

Draft Jobs

Closed Jobs

Total Applications

New Applications

Create attractive dashboard cards.

23. ADMIN SIDEBAR

Admin navigation:

Dashboard

Jobs

Applications

Forms

Settings

Profile

Logout

Use a collapsible responsive sidebar.

24. JOB MANAGEMENT

Create:

/admin/jobs

Display all jobs in a professional data table.

Columns:

Job Title

Location

Experience

Status

Google Form

Created Date

Updated Date

Actions

Actions:

View

Edit

Duplicate

Publish

Unpublish

Close

Archive

Delete

Use confirmation dialogs before destructive actions.

25. ADD NEW JOB

Create:

/admin/jobs/new

Form fields:

Basic Information

Job Title *
Job Code
Department
Location
Work Mode
Employment Type

Experience

Minimum Experience
Maximum Experience

Compensation

Salary / Compensation

Job Content

Short Description
Full Job Description
Responsibilities
Requirements
Preferred Qualifications
Benefits

Skills

Allow multiple skills/tags.

Application

Google Form URL

Publishing

Status:

Draft

Active

Closed

Archived

Buttons:

Save Draft

Publish Job

26. EDIT JOB

Admin should be able to edit every field.

Changes should immediately reflect on the public website for active jobs.

Show:

Created At

Updated At

Last Updated By

27. GOOGLE FORM MANAGEMENT

Create a dedicated Forms section.

Admin should be able to:

Add Google Form

Edit Google Form

Delete Google Form

Assign form to job

Preview form URL

Open form

Example:

Form Name:

"QA Engineer Application"

Google Form URL:

[________________________]

Assigned Jobs:

QA Engineer

Save.

Allow the same Google Form to optionally be reused across multiple jobs.

28. APPLICATION MANAGEMENT

Create:

/admin/applications

Display applications in a professional table.

Columns:

Candidate Name

Email

Phone

Applied Job

Submitted Date

Status

Actions

Statuses:

New

Under Review

Shortlisted

Interview

Selected

Rejected

Add filters:

Job

Status

Date

Search candidate

29. APPLICATION DETAILS

Clicking an application should open detailed information.

Display:

Candidate Name

Email

Phone

Location

Experience

Skills

Applied Job

Application Date

Resume if available

Source

Status

Admin Notes

Application History

30. APPLICATION STATUS WORKFLOW

Implement:

New

↓

Under Review

↓

Shortlisted

↓

Interview

↓

Selected

OR

Rejected

Allow admins to change status.

Store status history.

Example:

New → Under Review

Changed by:
Admin

Date:
21 Aug 2026

31. ADMIN NOTES

Admin should be able to add private notes.

Example:

"Candidate has strong Java and Selenium experience. Schedule technical interview."

Notes must NOT be visible to candidates.

32. EMAIL NOTIFICATIONS

Whenever a new application is received, send an email notification to the configured recruitment/admin email.

Example:

Subject:

"New Job Application – QA Automation Engineer"

Email should include:

Candidate Name

Candidate Email

Job Applied For

Application Date

Link to Admin Application

Also create optional email notifications for:

New application

Candidate shortlisted

Interview

Selected

Make these configurable.

33. GOOGLE FORM RESPONSE INTEGRATION

Initially support Google Forms/Google Sheets as the application collection mechanism.

Preferred workflow:

Candidate

↓

Google Form

↓

Google Form Response

↓

Google Sheet

↓

Integration / automation

↓

Application Database

↓

Admin Dashboard

↓

Email Notification

Design the architecture so this integration can later be replaced by an internal website application form without redesigning the entire system.

34. DATABASE DESIGN

Use PostgreSQL/Supabase.

Create at minimum:

admins

Fields:

id
name
email
role
created_at
updated_at

jobs

Fields:

id
job_code
title
slug
department
location
work_mode
employment_type
experience_min
experience_max
salary
short_description
description
responsibilities
requirements
preferred_qualifications
benefits
skills
google_form_url
status
created_at
updated_at
created_by
updated_by

applications

Fields:

id
job_id
candidate_name
email
phone
location
experience
skills
resume_url
source
status
notes
submitted_at
updated_at

application_events

Fields:

id
application_id
old_status
new_status
changed_by
created_at

forms

Fields:

id
name
google_form_url
description
status
created_at
updated_at

35. SECURITY

Implement proper security.

Requirements:

HTTPS

Secure authentication

Supabase Row Level Security

Role-based admin access

Protected admin routes

Secure API endpoints

Input validation

XSS protection

SQL injection protection

Rate limiting where applicable

Secure file uploads

Secure environment variables

No secrets in frontend

Audit logs

Proper logout

Session expiration

Candidates should never have access to admin functionality.

36. SEO

Make the public website SEO-friendly.

Implement:

Proper page titles

Meta descriptions

Open Graph metadata

Semantic HTML

Sitemap

Robots.txt

Structured data where appropriate

SEO-friendly job URLs

Fast page loading

Each job page should have unique SEO metadata.

37. PERFORMANCE

Optimize:

Image loading

Lazy loading

Database queries

API requests

Bundle size

Server-side rendering where useful

Caching where appropriate

Target excellent Lighthouse scores.

38. RESPONSIVE DESIGN

Everything must work perfectly on:

Desktop

Laptop

Tablet

Mobile

Pay special attention to:

Navigation

Job cards

Search filters

Admin tables

Admin sidebar

Forms

Buttons

Modals

On mobile, convert complex tables into responsive cards where necessary.

39. ERROR STATES

Implement professional error handling.

Examples:

No jobs found:

"No opportunities match your search criteria."

No application:

"No applications found."

Missing Google Form:

"Applications are currently unavailable for this position."

404:

"Page not found."

Server error:

"Something went wrong. Please try again."

Every loading state should have a proper skeleton/loading indicator.

40. EMPTY STATES

Don't leave blank screens.

Use helpful empty states such as:

"No active jobs available right now."

"Applications will appear here once candidates apply."

"No forms configured yet."

41. ADMIN UX

The admin portal should feel like a modern SaaS dashboard.

Use:

Sidebar

Dashboard cards

Tables

Filters

Search

Pagination

Dropdown menus

Modal dialogs

Toast notifications

Confirmation dialogs

Loading states

Empty states

42. AUDIT LOGGING

Track important admin actions.

Examples:

Admin created job

Admin edited job

Admin published job

Admin closed job

Admin changed application status

Admin deleted job

Store:

Action

User

Timestamp

Affected record

43. SETTINGS

Create an admin Settings page.

Allow configuration of:

Company Name

Company Logo

Company Email

Recruitment Email

Phone

Address

Social Media Links

Default Application Email

Email Notification Settings

Website SEO settings

44. COMPANY CONTENT SHOULD BE CONFIGURABLE

Do not hard-code everything.

Where practical, make the following configurable:

Company information

Contact information

Jobs

Services

Industries

Job application forms

Social media links

Email addresses

45. SAMPLE DATA

Create realistic sample jobs for development/testing only.

Examples:

Software QA Engineer

Senior Java Developer

Data Analyst

SAP Consultant

DevOps Engineer

Business Analyst

Mark sample jobs clearly so they can easily be removed later.

Do not use fake client logos as real companies.

46. MAIN USER WORKFLOW

Implement exactly this candidate workflow:

HOME

↓

CAREERS

↓

SEARCH JOBS

↓

SELECT JOB

↓

VIEW JOB DETAILS

↓

CLICK APPLY NOW

↓

OPEN CONFIGURED GOOGLE FORM

↓

CANDIDATE FILLS FORM

↓

SUBMITS

↓

APPLICATION RECEIVED

↓

ADMIN EMAIL NOTIFICATION

↓

APPLICATION AVAILABLE IN ADMIN DASHBOARD

47. ADMIN WORKFLOW

Implement:

ADMIN LOGIN

↓

DASHBOARD

↓

JOBS

↓

ADD JOB

↓

ENTER JOB INFORMATION

↓

ADD GOOGLE FORM URL

↓

SAVE DRAFT

OR

PUBLISH

↓

JOB APPEARS ON WEBSITE

↓

CANDIDATE APPLIES

↓

APPLICATION RECEIVED

↓

ADMIN EMAIL

↓

APPLICATION DASHBOARD

↓

REVIEW CANDIDATE

↓

CHANGE STATUS

↓

ADD NOTES

↓

SHORTLIST / INTERVIEW / SELECT / REJECT

48. Important Architecture Rule

Do NOT tightly couple the public website directly to Google Forms.

The job database should store the application configuration.

Example:

jobs table:

job_id:
123

title:
QA Automation Engineer

application_method:
google_form

google_form_url:
https://forms.google.com/xxxxx

Later it should be possible to change:

application_method:

google_form

to:

internal_form

without changing the public job page.

49. Admin Dashboard Example

Create a dashboard similar to:

ADMIN DASHBOARD

Welcome back, Admin

[ Total Jobs: 24 ]
[ Active Jobs: 18 ]
[ Applications: 846 ]
[ New Applications: 32 ]

Recent Applications

Candidate Job Status
Rahul Kumar QA Engineer New
Anil Sharma Java Developer Review
Priya Shetty Data Analyst Shortlisted

Recent Jobs

QA Engineer Active
Java Developer Active
SAP Consultant Draft

50. Final Quality Requirement

The final website must NOT feel like an AI-generated demo.

It must feel like a real enterprise consultancy company website.

Prioritize:

Professional visual design

Clean UX

Security

Performance

Maintainability

Scalability

Accessibility

SEO

Mobile responsiveness

Use reusable components.

Use clean folder structure.

Use TypeScript types.

Use proper error handling.

Do not duplicate code unnecessarily.

Do not hard-code job listings.

Jobs must come from the database.

The admin dashboard must control what appears publicly.

51. Build Order

Build the application in this order:

Phase 1

Create project structure and design system.

Phase 2

Build public corporate website.

Phase 3

Build Careers/job listing system.

Phase 4

Build dynamic job details pages.

Phase 5

Implement Google Form configuration.

Phase 6

Build secure admin authentication.

Phase 7

Build admin dashboard.

Phase 8

Build job management.

Phase 9

Build application management.

Phase 10

Implement email notifications.

Phase 11

Implement security/RLS.

Phase 12

Implement SEO.

Phase 13

Implement responsive design.

Phase 14

Testing and bug fixing.

Phase 15

Production deployment.

52. Final Deliverable

The finished system should provide:

PUBLIC:

Home
About
Services
Industries
Careers
Job Search
Job Details
Google Form Application
Contact
Privacy Policy
Terms

ADMIN:

Secure Login
Dashboard
Job Management
Add Job
Edit Job
Publish/Close Job
Google Form Management
Application Management
Candidate Details
Application Status
Admin Notes
Email Notifications
Settings
Logout

The candidate should never need an account.

The admin should have complete control over jobs and application configuration.

Build this as a scalable production-ready application rather than a static prototype.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/08c3b8d5-8d8b-4a4a-9821-213e6d9f16e7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
