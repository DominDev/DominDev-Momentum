---
name: "source-command-readme-generate"
description: "Generate professional README.md and LICENSE for the project (DominDev branding, tech stack, features, setup)."
---

# source-command-readme-generate

Use this skill when the user asks to run the migrated source command `readme-generate`.

## Command Template

Generate a **professional, visually stunning README.md** for this project in **English**.

## Analysis Phase (Required)

1. **Scan project structure:**
   - List all files (glob): HTML, CSS, JS, JSON
   - Identify key directories: `src/`, `assets/`, `_scripts/`, etc.
   - Read `package.json` if exists → extract dependencies, scripts

2. **Analyze technology stack:**
   - HTML files → meta tags, semantic structure, features
   - CSS files → Grid/Flexbox, variables, frameworks (if any)
   - JS files → vanilla/framework, key features (forms, animations, etc.)
   - Build tools → npm scripts, bundlers, optimizations

3. **Extract project metadata:**
   - Project name (from folder name or package.json)
   - Key features (from HTML structure and JS functionality)
   - Performance hints (minified files, lazy-load, WebP/AVIF)
   - Accessibility (ARIA, semantic HTML, focus management)

## README.md Structure

### 1. Hero Section (ENHANCED)
```markdown
# Project Name

> **Bold, confident tagline** - What makes this project different from the rest

<div align="center">

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-success?style=for-the-badge)](https://example.com)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/DominDev/project-name)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

</div>

---

### 🎯 Quick Stats

| Metric | Value | Benchmark |
|--------|-------|-----------|
| **Performance** | 🟢 95+ | Industry avg: 70 |
| **Load Time** | ⚡ < 1s | Industry avg: 3-5s |
| **Lighthouse** | 🟢 98/100 | Industry avg: 75 |
| **Bundle Size** | 📦 < 50KB | Industry avg: 200KB+ |

```

### 2. Visual Preview (ENHANCED)
```markdown
## 📸 Preview

<div align="center">

![Desktop Preview](assets/screenshots/desktop.png)

<table>
<tr>
<td width="50%">

**Desktop** 🖥️
![Desktop](assets/screenshots/desktop-full.png)

</td>
<td width="50%">

**Mobile** 📱
![Mobile](assets/screenshots/mobile.png)

</td>
</tr>
</table>

</div>

> 💡 **Tip:** See it in action: [Live Demo](https://example.com)

```

### 3. About & Business Value (ENHANCED)
```markdown
## 💡 About

[2-3 sentences with **confident, bold tone**: This is not just another project. This is a carefully crafted solution designed for specific problem. What makes it unique?]

---

### ✨ Key Features

<div align="center">

| Feature | Description | Impact |
|---------|-------------|--------|
| 🎯 **Feature 1** | Business value description | 🚀 +X% conversion |
| ⚡ **Feature 2** | Technical benefit | ⚡ Sub-second load |
| 📱 **Feature 3** | UX benefit | 📈 Better UX |
| ♿ **Feature 4** | Accessibility | ✅ WCAG 2.1 AA |
| 🔒 **Feature 5** | Security | 🛡️ Protected |

</div>

---

### 🎨 What Makes This Different?

<table>
<tr>
<td width="50%">

#### ❌ **Typical Projects**
- Bloated frameworks
- Slow load times (3-5s)
- Generic templates
- Poor accessibility
- Unmaintainable code

</td>
<td width="50%">

#### ✅ **This Project**
- **Vanilla JS** - zero framework overhead
- **< 1s load time** - optimized performance
- **Custom design** - unique & purposeful
- **WCAG 2.1 AA** - accessible to all
- **Clean architecture** - easy to maintain

</td>
</tr>
</table>

```

### 4. Tech Stack (ENHANCED WITH BADGES GRID)
```markdown
## 🛠️ Tech Stack

<div align="center">

### Frontend
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

### Build Tools
![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)
[Add detected tools: Vite, Webpack, etc.]

### Optimization
![Terser](https://img.shields.io/badge/Terser-Minification-8DD6F9?style=for-the-badge)
![WebP](https://img.shields.io/badge/WebP-Image_Optimization-4285F4?style=for-the-badge)

</div>

---

### 📊 Stack Comparison

| Category | This Project | Typical Alternative | Why Better? |
|----------|--------------|---------------------|-------------|
| **JavaScript** | Vanilla JS (0 KB) | React + deps (140 KB) | 140 KB smaller, faster TTI |
| **CSS** | Custom Grid/Flexbox | Bootstrap (180 KB) | 180 KB smaller, no unused code |
| **Images** | WebP/AVIF (50% smaller) | PNG/JPG (large) | Faster load, better UX |
| **Build** | Simple npm scripts | Complex webpack config | Easy to maintain |

### Why This Stack?

> 💡 **Philosophy:** Every byte counts. Every millisecond matters.

This project prioritizes **performance and simplicity** over trendy frameworks:
- **Vanilla JS** - Zero framework overhead, direct browser APIs
- **CSS Grid/Flexbox** - Modern, maintainable layouts without libraries
- **Static HTML** - Instant TTI, perfect SEO, no hydration delays
- **Optimized assets** - WebP/AVIF images, minified code, lazy loading

```

### 5. Performance & Quality (ENHANCED WITH COMPARISONS)
```markdown
## ⚡ Performance & Quality

### 🏆 Lighthouse Scores

<div align="center">

| Category | Score | Industry Avg | Improvement |
|----------|-------|--------------|-------------|
| 🎯 Performance | 🟢 **98/100** | 70 | +40% |
| ♿ Accessibility | 🟢 **100/100** | 80 | +25% |
| 🔍 Best Practices | 🟢 **100/100** | 85 | +18% |
| 📱 SEO | 🟢 **100/100** | 75 | +33% |

</div>

---

### ⚡ Core Web Vitals - Performance Breakdown

<div align="center">

```
┌─────────────────────────────────────────────────────┐
│  Metric  │  This Project  │  Target  │  Industry  │
├──────────┼────────────────┼──────────┼────────────┤
│   LCP    │   🟢 0.8s      │  < 2.5s  │  4.2s      │
│   FID    │   🟢 12ms      │  < 100ms │  180ms     │
│   CLS    │   🟢 0.02      │  < 0.1   │  0.25      │
│   TTI    │   🟢 1.1s      │  < 3.8s  │  5.3s      │
│   TBT    │   🟢 45ms      │  < 300ms │  420ms     │
└─────────────────────────────────────────────────────┘
```

</div>

> 📊 **Result:** This project is **5x faster** than industry average

---

### 🎯 Optimizations Applied

<table>
<tr>
<td width="33%">

#### 📦 Code
- ✅ Minified CSS/JS
- ✅ Tree-shaking
- ✅ Code splitting
- ✅ Deferred scripts
- ✅ Critical CSS inline

</td>
<td width="33%">

#### 🖼️ Assets
- ✅ WebP/AVIF formats
- ✅ Lazy-loaded images
- ✅ Responsive images
- ✅ Optimized SVGs
- ✅ Font subsetting

</td>
<td width="33%">

#### 🚀 Delivery
- ✅ Browser caching
- ✅ Gzip/Brotli
- ✅ CDN delivery
- ✅ Preload critical
- ✅ DNS prefetch

</td>
</tr>
</table>

```

### 6. Accessibility (ENHANCED)
```markdown
## ♿ Accessibility

<div align="center">

### 🏆 WCAG 2.1 Level AA Compliant

| Standard | Status | Details |
|----------|--------|---------|
| **Perceivable** | ✅ | High contrast (4.5:1+), alt text, captions |
| **Operable** | ✅ | Keyboard nav, focus management, skip links |
| **Understandable** | ✅ | Clear language, consistent navigation |
| **Robust** | ✅ | Valid HTML5, ARIA landmarks, semantic markup |

</div>

### 🎯 Accessibility Features

- 🎨 **Color Contrast** - All text meets 4.5:1 ratio minimum
- ⌨️ **Keyboard Navigation** - Full site usable without mouse
- 📱 **Screen Readers** - Proper ARIA labels and landmarks
- 🎬 **Reduced Motion** - Respects `prefers-reduced-motion`
- 🔤 **Text Scaling** - Works at 200% zoom without loss
- 🎯 **Focus Management** - Clear focus indicators, logical tab order

> ♿ **Commitment:** Building for **everyone**, not just some users.

```

### 7. Getting Started (ENHANCED)
```markdown
## 🚀 Getting Started

### Prerequisites

```bash
# Required
Node.js 18+        # JavaScript runtime
Modern Browser     # Chrome 90+, Firefox 88+, Safari 14+

# Optional (for development)
Git               # Version control
VS Code           # Recommended IDE
```

### 📥 Quick Start (3 steps)

```bash
# 1️⃣ Clone the repository
git clone https://github.com/DominDev/project-name.git
cd project-name

# 2️⃣ Install dependencies (if any)
npm install

# 3️⃣ Start development
npm start
# or simply open index.html in your browser

# 🏗️ Build for production
npm run build
```

---

### 📁 Project Structure

```
project-name/
├── 📄 index.html              # Entry point
├── 📁 src/
│   ├── 📁 css/
│   │   ├── style.css          # Source styles
│   │   └── style.min.css      # Production (minified)
│   ├── 📁 js/
│   │   ├── main.js            # Source JavaScript
│   │   └── main.min.js        # Production (minified)
│   └── 📁 assets/
│       ├── 📁 img/            # Images (WebP/AVIF)
│       ├── 📁 fonts/          # Custom fonts
│       └── 📁 icons/          # SVG icons
├── 📁 _scripts/               # Build automation
│   ├── auto-minify-css.js     # CSS minification
│   ├── minify-js.js           # JS minification
│   └── optimize-images.js     # Image optimization
├── 📄 README.md
└── 📄 LICENSE
```

> 💡 **Tip:** Files with `.min` extension are auto-generated. Edit source files only.

```

### 8. Lessons Learned (NEW SECTION)
```markdown
## 📚 Lessons Learned

> 💡 **Key insights from building this project**

### ✅ What Worked Well

1. **Vanilla JS approach** - No framework overhead = faster load times and easier maintenance
2. **Performance-first design** - Optimizing from day one prevented technical debt
3. **Mobile-first CSS** - Starting small made desktop styling easier
4. **Semantic HTML** - Better SEO and accessibility with minimal effort

### 🎯 Challenges Overcome

1. **Cross-browser compatibility** - Solution: Progressive enhancement and polyfills
2. **Image optimization** - Solution: Automated WebP/AVIF conversion pipeline
3. **CSS organization** - Solution: BEM methodology + custom properties

### 🔄 What I'd Do Differently

- Start with TypeScript for better type safety
- Implement automated testing from day one
- Use CSS-in-JS for component-scoped styles

```

### 9. Environment Variables (if applicable)
```markdown
## 🔐 Environment Variables

If this project uses API keys or environment-specific config:

```bash
# Create .env file (copy from .env.example)
cp .env.example .env

# Example configuration
API_KEY=your_api_key_here
ANALYTICS_ID=your_analytics_id
ENVIRONMENT=production
```

⚠️ **Security Note:** `.env` is gitignored. **Never commit secrets to version control.**

```

### 10. Deployment
```markdown
## 📦 Deployment

### 🌐 Recommended Hosting

<div align="center">

| Platform | Best For | Deploy Time | Cost |
|----------|----------|-------------|------|
| **Netlify** | Static sites, CI/CD | < 1 min | Free tier |
| **Vercel** | Next.js, React | < 1 min | Free tier |
| **GitHub Pages** | Open source | < 5 min | Free |

</div>

### 🚀 Deploy to Netlify (Recommended)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to production
npm run build
netlify deploy --prod
```

### 🚀 Deploy to GitHub Pages

```bash
# Build production version
npm run build

# Push to main branch
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main

# Enable GitHub Pages in repository settings
# Settings → Pages → Source: main branch
```

> 🌐 **Custom Domain:** Update DNS settings to point to your hosting provider.

```

### 11. Roadmap (ENHANCED WITH PRIORITIES)
```markdown
## 🗺️ Roadmap

### 🎯 Planned Features

<div align="center">

| Priority | Feature | Status | Timeline |
|----------|---------|--------|----------|
| 🔴 High | Dark mode toggle | 📋 Planned | Q1 2026 |
| 🔴 High | i18n (multi-language) | 📋 Planned | Q1 2026 |
| 🟡 Medium | Blog section | 💭 Considering | Q2 2026 |
| 🟡 Medium | CMS integration | 💭 Considering | Q2 2026 |
| 🟢 Low | A/B testing setup | 💭 Considering | Q3 2026 |

</div>

### ✅ Recently Completed

- [x] Initial release with core features
- [x] Performance optimization (98+ Lighthouse)
- [x] WCAG 2.1 AA compliance
- [x] Responsive design (mobile-first)

> 💡 Have a feature request? [Open an issue](https://github.com/DominDev/project-name/issues)

```

### 12. License
```markdown
## 📄 License

This project uses a **dual license**:

<div align="center">

| Type | What's Covered | Terms |
|------|----------------|-------|
| ✅ **MIT License** | Source code | Free to use, modify, distribute |
| ❌ **All Rights Reserved** | Images, content, brand assets | Permission required |

</div>

### 📋 Details

**You CAN:**
- ✅ Use the code in personal projects
- ✅ Use the code in commercial projects
- ✅ Modify and distribute the code
- ✅ Use the code in closed-source projects

**You CANNOT:**
- ❌ Use images, logos, or brand assets without permission
- ❌ Claim this work as your own
- ❌ Use DominDev branding in your derivative works

See [LICENSE](LICENSE) for full legal terms.

```

### 13. Author (DominDev Branding - ENHANCED)
```markdown
## 👨‍💻 Author

<div align="center">

<img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=32&duration=2800&pause=2000&color=FF1F1F&center=true&vCenter=true&width=600&lines=Crafted+with+%E2%9D%A4%EF%B8%8F+by+DominDev;Building+Digital+Experiences;That+Convert." alt="Typing SVG" />

---

### **Building digital experiences that convert.**

[![Website](https://img.shields.io/badge/🌐_Website-domindev.com-FF1F1F?style=for-the-badge)](https://domindev.com)
[![Email](https://img.shields.io/badge/✉️_Email-contact@domindev.com-EA4335?style=for-the-badge)](mailto:contact@domindev.com)
[![GitHub](https://img.shields.io/badge/⭐_GitHub-DominDev-181717?style=for-the-badge)](https://github.com/DominDev)

---

### 🎯 Areas of Expertise

| Skill | Description |
|-------|-------------|
| 🎨 **Frontend** | HTML5, CSS3, Vanilla JS - Performance-focused |
| ⚡ **Performance** | Core Web Vitals, Lighthouse optimization |
| ♿ **Accessibility** | WCAG 2.1 AA compliance, inclusive design |
| 📱 **Responsive** | Mobile-first, cross-device compatibility |
| 🔍 **SEO** | Semantic HTML, structured data, meta optimization |

---

### ⭐ **If you like this project, give it a star on GitHub!**

<sub>Made with ❤️ and ☕ by DominDev</sub>

</div>
```

---

## LICENSE Generation

Also create `LICENSE` with:

```markdown
# MIT License (Code) + All Rights Reserved (Assets)

Copyright (c) [YEAR] DominDev

## Code License (MIT)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Assets License (All Rights Reserved)

All images, graphics, logos, icons, videos, audio files, and written content
in this repository are **All Rights Reserved** and may not be used, copied,
modified, or distributed without explicit written permission from DominDev.

This includes but is not limited to:
- `/assets/img/` directory and all subdirectories
- `/assets/fonts/` (if custom/commercial fonts)
- Brand assets, logos, and trademarks
- Written content (copy, descriptions, blog posts)

For licensing inquiries, contact: contact@domindev.com
```

---

## Output Instructions

1. **Analyze** the project thoroughly (scan files, read key files)
2. **Generate** complete README.md with **all enhanced sections**
3. **Generate** LICENSE
4. **Backup** existing README.md to `README.backup.md` if it exists
5. **Write** both files to project root
6. **Summary**: Show user what was included (tech stack detected, features found, sections generated)

**Important:**
- Use actual project data (don't make up features)
- Use **confident, bold tone** (not generic)
- Include **comparison tables** where metrics are available
- Add **ASCII art boxes** for Core Web Vitals
- Include **What Makes This Different** section
- Add **Lessons Learned** if there are interesting technical decisions
- Use **emoji grids and tables** for visual appeal
- Replace `[YEAR]` with current year (2026) in LICENSE
- Replace placeholder URLs with actual data if found
- Maintain professional, technical tone (Senior Developer level)
- **Make it visually stunning** - this is the face of the project
