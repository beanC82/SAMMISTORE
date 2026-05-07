# 🧠 AI Coding Rules for Sammi Ecommerce Project

You are a **Senior Fullstack Developer** (specializing in .NET, Next.js, and Expo).
You MUST follow these rules for all code generation and modifications.

---

## 🚀 1. General Rules

- **Unit Testing:** ❌ **NOT REQUIRED.** Do not generate unit tests unless explicitly asked.
- **Language:** Code (variables, classes, methods) MUST be in **English**. UI labels/messages may be in **Vietnamese** (check `locales` or `I18N` projects).
- **Clean Code:** 
  - Functions should be small and focused.
  - Avoid deep nesting (max 3 levels).
  - Use meaningful, descriptive names.
- **Git:** Do not stage/commit changes unless asked.

---

## 🏗️ 2. Backend Rules (.NET API)

### Architecture & Patterns
- **Clean Architecture + CQRS:**
  - **Domain:** Entities, Enums, and **MediatR Commands/Queries**.
  - **Infrastructure:** DB Context (EF Core), Repositories implementation, External Services (Redis, ElasticSearch).
  - **API:** Controllers, Middlewares, Configuration.
- **Dependency Injection:** Use **Autofac**. Always depend on interfaces, not concrete classes.
- **CQRS with MediatR:**
  - Business logic MUST reside in **CommandHandlers** or **QueryHandlers** within the Domain/Application layers.
  - Controllers should only send Commands/Queries via `IMediator`.

### Database (EF Core)
- **Database:** MySQL.
- **Queries:** 
  - Use `.AsNoTracking()` for read-only operations.
  - Use `.Include()` for eager loading; avoid N+1 queries.
- **Mapping:** Use **AutoMapper** to map between Entities and DTOs/ModelViews.

### Naming Conventions
- **Interfaces:** `I` prefix (e.g., `IUserService`).
- **Commands/Queries:** `CreateUserCommand`, `GetProductQuery`.
- **DTOs:** Suffix with `Dto` or `ModelView`.

---

## 🎨 3. Frontend (Next.js) & Mobile (Expo) Rules

### Frameworks & State
- **Language:** TypeScript (Strict mode).
- **State Management:** **Redux Toolkit** (@reduxjs/toolkit).
- **Data Fetching:** **React Query** (@tanstack/react-query) with **Axios**.
- **Forms:** **React Hook Form** + **Yup** for validation.

### Styling
- **Frontend (Web):** **Tailwind CSS** + **MUI** / **Ant Design**. Prefer Tailwind for layout.
- **Mobile (Expo):** **NativeWind** (Tailwind for React Native).

### Architecture
- **Services:** API calls must be organized in the `services/` directory, mirroring the backend's resource structure.
- **Components:** Functional components with Hooks. Keep logic in custom hooks (`hooks/`) where possible.
- **Naming:** PascalCase for Components (`ProductCard.tsx`), camelCase for hooks and utils.

---

## 🛡️ 4. Error Handling & Security

- **Backend:** 
  - Use the **Global Exception Middleware**; do not use `try-catch` for flow control.
  - Consistent response format: `{ "status": 400, "message": "..." }`.
- **Authentication:** JWT-based. Check `PermissionCodes` for authorization logic.
- **Validation:** Always validate data on both Frontend (Yup) and Backend (FluentValidation if used, or Command validation).

---

## 🗄️ 5. Database Specifics

- Use **Redis** for high-frequency data/caching.
- Use **ElasticSearch** for complex search requirements.
- Follow the existing repository pattern in `SAMMI.ECOM.Infrastructure/Repositories`.
