# ITFY Portal Frontend

The frontend application for IT For Youth Ghana's educational platform, built with Next.js 14, React 19, and TypeScript.

## 🚀 Production Ready

This frontend is production-ready with comprehensive performance, security, and deployment features:

- **Performance**: Optimized builds, image optimization, code splitting, lazy loading
- **Security**: Content Security Policy, security headers, input validation
- **Monitoring**: Analytics integration, error reporting, performance tracking
- **Deployment**: Docker containerization, CI/CD pipeline, multi-environment support
- **Accessibility**: WCAG compliant, keyboard navigation, screen reader support

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 🏗️ Architecture

This is a modern **Next.js 14** application with:

```
frontend/
├── app/                    # Next.js 13+ app directory
│   ├── api/               # API routes
│   ├── (auth)/            # Route groups
│   ├── dashboard/         # Protected routes
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── analytics.ts      # Analytics setup
│   ├── error-boundary.tsx # Error boundaries
│   ├── performance.ts    # Performance monitoring
│   └── utils.ts          # Helper functions
├── styles/               # Additional styles
├── public/               # Static assets
├── middleware.ts         # Next.js middleware
├── next.config.mjs       # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS config
└── tsconfig.json         # TypeScript configuration
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/itforyouthghana/portal.git
cd portal/frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with the following variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_MOODLE_URL=https://lms.itforyouthghana.org
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📜 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run type-check   # Run TypeScript type checking

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Docker
npm run docker:build # Build Docker image
npm run docker:run   # Run Docker container
npm run docker:up    # Start with Docker Compose
npm run docker:down  # Stop Docker containers

# Deployment
npm run deploy       # Deploy to production
```

## 🔧 Configuration

### Next.js Configuration

The `next.config.mjs` includes:
- Image optimization settings
- Security headers
- Performance optimizations
- Build optimizations

### Tailwind CSS

Custom Tailwind configuration in `tailwind.config.ts` with:
- Custom color palette
- Extended spacing and typography
- Animation utilities

### TypeScript

Strict TypeScript configuration ensuring type safety across the application.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build and run with Docker
npm run docker:up

# Production deployment
npm run docker:prod:up
```

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## 📊 Monitoring & Analytics

### Health Checks

- `/api/health` - Basic health check
- `/api/health` (POST with detailed=true) - Detailed health check

### Analytics Integration

- **Google Analytics 4**: Page views, events, performance metrics
- **Sentry**: Error tracking and performance monitoring
- **Hotjar**: User behavior analytics

### Performance Monitoring

- Core Web Vitals tracking
- Bundle size monitoring
- Memory usage tracking
- API response time monitoring

## 🔒 Security

### Content Security Policy

Configured CSP headers to prevent XSS attacks and unauthorized resource loading.

### Security Headers

- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=()

### Input Validation

All forms use Zod schemas for client-side validation and sanitization.

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode**: System preference detection with manual toggle
- **Accessibility**: WCAG 2.1 AA compliant
- **Animations**: Smooth transitions with Framer Motion
- **Loading States**: Skeleton loaders and progress indicators

## 📱 Progressive Web App (PWA)

Features include:
- Service worker for offline functionality
- Web app manifest
- Install prompt
- Background sync

## 🔧 Development Guidelines

### Code Style

- ESLint configuration for consistent code style
- Prettier for code formatting
- Husky pre-commit hooks for quality checks

### Component Structure

```typescript
// Example component structure
interface ComponentProps {
  // Props interface
}

export function Component({ prop }: ComponentProps) {
  return (
    // JSX
  )
}
```

### State Management

Using Zustand for global state management:

```typescript
// Store definition
export const useStore = create((set) => ({
  // State and actions
}))
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, please contact the development team or create an issue in the repository.