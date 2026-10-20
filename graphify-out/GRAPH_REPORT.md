# Graph Report - perpustakaan-laravel-react  (2026-10-20)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 336 nodes · 431 edges · 38 communities (11 shown, 27 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0e92c1ab`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Illuminate\Http\Request
- composer.json
- Illuminate\Database\Schema\Blueprint
- App.jsx
- backend/package.json
- frontend/package.json
- BukuController.php
- User
- UserFactory.php
- devDependencies
- manifest.json
- config
- bootstrap/app.php
- TestCase
- AppServiceProvider
- ExampleTest

## God Nodes (most connected - your core abstractions)
1. `Controller` - 15 edges
2. `react-router-dom` - 11 edges
3. `User` - 10 edges
4. `App()` - 9 edges
5. `BukuController` - 8 edges
6. `UserController` - 8 edges
7. `require-dev` - 8 edges
8. `react` - 8 edges
9. `BookController` - 7 edges
10. `Buku` - 6 edges

## Surprising Connections (you probably didn't know these)
- `LoanController` --inherits--> `Controller`  [EXTRACTED]
  backend/app/Http/Controllers/Api/LoanController.php → backend/app/Http/Controllers/Controller.php
- `PeminjamanController` --inherits--> `Controller`  [EXTRACTED]
  backend/app/Http/Controllers/Api/PeminjamanController.php → backend/app/Http/Controllers/Controller.php
- `AuthController` --inherits--> `Controller`  [EXTRACTED]
  backend/app/Http/Controllers/Api/AuthController.php → backend/app/Http/Controllers/Controller.php
- `BookController` --inherits--> `Controller`  [EXTRACTED]
  backend/app/Http/Controllers/Api/BookController.php → backend/app/Http/Controllers/Controller.php
- `BukuController` --inherits--> `Controller`  [EXTRACTED]
  backend/app/Http/Controllers/Api/BukuController.php → backend/app/Http/Controllers/Controller.php

## Import Cycles
- None detected.

## Communities (38 total, 27 thin omitted)

### Community 0 - "Illuminate\Http\Request"
Cohesion: 0.07
Nodes (10): AuthController, BookController, BukuController, KategoriController, LoanController, PeminjamanController, UserController, Controller (+2 more)

### Community 1 - "composer.json"
Cohesion: 0.05
Nodes (38): autoload, autoload-dev, psr-4, psr-4, description, extra, laravel, keywords (+30 more)

### Community 2 - "Illuminate\Database\Schema\Blueprint"
Cohesion: 0.09
Nodes (12): {closure#1}(), {closure#2}(), {closure#3}(), {closure#1}(), {closure#2}(), {closure#1}(), {closure#2}(), {closure#3}() (+4 more)

### Community 3 - "App.jsx"
Cohesion: 0.14
Nodes (14): App(), AdminNavbar(), MENU, MENU, Navbar(), BookForm(), KelolaBuku(), KelolaPengguna() (+6 more)

### Community 4 - "backend/package.json"
Cohesion: 0.07
Nodes (21): devDependencies, autoprefixer, axios, concurrently, laravel-vite-plugin, postcss, tailwindcss, vite (+13 more)

### Community 5 - "frontend/package.json"
Cohesion: 0.10
Nodes (22): dependencies, react, react-dom, react-router-dom, vite, name, private, scripts (+14 more)

### Community 6 - "BukuController.php"
Cohesion: 0.13
Nodes (4): ImportBuku, Buku, Kategori, Peminjaman

### Community 7 - "User"
Cohesion: 0.16
Nodes (4): User, AdminSeeder, DatabaseSeeder, KategoriSeeder

### Community 9 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @types/react, @types/react-dom (+2 more)

### Community 10 - "manifest.json"
Cohesion: 0.25
Nodes (7): background_color, display, icons, name, short_name, start_url, theme_color

### Community 11 - "config"
Cohesion: 0.29
Nodes (7): pestphp/pest-plugin, php-http/discovery, config, allow-plugins, optimize-autoloader, preferred-install, sort-packages

## Knowledge Gaps
- **7 isolated node(s):** `vite`, `autoprefixer`, `concurrently`, `postcss`, `vite` (+2 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 170 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@vitejs/plugin-react` connect `backend/package.json` to `frontend/package.json`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **What connects `vite`, `autoprefixer`, `concurrently` to the rest of the system?**
  _7 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Illuminate\Http\Request` be split into smaller, more focused modules?**
  _Cohesion score 0.06845513413506013 - nodes in this community are weakly interconnected._
- **Why does `react-router-dom` connect `App.jsx` to `frontend/package.json`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Should `composer.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._
- **Should `Illuminate\Database\Schema\Blueprint` be split into smaller, more focused modules?**
  _Cohesion score 0.09365079365079365 - nodes in this community are weakly interconnected._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13709677419354838 - nodes in this community are weakly interconnected._