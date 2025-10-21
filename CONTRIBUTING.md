# Contributing to GameDev MCP Hub

Thank you for your interest in contributing to the GameDev MCP Hub! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/gamedev-mcp-hub.git
   cd gamedev-mcp-hub
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Create a branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Process

### Building

```bash
pnpm build
```

### Running in Development

```bash
pnpm dev
```

### Type Checking

```bash
pnpm type-check
```

### Linting

```bash
pnpm lint
pnpm lint:fix
```

### Formatting

```bash
pnpm format
pnpm format:check
```

## Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update the CHANGELOG.md following the format
3. Ensure all tests pass
4. Ensure code is properly formatted and linted
5. Update documentation for any API changes
6. Request review from maintainers

### PR Title Format

Use conventional commits format:
- `feat: Add new feature`
- `fix: Fix bug`
- `docs: Update documentation`
- `test: Add tests`
- `refactor: Refactor code`
- `chore: Maintenance tasks`

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Prefer interfaces over type aliases for object types
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

### Code Style

- 2 spaces for indentation
- Single quotes for strings
- Semicolons required
- Max line length: 100 characters
- Trailing commas in objects and arrays

### Error Handling

- Use custom error classes from `utils/error-handler.ts`
- Log errors with appropriate context
- Provide meaningful error messages

## Testing

### Running Tests

```bash
# All tests
pnpm test

# Unit tests
pnpm test:unit

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e

# Watch mode
pnpm test:watch
```

### Writing Tests

- Place tests in the `tests/` directory
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Aim for >80% code coverage

## Documentation

### Code Documentation

- Add JSDoc comments to all public functions and classes
- Include parameter types and return types
- Provide usage examples for complex functions
- Document error conditions

### User Documentation

- Update `/docs` for API changes
- Add examples for new features
- Keep configuration guide up to date
- Include troubleshooting tips

## Adding New MCP Servers

To add support for a new MCP server:

1. Add configuration to `config/mcp-servers.example.json`
2. Create adapter if needed in `src/servers/`
3. Add category to `config/categories.json` if new
4. Update README.md
5. Update CHANGELOG.md
6. Add documentation in `/docs`
7. Add tests

## Release Process

Releases are managed by maintainers:

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create git tag
4. Push to GitHub
5. Publish to npm
6. Create GitHub release

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions
- Contact maintainers for urgent matters

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to GameDev MCP Hub! 🎮
