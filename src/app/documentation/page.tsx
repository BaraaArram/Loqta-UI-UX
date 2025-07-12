// To use this page, install:
// npm install react-markdown remark-gfm react-syntax-highlighter
"use client";
import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";
import "@/styles/docs-theme.css";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { login, logout } from "@/features/auth/authSlice";

const documentation = [
  '# Loqta UI/UX Documentation',
  '',
  '---',
  '',
  '## Introduction',
  'Loqta UI/UX is a modern, themeable e-commerce frontend built with Next.js, React, Redux Toolkit, Axios, and Tailwind CSS. It features robust authentication, a dynamic cart system, real-time chat, and a fully accessible UI. This documentation covers architecture, best practices, and code examples for developers.',
  '',
  '---',
  '',
  '## Tech Stack',
  '',
  '| Technology      | Purpose                                 |',
  '|-----------------|-----------------------------------------|',
  '| Next.js 13+     | Routing, SSR/CSR, layouts, app structure|',
  '| React 18+       | UI components, hooks, state             |',
  '| Redux Toolkit   | State management (auth, cart, theme)    |',
  '| Axios           | API calls, interceptors, error handling |',
  '| Tailwind CSS    | Utility-first, theme-aware styling      |',
  '| SweetAlert2     | User-friendly modals/notifications      |',
  '',
  '---',
  '',
  '## Project Structure',
  '```',
  'src/',
  '  app/           # Next.js app directory (pages, layouts, routing)',
  '  components/    # Reusable UI components (Header, Footer, CartDrawer, etc.)',
  '  features/      # Redux slices and feature logic (auth, cart, theme, api)',
  '  hooks/         # Custom React hooks',
  '  lib/           # Libraries (axios instance, etc.)',
  '  styles/        # Global and theme CSS',
  '  utils/         # Utility functions (error handling, etc.)',
  '  store.ts       # Redux store setup',
  '```',
  '',
  '---',
  '',
  '## State Management (Redux Toolkit)',
  '',
  '### Store Setup',
  '```ts',
  '// src/store.ts',
  'import { configureStore } from "@reduxjs/toolkit";',
  'import authReducer from "./features/auth/authSlice";',
  'import cartReducer from "./features/cart/cartSlice";',
  'import themeReducer from "./features/theme/themeSlice";',
  '',
  'const store = configureStore({',
  '  reducer: { auth: authReducer, cart: cartReducer, theme: themeReducer },',
  '  preloadedState: { auth: getInitialAuthState() },',
  '});',
  'export type RootState = ReturnType<typeof store.getState>;',
  'export type AppDispatch = typeof store.dispatch;',
  'export default store;',
  '```',
  '',
  '### Example: Redux Slice with Async Thunks',
  '```ts',
  '// src/features/cart/cartSlice.ts (excerpt)',
  'import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";',
  'import axios from "../../lib/axios";',
  '',
  'export const fetchCart = createAsyncThunk("cart/fetchCart", async (_, { rejectWithValue }) => {',
  '  const res = await axios.get("/api/v1/cart/");',
  '  return normalizeCartItems(res.data.data.items);',
  '});',
  '',
  'const cartSlice = createSlice({',
  '  name: "cart",',
  '  initialState,',
  '  reducers: {},',
  '  extraReducers: (builder) => {',
  '    builder.addCase(fetchCart.fulfilled, (state, action) => {',
  '      state.cart = action.payload;',
  '    });',
  '  },',
  '});',
  'export default cartSlice.reducer;',
  '```',
  '',
  '### Hydration Guard Example',
  '```tsx',
  '// src/components/Header.tsx (excerpt)',
  'const hydrated = useSelector((state: RootState) => state.auth.hydrated);',
  'if (!hydrated) return null;',
  '```',
  '',
  '---',
  '',
  '## API Layer (Axios)',
  '',
  '### Axios Instance & Interceptors',
  '```ts',
  '// src/lib/axios.ts',
  'import axios from "axios";',
  'const api = axios.create({',
  '  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,',
  '  timeout: 10000,',
  '  headers: { "Content-Type": "application/json" },',
  '});',
  '// Request interceptor: inject token',
  'api.interceptors.request.use(config => {',
  '  const token = localStorage.getItem("accessToken");',
  '  if (token) config.headers.Authorization = `Bearer ${token}`;',
  '  return config;',
  '});',
  '// Response interceptor: handle errors',
  'api.interceptors.response.use(',
  '  res => res,',
  '  err => {',
  '    // handle 401, transform error messages, etc.',
  '    return Promise.reject(err);',
  '  }',
  ');',
  'export default api;',
  '```',
  '',
  '### Example: API Call in a Thunk',
  '```ts',
  'export const fetchProducts = createAsyncThunk("products/fetch", async () => {',
  '  const res = await api.get("/api/v1/products/");',
  '  return res.data.data;',
  '});',
  '```',
  '',
  '---',
  '',
  '## Cart System',
  '',
  '### Cart Data Normalization',
  '```ts',
  '// src/features/cart/cartSlice.ts (excerpt)',
  'const normalizeCartItems = (items: any[]) =>',
  '  items.map(item => ({',
  '    product_id: item.product.product_id,',
  '    name: item.product.name,',
  '    price: item.product.price,',
  '    quantity: item.quantity,',
  '    thumbnail: item.product.thumbnail,',
  '    category_detail: item.product.category_detail,',
  '  }));',
  '```',
  '',
  '### Cart Badge in Header',
  '```tsx',
  '// src/components/Header.tsx (excerpt)',
  '<span>',
  '  {Array.isArray(cart) ? cart.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0}',
  '</span>',
  '```',
  '',
  '### Cart Drawer Fetch Logic',
  '```tsx',
  'useEffect(() => {',
  '  if (open) {',
  '    dispatch(fetchCart());',
  '  }',
  '}, [open, dispatch]);',
  '```',
  '',
  '---',
  '',
  '## Authentication',
  '',
  '- JWT-based registration, login, password reset, and account management.',
  '- Redux-powered auth state, with protected routes and hydration guard.',
  '',
  '### Example: Login Thunk',
  '```ts',
  'export const login = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {',
  '  const res = await api.post("/auth/token/create/", credentials);',
  '  return res.data;',
  '});',
  '```',
  '',
  '---',
  '',
  '## Theming & Accessibility',
  '',
  '- All docs UI uses a custom, isolated theme (see `docs-theme.css`).',
  '- Main app uses Tailwind CSS with semantic, theme-aware classes.',
  '- Accessibility: keyboard navigation, focus rings, ARIA labels, color contrast.',
  '',
  '### Example: Theme Switcher',
  '```tsx',
  '// src/components/ThemeSwitcher.tsx (excerpt)',
  'const theme = useSelector((state: RootState) => state.theme.value);',
  'const dispatch = useDispatch();',
  '<button onClick={() => dispatch(toggleTheme())}>Toggle Theme</button>',
  '```',
  '',
  '---',
  '',
  '## Error Handling',
  '',
  '- All API errors are handled and transformed in `src/lib/axios.ts` and `src/utils/errorHandler.ts`.',
  '- User-friendly error messages are shown in the UI.',
  '',
  '### Example: Centralized Error Handler',
  '```ts',
  '// src/utils/errorHandler.ts (excerpt)',
  'export function getErrorMessage(error: any): string {',
  '  if (error?.response?.data?.message) return error.response.data.message;',
  '  return error.message || "An unexpected error occurred.";',
  '}',
  '```',
  '',
  '---',
  '',
  '## Extending the Project',
  '',
  '### Adding a New Feature',
  '1. Create a new slice in `src/features/`.',
  '2. Add async thunks for API calls.',
  '3. Add UI components in `src/components/`.',
  '4. Connect to Redux using `useSelector`/`useDispatch`.',
  '',
  '### Adding a New API Endpoint',
  '1. Add a thunk in the relevant slice.',
  '2. Use the Axios instance for requests.',
  '3. Handle errors and normalize data as needed.',
  '',
  '---',
  '',
  '## Running & Building',
  '',
  '1. **Install dependencies:**',
  '   ```bash',
  '   npm install',
  '   # or',
  '   yarn install',
  '   ```',
  '2. **Configure environment:**',
  '   - Create a `.env.local` file with:',
  '     ```',
  '     NEXT_PUBLIC_API_BASE_URL=http://localhost:8000',
  '     ```',
  '   - Adjust the URL to match your backend.',
  '3. **Start the development server:**',
  '   ```bash',
  '   npm run dev',
  '   # or',
  '   yarn dev',
  '   ```',
  '4. **Build for production:**',
  '   ```bash',
  '   npm run build && npm start',
  '   # or',
  '   yarn build && yarn start',
  '   ```',
  '',
  '---',
  '',
  '## Developer Notes',
  '',
  '- **Redux Store:** See `src/store.ts` for store setup and preloaded state.',
  '- **Cart Slice:** See `src/features/cart/cartSlice.ts` for cart logic and normalization.',
  '- **Header:** See `src/components/Header.tsx` for hydration guard and cart badge logic.',
  '- **Hero Section:** See `src/app/page.tsx` for theme-aware hero styles.',
  '- **API Integration:** All API calls use the Axios instance in `src/lib/axios.ts`.',
  '- **Contributing:**',
  '  1. Fork the repo',
  '  2. Create a feature branch',
  '  3. Commit and push your changes',
  '  4. Open a pull request',
  '',
  '---',
  '',
  'For backend/API details, see `AUTHENTICATION.md`.',
];

const components = {
  code({ node, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    return match ? (
      <SyntaxHighlighter
        style={oneLight}
        language={match[1]}
        PreTag="div"
        {...props}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  h1: ({ node, ...props }) => (
    <h1 id="overview" {...props} className="text-4xl font-extrabold mt-10 mb-6 border-b-2 pb-2" style={{color: 'var(--heading)', borderColor: 'var(--accent)'}} />
  ),
  h2: ({ node, ...props }) => {
    const id =
      typeof props.children === "string"
        ? props.children.toLowerCase().replace(/ /g, "-")
        : undefined;
    return <h2 id={id} {...props} className="text-2xl font-bold mt-10 mb-4 border-b pb-1" style={{color: 'var(--heading)', borderColor: 'var(--muted)'}} />;
  },
  h3: ({ node, ...props }) => (
    <h3 {...props} className="text-lg font-semibold mt-6 mb-2" style={{color: 'var(--heading)'}} />
  ),
  ul: ({ node, ...props }) => (
    <ul {...props} className="list-disc ml-6" />
  ),
  a: ({ node, ...props }) => (
    <a {...props} className="underline hover:opacity-80" style={{color: 'var(--link)'}} />
  ),
};

const sections = [
  { id: "overview", label: "Overview" },
  { id: "authentication", label: "Authentication" },
  { id: "state-management--api-calls", label: "State Management & API Calls" },
  { id: "filtering", label: "Filtering" },
  { id: "orders--payment", label: "Orders & Payment" },
  { id: "themes", label: "Themes" },
  { id: "reviews", label: "Reviews" },
  { id: "chat", label: "Chat" },
  { id: "error--empty-states", label: "Error & Empty States" },
  { id: "footer", label: "Footer" },
  { id: "best-practices", label: "Best Practices" },
  { id: "setup", label: "Setup" },
];

export default function DocumentationPage() {
  return (
    <div className="docs-theme-root flex">
      {/* Sidebar */}
      <aside className="docs-sidebar">
        <nav>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#tech-stack">Tech Stack</a></li>
            <li><a href="#project-structure">Project Structure</a></li>
            <li><a href="#redux-deep-dive">Redux Deep Dive</a></li>
            <li><a href="#axios-deep-dive">Axios Deep Dive</a></li>
            <li><a href="#cart-system">Cart System</a></li>
            <li><a href="#authentication">Authentication</a></li>
            <li><a href="#theming--accessibility">Theming & Accessibility</a></li>
            <li><a href="#error-handling">Error Handling</a></li>
            <li><a href="#how-to-extend">How to Extend</a></li>
            <li><a href="#running-the-project">Running the Project</a></li>
            <li><a href="#developer-notes">Developer Notes</a></li>
          </ul>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="docs-content">
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={components}
        >
          {documentation.join('\n')}
        </Markdown>
      </main>
    </div>
  );
}