# Loqta UI/UX Project Documentation

## Overview
Loqta is a modern, theme-aware e-commerce frontend built with Next.js, React, Redux Toolkit, Axios, and Tailwind CSS. It features robust authentication, a dynamic cart system, real-time chat, and a fully accessible UI.

---

## Tech Stack
- **Next.js 13+**: App directory, SSR/CSR, layouts, and routing.
- **React 18+**: Functional components, hooks, and client/server components.
- **Redux Toolkit**: State management for auth, cart, and theme.
- **Axios**: Custom instance for all API calls, with interceptors for auth and error handling.
- **Tailwind CSS**: Utility-first, theme-aware styling.
- **SweetAlert2**: User-friendly modals and notifications.

---

## Project Structure
```
src/
  app/           # Next.js app directory (pages, layouts, routing)
  components/    # Reusable UI components (Header, Footer, CartDrawer, etc.)
  features/      # Redux slices and feature logic (auth, cart, theme, api)
  hooks/         # Custom React hooks
  lib/           # Libraries (axios instance, etc.)
  styles/        # Global and theme CSS
  utils/         # Utility functions (error handling, etc.)
  store.ts       # Redux store setup
```

---

## Redux Deep Dive
- **Store Setup:**
  - Defined in `src/store.ts`.
  - Combines `auth`, `cart`, and `theme` slices.
  - Uses `preloadedState` for auth hydration from localStorage.
- **Slices:**
  - Each feature (auth, cart, theme) has its own slice in `src/features/`.
  - Slices use `createAsyncThunk` for async API calls.
- **Hydration:**
  - The `auth` slice uses a `hydrated` flag to prevent SSR/client mismatches.
  - The header and other components use this flag to avoid hydration errors.
- **Provider:**
  - Redux store is provided at the app root in `src/app/layout.tsx`.
- **Usage:**
  - Use `useSelector` and `useDispatch` in components to access and update state.

---

## Axios Deep Dive
- **Custom Instance:**
  - Defined in `src/lib/axios.ts`.
  - Sets base URL, timeout, and content type.
- **Interceptors:**
  - **Request:** Injects JWT access token from Redux or localStorage.
  - **Response:** Handles token refresh on 401, transforms error messages for UX.
- **Usage:**
  - All API calls (auth, cart, products) use this instance for consistency and error handling.

---

## Cart System
- **State:**
  - Managed in Redux (`src/features/cart/cartSlice.ts`).
  - Cart is an array of flat `CartItem` objects, normalized from backend responses.
- **Persistence:**
  - Cart is fetched on header mount (if authenticated/hydrated) and when the cart drawer opens.
  - Ensures badge and drawer are always up to date, even after refresh.
- **UI:**
  - `CartDrawer` displays items, allows removal, and shows total.
  - Header badge shows real-time item count.
- **API:**
  - Endpoints: `/api/v1/cart/`, `/add/`, `/remove/`, `/clear/`.
  - Cart data is normalized from `{ items: [{ product, quantity, ... }] }` to flat objects.

---

## Authentication
- **JWT Auth:**
  - Registration, login, and token refresh handled via Redux thunks and Axios.
- **Hydration Guard:**
  - Header and protected pages use `hydrated` flag to prevent UI flicker and hydration errors.
- **Protected Routes:**
  - Redirects unauthenticated users to login as needed.

---

## Theming & Accessibility
- **Tailwind CSS:**
  - All UI uses semantic, theme-aware classes (e.g., `text-zinc-900` in light, `text-white` in dark).
- **Theme Slice:**
  - Redux slice manages theme state; `ThemeSwitcher` toggles theme.
- **Contrast & Readability:**
  - Header, hero, nav, and buttons use high-contrast colors and drop shadows.
- **Accessibility:**
  - Keyboard navigation, focus rings, ARIA labels, and color contrast are all considered.

---

## Error Handling
- **Centralized:**
  - All API errors are handled and transformed in `src/lib/axios.ts` and `src/utils/errorHandler.ts`.
  - User-friendly error messages are shown in the UI.

---

## How to Extend
- **Add a Feature:**
  1. Create a new slice in `src/features/`.
  2. Add async thunks for API calls.
  3. Add UI components in `src/components/`.
  4. Connect to Redux using `useSelector`/`useDispatch`.
- **Add an API Endpoint:**
  1. Add a thunk in the relevant slice.
  2. Use the Axios instance for requests.
  3. Handle errors and normalize data as needed.

---

## Running the Project
1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
2. **Configure environment:**
   - Create a `.env.local` file with:
     ```
     NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
     ```
   - Adjust the URL to match your backend.
3. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
4. **Build for production:**
   ```bash
   npm run build && npm start
   # or
   yarn build && yarn start
   ```

---

## Developer Notes
- **Redux Store:** See `src/store.ts` for store setup and preloaded state.
- **Cart Slice:** See `src/features/cart/cartSlice.ts` for cart logic and normalization.
- **Header:** See `src/components/Header.tsx` for hydration guard and cart badge logic.
- **Hero Section:** See `src/app/page.tsx` for theme-aware hero styles.
- **API Integration:** All API calls use the Axios instance in `src/lib/axios.ts`.
- **Contributing:**
  1. Fork the repo
  2. Create a feature branch
  3. Commit and push your changes
  4. Open a pull request

---

For backend/API details, see `AUTHENTICATION.md`. 