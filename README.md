# Todo Application Frontend (Angular 21)

This is the frontend user interface for the Angular + .NET Todo Application. It is built as a single-page application (SPA) using Angular 21, incorporating modern development patterns such as standalone components, Angular Signals, and the `inject` API.

---

## 🚀 Key Features

* **Modern Reactive State**: Uses Angular **Signals** (`signal`, `computed`) for reactive state management, auth tracking, and todo status updates.
* **Component Design**: Developed entirely with Angular Material components for premium, responsive layouts.
* **Todo Management Dashboard**:
  * Real-time search and status filtering (All, Pending, Completed).
  * Interactive task addition/editing via dynamic dialog components.
  * Task complete/incomplete toggling with animated transitions.
* **Security Middleware Interceptor**:
  * Custom functional HTTP interceptor (`jwtInterceptor`) that automatically injects stored JWT tokens into outbound API requests.
* **Auth Guarding**: Route guards prevent unauthenticated users from accessing the dashboard, redirecting them to the login screen.

---

## 🔒 Security Implementations

* **XSS Sanitization**: Leverages Angular’s built-in context-aware HTML escaping. Payloads containing executable scripts (e.g., `<script>`, `onerror` handlers) are automatically treated as inert strings and rendered safely as text.
* **Route Protection**: Client-side `authGuard` checks session state on page routing to ensure unauthorized requests are rejected locally before network calls are fired.

---

## 🛠️ Technology Stack

* **Framework**: Angular 21.2 (Standalone Component architecture)
* **Styling & UI**: Angular Material 21.2 & SCSS
* **Reactivity**: RxJS 7.8 & Angular Signals
* **Testing**: Vitest 4.0 (integrated via Angular CLI unit-testing builder)

---

## 📂 Project Structure

```
todo-azure-frontend/
├── src/
│   ├── app/
│   │   ├── components/      # UI Components (login, register, dashboard, todo-dialog)
│   │   ├── guards/          # Route Protection (auth.guard.ts)
│   │   ├── interceptors/    # HTTP Request Middleware (jwt.interceptor.ts)
│   │   ├── models/          # TypeScript Data Interfaces (auth.model.ts, todo.model.ts)
│   │   ├── services/        # Service Layer & State Managers (auth.service.ts, todo.service.ts)
│   │   ├── app.config.ts    # Application dependency injections and routing setup
│   │   ├── app.routes.ts    # Frontend application page routes
│   │   └── app.ts           # Root application bootstrap component
│   ├── public/              # Static assets and icons
│   ├── styles.scss          # Core global style sheet
│   └── main.ts              # Main entry point
├── angular.json             # Angular CLI workspace settings
├── proxy.conf.json          # Dev API proxy settings
├── tsconfig.json            # TypeScript settings (configured with moduleResolution: bundler)
└── package.json             # Dependencies & dev scripts
```

---

## ⚙️ Local Development

### 1. Install Dependencies
Run the following command in the `todo-azure-frontend` directory:
```bash
npm install
```

### 2. Configure Proxy (Local Development)
The frontend communicates with the backend API via relative paths (e.g., `/api/auth/login`).
We have configured a `proxy.conf.json` in the project root to forward `/api` requests to the local backend service running on port 5033:
```json
{
  "/api": {
    "target": "http://localhost:5033",
    "secure": false,
    "logLevel": "debug"
  }
}
```

### 3. Run Development Server
Start the Angular dev server:
```bash
npm start
```
Open your browser and navigate to `http://localhost:4200/`.

---

## 🧪 Unit Testing Suite

The frontend contains **47 unit tests** checking components, services, interceptors, and guards. The project uses the modern **Vitest** test runner configured directly inside the Angular builder pipeline.

### Run Unit Tests
To run all tests, execute:
```bash
npm run test
```

### Coverage Breakdown
* **Services (`auth.service.spec.ts`, `todo.service.spec.ts`)**: Tests logins, signups, token localstorage lifecycle, and CRUD API calls.
* **Guards & Interceptors (`auth.guard.spec.ts`, `jwt.interceptor.spec.ts`)**: Validates protected routes redirection and verifies header token injection logic.
* **Components (`login.component.spec.ts`, `register.component.spec.ts`, `dashboard.component.spec.ts`, `todo-dialog.component.spec.ts`)**: Tests form validity states, submission routines, welcome-text rendering, list displays, and dialog triggers.
