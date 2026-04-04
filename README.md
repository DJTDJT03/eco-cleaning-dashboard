# Eco Cleaning Systems Dashboard

A comprehensive single-page dashboard for managing construction cleaning operations. Built entirely with vanilla HTML, CSS, and JavaScript -- no build tools or frameworks required.

## Features

- **Dashboard** -- Overview with stats, alerts, pipeline view, activity log, and weekly summary
- **Clients** -- Full client management with multiple contacts, sites, and regions
- **Jobs** -- Job tracking with status pipeline (pending, in progress, completed)
- **Invoices & Quotes** -- Create, edit, print invoices and quotes with VAT/CIS support, bulk status updates, and CSV export
- **Weekly Schedule** -- Recurring booking management with calendar view
- **Tenders** -- Tender tracking with variations, retention, and document management
- **Reports** -- Revenue, job, and client reporting with date filters
- **Pay Sheet** -- Sub-contractor invoice management with weekly pay tracking
- **Staff** -- Employee records and management
- **Sub-Contractors** -- Sub-contractor profiles with certification tracking, auto-profile creation from invoice upload, and CSV export
- **Settings** -- Company details, bank info, invoice defaults, RAMS templates, company certifications, data import/export, and system integrity checks
- **Quick Actions** -- Floating action bar for rapid creation of invoices, jobs, and clients
- **Keyboard Shortcuts** -- Navigate sections and create records without touching the mouse
- **Notification Badges** -- Real-time count badges on sidebar nav for overdue invoices, pending payments, expired certs, and pending tenders
- **Auto-Save Indicator** -- Visual confirmation whenever data is saved
- **Welcome Onboarding** -- First-run welcome screen for new users
- **Print-Optimized** -- Enhanced print stylesheet for invoices, pay sheets, and reports

## How to Use

Simply open `index.html` in any modern web browser. No server or installation required.

## Data Storage

All data is stored in the browser's localStorage. Use the Export/Import feature in Settings to back up or transfer your data.

## Technology

- Vanilla HTML, CSS, and JavaScript (single file, no build step)
- [SheetJS](https://sheetjs.com/) for Excel file parsing
- [PDF.js](https://mozilla.github.io/pdf.js/) for PDF document parsing
