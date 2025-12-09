# Contributing to GAS Link

Thank you for considering contributing to GAS Link! This document provides guidelines for contributing to the project.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, browser, versions)
- Screenshots if applicable

### Suggesting Features

Feature suggestions are welcome! Please open an issue with:
- Clear description of the feature
- Use cases and benefits
- Potential implementation approach
- Mockups or examples if applicable

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**:
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed
4. **Test your changes**:
   - Test locally (frontend + backend)
   - Verify all existing features still work
   - Add test cases if applicable
5. **Commit your changes**:
   ```bash
   git commit -m "Add: brief description of changes"
   ```
   Use conventional commits:
   - `Add:` for new features
   - `Fix:` for bug fixes
   - `Update:` for improvements
   - `Refactor:` for code refactoring
   - `Docs:` for documentation
6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request**:
   - Describe what you changed and why
   - Reference any related issues
   - Ensure CI passes (if set up)

## Code Style Guidelines

### TypeScript/JavaScript
- Use TypeScript for type safety
- Prefer `const` over `let`
- Use arrow functions where appropriate
- Avoid `any` types when possible
- Add JSDoc comments for complex functions

### React
- Use functional components with hooks
- Extract reusable logic into custom hooks
- Keep components small and focused
- Use meaningful component and prop names

### CSS/Tailwind
- Use Tailwind utility classes
- Keep custom CSS minimal
- Follow responsive design principles

### Backend (Workers)
- Keep route handlers thin
- Extract business logic to services/utils
- Use async/await consistently
- Handle errors gracefully
- Add logging for debugging

## Project Structure

```
gas-link/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── api/      # API client layer
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   └── types.ts
│   └── package.json
├── workers/          # Cloudflare Workers backend
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── types.ts
│   └── package.json
└── database/
    └── schema.sql
```

## Development Workflow

1. **Setup local environment** (see SETUP.md)
2. **Create feature branch**
3. **Make changes**
4. **Test thoroughly** (see TESTING.md)
5. **Update documentation** if needed
6. **Submit PR**

## Testing

Before submitting PR:
- [ ] All existing features work
- [ ] New features work as expected
- [ ] No console errors
- [ ] Responsive design maintained
- [ ] Edge cases handled
- [ ] Documentation updated

## Database Migrations

If you modify database schema:
1. Update `database/schema.sql`
2. Document migration steps
3. Test migration locally
4. Include rollback instructions

## Adding Dependencies

Before adding new dependencies:
- Check if absolutely necessary
- Consider bundle size impact
- Verify license compatibility
- Update `package.json`
- Document in PR why it's needed

## Documentation

When adding features:
- Update README.md if user-facing
- Update ARCHITECTURE.md if technical
- Add inline comments for complex logic
- Update CHANGELOG.md

## Questions?

Feel free to open an issue for:
- Clarification on contribution process
- Technical questions
- Feature discussions
- General feedback

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Assume good intentions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing! 🙏**
