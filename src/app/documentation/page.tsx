// To use this page, install:
// npm install react-markdown remark-gfm react-syntax-highlighter
"use client";
import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";

const documentation = `
# Loqta-UI-UX Project Documentation

## Overview
Loqta-UI-UX is a modern, themeable e-commerce frontend built with Next.js, featuring advanced filtering, reviews, chat, and a robust order/payment system.

## Table of Contents
- [Authentication](#authentication)
- [Filtering](#filtering)
- [Orders](#orders)
- [Themes](#themes)
- [Reviews](#reviews)
- [Chat](#chat)
- [Best Practices](#best-practices)
- [Setup](#setup)
- [Code Snippets](#code-snippets)

## Authentication
- JWT-based, with registration, login, password reset, and activation flows.
- Context-driven auth state, with protected routes and role checks.

## Filtering
- Category filtering via \`category__slug\` query param.
- Advanced filters: price, stock, tag, ordering.
- SPA-style updates (no full reload).

## Orders
- Modern card UI, semantic theme classes.
- Status badges: Pending (PE), Completed (CO), Cancelled (CA).
- "Pay Now" button for unpaid orders, Stripe integration.

## Themes
- Multiple themes: light, dark, autumn, calm, bazaar.
- All UI uses semantic classes for backgrounds, text, borders.

## Reviews
- Modern cards, pastel avatars, interactive stars.
- Theme-aware, accessible, no hardcoded colors.

## Chat
- Real-time, theme-aware, semantic classes only.

## Best Practices
- Responsive, accessible, semantic HTML.
- No hardcoded colors; all via theme classes.
- Friendly error/empty states.

## Setup
\`\`\`bash
npm install
npm run dev
\`\`\`

## Code Snippets
### Theme Usage Example
\`\`\`tsx
<div className="bg-background text-foreground border-border">
  ...
</div>
\`\`\`

### Category Filtering Example
\`\`\`tsx
const handleCategory = (slug: string) => {
  setQuery((q) => ({ ...q, category__slug: slug }));
};
\`\`\`

### Order Status Badge Example
\`\`\`tsx
<span className={`badge badge-${'${status}'}`}>{'${statusText}'}</span>
\`\`\`
`;

const sections = [
  { id: "overview", label: "Overview" },
  { id: "authentication", label: "Authentication" },
  { id: "filtering", label: "Filtering" },
  { id: "orders", label: "Orders" },
  { id: "themes", label: "Themes" },
  { id: "reviews", label: "Reviews" },
  { id: "chat", label: "Chat" },
  { id: "best-practices", label: "Best Practices" },
  { id: "setup", label: "Setup" },
  { id: "code-snippets", label: "Code Snippets" },
];

export default function DocumentationPage() {
  // Use semantic theme classes only; theme context can be added if needed
  // Syntax highlighting will default to light theme
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <aside className="hidden md:block w-64 border-r border-border p-6 sticky top-0 h-screen bg-muted">
        <nav className="space-y-4">
          <h2 className="text-lg font-bold mb-4">Docs Navigation</h2>
          <ul className="space-y-2">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="hover:underline text-accent-foreground"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto p-6 prose prose-neutral dark:prose-invert">
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
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
              <h1 id="overview" {...props} className="text-3xl font-bold mt-8 mb-4" />
            ),
            h2: ({ node, ...props }) => {
              const id =
                typeof props.children === "string"
                  ? props.children.toLowerCase().replace(/ /g, "-")
                  : undefined;
              return <h2 id={id} {...props} className="text-2xl font-semibold mt-8 mb-3" />;
            },
            h3: ({ node, ...props }) => (
              <h3 {...props} className="text-xl font-semibold mt-6 mb-2" />
            ),
            ul: ({ node, ...props }) => (
              <ul {...props} className="list-disc ml-6" />
            ),
            a: ({ node, ...props }) => (
              <a {...props} className="text-accent underline hover:text-accent-foreground" />
            ),
          }}
        >
          {documentation}
        </Markdown>
      </main>
    </div>
  );
} 