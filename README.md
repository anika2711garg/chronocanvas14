# ChronoCanvas

ChronoCanvas is a premium, wall-calendar inspired web app built with React and Vite. It combines a handcrafted visual style with practical planning tools such as date-range selection, smart notes, insights, and image/PDF export.

## Live Demo

Add your deployed URL here after publishing:

- Vercel Production Link: [Add your Vercel URL here](https://your-project-name.vercel.app)

## Table of Contents

- Overview
- Features
- Tech Stack
- Project Structure
- Getting Started
- Available Scripts
- Usage Guide
- Deployment (Vercel)
- Troubleshooting
- Future Improvements

## Overview

ChronoCanvas is designed to feel like a real hanging wall calendar while still being fully interactive. The UI emphasizes:

- A visual, handcrafted calendar experience
- Smooth month transitions and micro interactions
- Practical planning workflow (select dates, write notes, track events)
- Export-friendly output for sharing or printing

## Features

### Calendar Experience

- Month and year navigation
- Date selection (single date and range)
- Hover preview while selecting ranges
- Optional compact density mode
- Optional date disabling (past/future)
- Holiday indicators and tooltip cards

### Notes and Planning

- Context-aware notes by date or date range
- Smart note suggestions and tagging
- Priority and emoji support for quick categorization
- Local persistence using browser storage

### Insight and Productivity

- Upcoming events summary
- Busiest day calculation
- Planning streak tracking
- Timeline preview of stored events

### Export

- Export calendar as PNG
- Export calendar as PDF

### UI/UX

- Responsive layout for desktop, tablet, and mobile
- Seasonal and mood-based visual styling
- Hanging calendar header effect (string, nail, beam)

## Tech Stack

- React 19
- Vite 8
- Tailwind CSS 4
- Framer Motion
- date-fns
- Lucide React
- html-to-image
- jsPDF

## Project Structure

```text
chronocanvas/
	public/
	src/
		assets/
		components/
			CalendarGrid.jsx
			CalendarHeader.jsx
			ExperienceDock.jsx
			Header.jsx
			HeroSection.jsx
			NotesPanel.jsx
			WallCalendar.jsx
		App.css
		App.jsx
		index.css
		main.jsx
	eslint.config.js
	index.html
	package.json
	vite.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

1. Clone the repository.
2. Open a terminal in the project root.
3. Install dependencies:

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

Vite will print a local URL (usually `http://localhost:5173`). Open it in your browser.

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Create production build
- `npm run preview`: Preview production build locally
- `npm run lint`: Run ESLint checks

## Usage Guide

### Basic Flow

1. Navigate to the month/year you want.
2. Click a date to start selection.
3. Click another date to complete range selection.
4. Add notes from Notes Panel or Smart Notes.
5. Use Export actions to download PNG/PDF.

### Data Persistence

- Notes and events are stored in `localStorage`.
- Data remains available in the same browser unless manually cleared.

## Deployment (Vercel)

ChronoCanvas is fully compatible with Vercel and works as a static Vite deployment.

### Option 1: Deploy with Vercel Dashboard (Recommended)

1. Push your project to GitHub.
2. Sign in to Vercel.
3. Click New Project.
4. Import your GitHub repository.
5. Configure project settings:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

6. Click Deploy.
7. After deployment, copy the generated Vercel domain and paste it into the Live Demo section above.

### Option 2: Deploy with Vercel CLI

Install and deploy from terminal:

```bash
npm i -g vercel
vercel
```

For production deployment:

```bash
vercel --prod
```

### Local Production Check Before Deploy

Run a local production build to verify everything:

```bash
npm install
npm run build
npm run preview
```

### Vercel Notes for This Project

- No server runtime is required for this app.
- All features run on the client side.
- Notes/events persistence uses browser `localStorage`, so data is device/browser specific.

### Suggested Domain Setup (Optional)

After first deploy, you can:

- Keep default domain: `your-project-name.vercel.app`
- Add a custom domain from Vercel Project Settings > Domains

After deployment, update the link in the Live Demo section.

## Troubleshooting

### Dev Server Not Starting on a Specific Port

- If a port is busy, Vite may fail to start.
- Run `npm run dev` without forcing a port, or choose another port.

### Large Chunk Warning in Build

- This project may show chunk size warnings in production build output.
- It is non-blocking but you can reduce bundle size using dynamic imports and code splitting.

### Export Issues

- Export relies on browser rendering and canvas capture.
- For best results, wait for images/fonts to finish loading before exporting.

## Future Improvements

- Drag-and-drop event rescheduling
- Cloud sync and authentication
- Team collaboration calendars
- Recurring event engine
- Accessibility pass with keyboard-first navigation

## License

Add your preferred license here (for example MIT).
