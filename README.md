# Geo.RC

A modern geospatial analysis and parcel management web application built with React, TypeScript, Vite, Tailwind CSS, Leaflet, and FastAPI.

## Features

- **Interactive Geospatial Map**: Leaflet-based map visualization with parcels, pins, and drone surveys.
- **Change Detection**: Automated spatial and area change detection with detailed reporting.
- **Parcel Management**: View, filter, analyze, and manage land parcels.
- **Drone Survey Integration**: Survey visualization and telemetry processing.
- **Export Capabilities**: Export data in multiple formats (GeoJSON, CSV, PDF reports).
- **Authentication**: Firebase Authentication for secure user and admin access.
- **Backend API**: Python FastAPI backend for high-performance spatial processing.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React, React Leaflet, Turf.js
- **Backend**: FastAPI, Python 3.10+, Shapely, GeoPandas
- **Auth & Database**: Firebase / Firestore

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### Frontend Setup
```bash
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## License
MIT
