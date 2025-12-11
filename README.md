# Finboard

A fully configurable, no-code API dashboard built using modern web technologies.
The system allows users to connect to **any REST API** and visualize live data dynamically in the form of **Cards, Tables, and Time-Series Charts** — without writing backend logic for each API.

This project follows professional software engineering principles:

* **Modular Architecture**
* **Separation of Concerns**
* **Reusable Hooks**
* **Scalable State Management**
* **Production-grade API Handling**

---

## ✨ Features

* Connect to **any REST API**
* Automatic API type detection
* Automatic JSON field extraction
* Card, Table, and Chart visualizations
* Drag-and-drop responsive widget layout
* Auto-refresh with configurable intervals
* Client-side caching with TTL
* Secure server-side API proxy (CORS-free)
* Rate-limit detection with retry support
* Import & Export dashboard configuration
* Light / Dark theme support
* Built-in API testing
* Full validation system for widgets

---

## 🛠 Tech Stack

| Category         | Technology           |
| ---------------- | -------------------- |
| Framework        | Next.js (App Router) |
| UI Library       | React                |
| State Management | Zustand              |
| Styling          | Tailwind CSS         |
| Charts           | Recharts             |
| Grid System      | React Grid Layout    |
| Networking       | Fetch + Server Proxy |
| Caching          | TTL In-Memory Cache  |

---

## 📁 Project Structure

```
src/
├── app/
│   └── api/
│       └── proxy/
│           └── route.js              # Secure API Proxy
│
├── components/
│   ├── Renderers/                    # Card, Table & Chart Renderers
│   ├── layout/
│   │   └── header/                   # Header, Theme, Import/Export
│   └── widgets/                      # Widget system & modal
│
├── lib/
│   ├── apiClient.js                  # Central API fetch engine
│   ├── cache.js                      # TTL cache system
│   ├── detectApiType.js              # API type detection
│   ├── extractJsonPaths.js           # Field extraction
│   └── parseApi.js                   # API normalization layer
│
├── store/
│   └── widgetStore.js                # Zustand persistent store
│
├── styles/
│   └── grid-layout.css
```

---

## 🔄 System Workflow

1. User enters API URL
2. API is tested via secure server proxy
3. JSON fields are automatically extracted
4. User selects display mode and fields
5. Widget gets created and stored
6. Data refreshes automatically with caching
7. Layout & configuration persist across reloads

---

## API Keys (Demo Only)

This project intentionally includes public demo API keys for assignment/testing purposes.
These keys are restricted, rate-limited, and non-sensitive.
In a real production environment, API keys must be stored securely on the server (environment variables) and never exposed in the client.

## ⚙️ Installation

```bash
git clone <repository-url>
cd <project-folder>
npm install
npm run dev
```

Open in browser:

```
http://localhost:3000
```

---

## 🔐 Environment Variables

Create **`.env.local`**:

```
PROXY_HOST_ALLOWLIST=api.example.com
PROXY_MAX_BODY=1048576
MAX_WIDGETS=25
```

---

## 📜 Scripts

```
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Linting
npm run format   # Code formatting
```

---

## 🛡 Security

* All API calls routed through server proxy
* Domain allow-listing supported
* Rate-limit detection enabled
* Payload size protection

---

## 📦 Import / Export

* Export dashboard configuration as JSON
* Import across systems
* Ideal for backups or sharing dashboards

---

## 📊 Visualization Rules

| Mode  | Requirement                        |
| ----- | ---------------------------------- |
| Card  | Works with any API structure       |
| Table | API response must contain an array |
| Chart | Only supports Alhpavantage time-series APIs     |

Charts auto-map:

* Open
* High
* Low
* Close
* Volume

You can use this api for charts - https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=MSFT&apikey={api_key}

---

## 🗂 State Management

* Zustand with persistence
* Widgets & layout stored in LocalStorage
* Layout survives refresh and reload

---

## ⚡ Caching

* TTL-based in-memory caching
* Auto cleanup every 60 seconds
* Per-API cache control
* Cache bypass option

---

## ❗ Error Handling

* User-friendly error messages
* HTTP status-based handling
* Retry-After support for rate limits
* Auth & permission error detection

---

## ⚙️ Setup & Run the Project (Full Guide)

### 1. Prerequisites

* Node.js (v18+)
* npm or yarn
* Git

Verify:

```
node -v
npm -v
git --version
```

### 2. Clone Repository

```
git clone <repository-url>
cd <project-folder>
```

### 3. Install Dependencies

```
npm install
```

### 4. Start Dev Server

```
npm run dev
```

### 5. Open in Browser

```
http://localhost:3000
```

### 6. Production Build

```
npm run build
npm run start
```

---

## 📄 License

**MIT License**
Free for academic, personal, and commercial use.

---

## 👤 Author

**Anshdeep Bansal**
🔗 GitHub: [https://github.com/AnshdeepBansal](https://github.com/AnshdeepBansal)

---
