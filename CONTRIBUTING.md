# Contributing to SubTrack

Thank you for your interest in contributing to SubTrack! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/SubTrack.git`
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Install** dependencies: `npm install`
5. **Start** development server: `npm run dev`
6. **Make** your changes
7. **Test** your changes: `npm run test`
8. **Commit** with conventional commits: `git commit -m "feat: add amazing feature"`
9. **Push** to your fork: `git push origin feature/amazing-feature`
10. **Create** a Pull Request

## 📋 Development Setup

### Prerequisites
- Node.js 20+
- npm 10+
- Git
- Supabase CLI (for local development)

### Environment Setup
1. Copy `.env.example` to `.env.local`
2. Set up your Supabase project
3. Configure environment variables
4. Run database migrations: `supabase db reset`

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run seed         # Seed database with demo data
```

## 🏗️ Project Structure

```
SubTrack/
├── src/
│   ├── app/                 # App entry point
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   └── marketing/      # Marketing page components
│   ├── features/           # Feature modules
│   │   ├── subscriptions/  # Subscription management
│   │   ├── billing/        # Billing & payments
│   │   ├── teams/          # Team collaboration
│   │   ├── onboarding/     # User onboarding
│   │   └── currency/       # Currency handling
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── pages/              # Page components
│   └── types/              # TypeScript type definitions
├── supabase/               # Database & backend
│   ├── migrations/         # Database migrations
│   ├── edge-functions/     # Supabase Edge Functions
│   └── functions/          # Database functions
├── e2e/                    # End-to-end tests
└── public/                 # Static assets
```

## 🧪 Testing

### Unit Tests
- **Framework**: Vitest
- **Location**: `*.test.ts` files alongside source code
- **Run**: `npm run test`

### E2E Tests
- **Framework**: Playwright
- **Location**: `e2e/` directory
- **Run**: `npm run test:e2e`

### Test Guidelines
- Write tests for all new features
- Maintain >80% code coverage
- Test both success and error scenarios
- Use descriptive test names
- Mock external dependencies

## 📝 Code Style

### TypeScript
- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use proper type annotations
- Avoid `any` type

### React
- Use functional components with hooks
- Follow React best practices
- Use proper prop types
- Implement proper error boundaries

### Styling
- Use Tailwind CSS for styling
- Follow mobile-first approach
- Ensure accessibility compliance
- Support light/dark themes

### Naming Conventions
- **Files**: kebab-case (`subscription-form.tsx`)
- **Components**: PascalCase (`SubscriptionForm`)
- **Functions**: camelCase (`getSubscriptionData`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_SUBSCRIPTIONS`)
- **Types**: PascalCase (`SubscriptionData`)

## 🔄 Git Workflow

### Branch Naming
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `hotfix/critical-fix` - Critical fixes
- `docs/documentation` - Documentation updates
- `refactor/component-name` - Code refactoring

### Commit Messages
Use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tooling changes

**Examples:**
```
feat(subscriptions): add subscription limit enforcement
fix(billing): resolve Stripe webhook processing issue
docs(readme): update installation instructions
```

### Pull Request Process
1. **Title**: Use conventional commit format
2. **Description**: Use the provided template
3. **Labels**: Add appropriate labels
4. **Reviewers**: Request reviews from CODEOWNERS
5. **Tests**: Ensure all tests pass
6. **Documentation**: Update docs if needed

## 🐛 Bug Reports

When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, browser, etc.)
- Screenshots/videos if applicable
- Console logs/error messages

## 💡 Feature Requests

When requesting features, please include:
- Clear description of the feature
- Problem it solves
- Proposed solution
- User story format
- Priority level
- Mockups/wireframes if applicable

## 🔒 Security

- **Security issues**: Use the security vulnerability template
- **Responsible disclosure**: Don't disclose publicly until resolved
- **Contact**: Report to maintainers privately if needed

## 📚 Documentation

- Keep documentation up to date
- Use clear, concise language
- Include code examples
- Add screenshots for UI changes
- Update README.md for major changes

## 🤝 Code Review

### Review Guidelines
- Be constructive and respectful
- Focus on code quality and functionality
- Check for security issues
- Ensure proper testing
- Verify documentation updates

### Review Checklist
- [ ] Code follows project conventions
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed
- [ ] Accessibility requirements met

## 🏆 Recognition

Contributors will be recognized in:
- Project README
- Release notes
- GitHub contributors page
- Special mentions for significant contributions

## 📞 Support

- **Issues**: Use GitHub Issues
- **Discussions**: Use GitHub Discussions
- **Questions**: Check existing issues/discussions first

## 📄 License

By contributing to SubTrack, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to SubTrack! 🚀 