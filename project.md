# Blog & Custom CMS - Project Specification

This document provides a comprehensive overview of the system architecture, authentication flow, page routing, and database models for the Blog and Custom CMS application. It details how all components connect and function without containing code implementations.

---

## 1. Project Overview & Objectives

The goal is to build a modern, high-performance blog platform paired with a secure, custom Content Management System (CMS). The system permits content creators to write, edit, organize, and publish articles, moderate public comments, and manage media, while offering a fast, responsive, and SEO-friendly reader experience on the frontend.

---

## 2. Technology Stack

The platform is designed around a modern JavaScript-centric serverless stack:

*   **Framework:** Next.js (utilizing the App Router for server-side rendering, static site generation, and optimized client navigation).
*   **Database:** PostgreSQL (hosted on a serverless-friendly platform like Neon or Supabase to manage dynamic relational data efficiently).
*   **Database ORM:** Prisma (providing type-safe database queries and migrations).
*   **Authentication:** NextAuth.js (supporting credentials-based sign-in and JWT-based session state).
*   **Rich Text Editor:** Tiptap (a headless, highly customizable framework for editing and content composition).
*   **File Storage:** Supabase Storage (used for secure, high-performance hosting of article cover images and embedded media in buckets).
*   **Styling:** Tailwind CSS (configured alongside PostCSS for responsive, custom designs).

---

## 3. Database Schema & Data Models

The system architecture utilizes a relational database to handle structured records. Below is a conceptual description of each model, its fields, and its relationships.

### Enums
*   **User Roles (`Role`):**
    *   `ADMIN`: Possesses complete access to the CMS, user accounts, configuration settings, and comment moderation.
    *   `EDITOR`: Has access to create, edit, and manage posts, categories, and tags, but cannot modify system settings or manage user profiles.
*   **Post Publication Status (`PostStatus`):**
    *   `DRAFT`: Visible only to authenticated administrators and editors in the CMS.
    *   `PUBLISHED`: Publicly visible to all readers on the frontend blog.

### Models
1.  **User Model**
    *   Represents authors, editors, and administrators.
    *   **Fields:** Unique identification code, unique email address, hashed password, display name, user role (`ADMIN` or `EDITOR`), collection of authored posts, and creation timestamp.
2.  **Post Model**
    *   Represents individual blog articles.
    *   **Fields:** Unique identification code, title, unique URL-friendly text (slug), rich text content (HTML string), short summary (excerpt), cover image URL, publication status, relationship link to the author, collection of categories, collection of tags, comments collection, creation timestamp, last update timestamp, and publication date/time.
3.  **Category Model**
    *   Used for broad topical organization of articles.
    *   **Fields:** Unique identification code, display name, unique URL-friendly slug, and collection of associated posts (many-to-many relationship).
4.  **Tag Model**
    *   Used for granular taxonomy and tagging.
    *   **Fields:** Unique identification code, display name, unique URL-friendly slug, and collection of associated posts (many-to-many relationship).
5.  **Comment Model**
    *   Represents reader feedback on articles.
    *   **Fields:** Unique identification code, associated post link, author display name, author email, comment content, approval status (boolean), and creation timestamp.

---

## 4. Authentication & Authorization Flow

The security layer manages authentication for CMS operators and restricts access to administration paths and editing APIs.

### How Authentication Works
*   The system uses **NextAuth.js** configured with a **Credentials Provider**.
*   Users submit their email and password via a dedicated login form.
*   The application queries the database for a matching email, verifies the password by comparing it with the stored cryptographic hash (using `bcryptjs`), and rejects unauthorized attempts.
*   Upon successful verification, the system issues a **JSON Web Token (JWT)** that contains the user's basic info (ID, name, email) and their specific role (`ADMIN` or `EDITOR`).
*   This JWT is securely stored in a browser cookie and sent with client requests to authorize state modifications.
*   The application context reads this cookie to reconstruct a server-side and client-side user session, allowing components to adapt to the logged-in user.

### Authorization & Access Control
*   **Middleware Protection:** Next.js middleware blocks unauthenticated requests at the edge. The system checks incoming request paths and redirects unauthorized users attempting to access dashboard folders (`/admin/*`) or administrative API endpoints (`/api/admin/*`) directly to the login page.
*   **Role-Based Operations:**
    *   Both `ADMIN` and `EDITOR` roles can create, edit, and delete their own blog posts, manage taxonomies, and preview drafts.
    *   Only `ADMIN` users are permitted to perform administrative tasks, such as creating new editor accounts, altering user roles, deleting other editors' posts, or moderating/approving public comments.
    *   API endpoints check the session's role token before executing database operations, ensuring role constraints cannot be bypassed.

---

## 5. App Routing Architecture

The application is structured using Next.js file-system routing. Below is a map of all routes and their respective functions.

### Public Blog Routes (Reader-Facing)
These routes are publicly accessible, highly optimized, and structured for optimal Search Engine Optimization (SEO).

*   **Home Page (`/`)**
    *   *Purpose:* Displays a paginated list of published posts, showing their cover images, titles, excerpts, publication dates, categories, and author details.
*   **Article Detail Page (`/posts/[slug]`)**
    *   *Purpose:* Renders the full content of a published blog post based on its unique slug. Includes metadata tags (title, description, Open Graph tags) for sharing, display of categories and tags, and a public comment section where users can read approved comments and submit new ones.
*   **Category Archives (`/categories/[slug]`)**
    *   *Purpose:* Filters and lists all published posts belonging to a specific category.
*   **Tag Archives (`/tags/[slug]`)**
    *   *Purpose:* Filters and lists all published posts associated with a specific tag.
*   **Search Page (`/search`)**
    *   *Purpose:* Allows readers to search posts by key phrases matching titles, excerpts, or content tags.

### CMS & Admin Routes (Protected)
All admin routes are protected and require a valid active session. Any direct attempt to navigate to these pages without a session will trigger an automatic redirect to `/admin/login`.

*   **CMS Sign-In Page (`/admin/login`)**
    *   *Purpose:* Serves as the entryway to the CMS dashboard. Open to the public but redirects logged-in sessions automatically to the main dashboard.
*   **CMS Dashboard Home (`/admin`)**
    *   *Purpose:* Offers a control center displaying application metrics (e.g., total published posts, total page views, pending comments requiring moderation, quick-draft creation widget).
*   **Post Management Dashboard (`/admin/posts`)**
    *   *Purpose:* Displays a tabular grid of all posts. Features options to filter by publication status (Draft vs. Published), search by title, and delete or edit entries.
*   **Create New Post (`/admin/posts/new`)**
    *   *Purpose:* Provides the creation interface featuring the rich text editor, title inputs, slug configuration, excerpt writing, category selection, tag allocation, and cover image upload tools.
*   **Edit Existing Post (`/admin/posts/edit/[id]`)**
    *   *Purpose:* Loads pre-populated form data for a specific article. Permits updating content, altering publication status, or replacing cover images.
*   **Taxonomy Management (`/admin/taxonomy`)**
    *   *Purpose:* A consolidated panel to view, create, rename, and delete Categories and Tags.
*   **Comment Moderation (`/admin/comments`)**
    *   *Purpose:* Displays a list of comments submitted by the public. `ADMIN` accounts can approve pending comments (making them visible on the public post page) or delete spam comments.
*   **User Profiles & Administration (`/admin/users`)**
    *   *Purpose:* Restricted to `ADMIN` users. Allows management of administrative and editorial team accounts (adding new users, editing roles, or disabling accounts).

---

## 6. API Routes & Server Actions

The backend capability is exposed through API routes and server-side actions, handling data exchange securely and validating authorization rules before touching the database.

### NextAuth Handler
*   **Endpoint:** `/api/auth/[...nextauth]`
    *   *Methods:* `GET`, `POST`
    *   *Purpose:* Manages the sign-in, session checking, token renewal, and sign-out lifecycles.

### Media Storage API
*   **Endpoint:** `/api/upload`
    *   *Method:* `POST`
    *   *Purpose:* Connects to Supabase Storage. Receives file buffers sent from the Tiptap editor or cover image input fields, uploads them to a designated public storage bucket, and returns the public asset URLs to be saved in the database.

### CMS Content APIs (Protected)
*   **Posts Management:** Handles fetching drafts and published posts, creating new records, editing existing properties, and purging records from the database.
*   **Taxonomy Management:** Exposes endpoints to search, create, update, or delete categories and tags.
*   **Comment Moderation Actions:** Handles updating comment status to approved, or deleting records entirely.
*   **User Accounts Administration:** Handles creation of new editor profile entries, password hashing, and user role updates.

### Public Interaction APIs
*   **Comment Submission:**
    *   *Method:* `POST`
    *   *Purpose:* Enables public readers to submit a comment for a post. It validates input formatting (valid email and text length) and writes a new comment record to the database with approval status defaulted to false.

---

## 7. Editorial Workflows & CMS Features

The custom CMS is tailored to facilitate a seamless publishing workflow for writers.

### 1. Rich Text Writing with Tiptap
*   **Modular Formatting:** Writers can structure text with headings, bold and italic text, quotes, code fragments, bulleted lists, and numbered lists.
*   **Hyperlinks:** Inline link tool allows highlighting text and linking it to external web addresses or internal blog articles.
*   **Inline Images:** Users can drop or select images, which are automatically uploaded to Supabase Storage and rendered inline inside the editing field.

### 2. Publication States & Scheduling
*   **Drafting Phase:** New posts are created in a draft state, ensuring they are only visible inside the CMS.
*   **Publishing Phase:** Clicking "Publish" switches the status to published, assigns the current timestamp to the publication date, and pushes the article live onto the public blog.
*   **Unpublishing:** An editor can revert a published post to draft status at any point to remove it from public view.

### 3. Media Upload Pipeline
*   When a user adds a cover photo or an inline image, a client component intercepts the file, reads it, and forwards it to the image upload service.
*   The upload service authenticates, uploads the image to a Supabase Storage bucket, and returns its public URL.
*   This URL is stored directly in the database as part of the post's structure.

### 4. SEO Controls & Metadata
*   **URL Slugs:** The CMS automatically generates a clean, URL-friendly slug based on the title, while allowing editors to customize it manually for SEO optimizations.
*   **Excerpts:** A dedicated text field allows writers to provide summaries for search engines and listing pages.
*   **Page Headers:** The public rendering engine uses metadata dynamically loaded from the database to populate headers, improving organic search visibility.
