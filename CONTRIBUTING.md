# Contributing to Swapy

Thank you for your interest in contributing! 🎉

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/Swapy.git`
3. Create a branch: `git checkout -b feature/amazing-feature`
4. Make your changes
5. Test thoroughly
6. Commit: `git commit -m 'Add amazing feature'`
7. Push: `git push origin feature/amazing-feature`
8. Open a Pull Request

## Development Setup

See [QUICK_START.md](QUICK_START.md) for setup instructions.

## Code Standards

### TypeScript
- Use TypeScript for all new code
- Define proper types/interfaces
- Avoid `any` type when possible
- Use type inference where appropriate

### React
- Use functional components
- Prefer hooks over class components
- Keep components small and focused
- Use proper prop types

### Styling
- Use TailwindCSS classes
- Follow existing color scheme
- Ensure responsive design
- Test on mobile

### Firebase
- Follow security best practices
- Optimize queries
- Handle errors gracefully
- Use batch operations when possible

## Testing

Before submitting:
- [ ] Test locally (`npm run dev`)
- [ ] Test on mobile viewport
- [ ] Check for console errors
- [ ] Verify Firebase rules
- [ ] Test edge cases

## Commit Messages

Format: `type(scope): description`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

Examples:
```
feat(matching): add scarcity factor to score
fix(upload): handle large image files
docs(readme): update deployment steps
```

## Pull Request Guidelines

### Before Submitting
- [ ] Code follows style guide
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] No console errors
- [ ] Lint passes

### PR Description
Include:
- What does this PR do?
- Why is this change needed?
- How was it tested?
- Screenshots (for UI changes)
- Related issues

### Review Process
1. Submit PR
2. Automated checks run
3. Maintainer review
4. Address feedback
5. Approval & merge

## Feature Requests

Have an idea? Open an issue with:
- Clear title
- Problem description
- Proposed solution
- Use cases
- Mockups (if applicable)

## Bug Reports

Found a bug? Open an issue with:
- Clear title
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots
- Browser/device info

## Code Review Checklist

Reviewers check for:
- [ ] Functionality works as expected
- [ ] Code is readable and maintainable
- [ ] Follows project conventions
- [ ] No security vulnerabilities
- [ ] Performance considerations
- [ ] Error handling present
- [ ] Documentation updated

## Areas for Contribution

### High Priority
- [ ] Unit tests for matching algorithm
- [ ] E2E tests with Cypress
- [ ] Image compression before upload
- [ ] Search/filter functionality
- [ ] User profile pages
- [ ] Chat system

### Medium Priority
- [ ] Dark mode support
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Mobile app (React Native)
- [ ] Admin dashboard
- [ ] Reputation system

### Documentation
- [ ] Video tutorials
- [ ] API documentation
- [ ] Architecture diagrams
- [ ] User guides
- [ ] FAQ page

## Community

- Be respectful and inclusive
- Help others learn
- Give constructive feedback
- Follow code of conduct

## Questions?

- Open a GitHub Discussion
- Tag maintainers in issues
- Check existing documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing!** 🚀

