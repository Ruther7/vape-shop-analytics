# Security Notes

## Vulnerability Warnings

The project shows 3 high severity vulnerabilities during `npm audit`. These are:

1. **Location**: Development dependencies only (eslint-config-next and related packages)
2. **Impact**: **No production impact** - These vulnerabilities are only in development tools (ESLint plugins)
3. **Risk Level**: Low - The vulnerabilities are in the `glob` package used by ESLint plugins, which only run during development

## Why This is Acceptable

- These vulnerabilities are in **development dependencies only**
- They do not affect the production build or runtime
- They only impact the linting/development tools
- For a student project, this is acceptable

## If You Want to Fix Them

If you want to address these warnings (optional for a student project), you can:

1. **Option 1**: Update to Next.js 16 (may require code changes):
   ```bash
   npm install next@latest react@latest react-dom@latest
   ```

2. **Option 2**: Suppress audit warnings for dev dependencies (add to `.npmrc`):
   ```
   audit-level=moderate
   ```

3. **Option 3**: Accept the warnings (recommended for student projects)

## Deprecation Warnings

The deprecation warnings are from transitive dependencies (packages used by other packages). These are:
- `inflight`, `rimraf`, `glob` - Used by older versions of build tools
- `@humanwhocodes/*` - Used by ESLint

These are safe to ignore for this project as they don't affect functionality.

## Production Build

The production build (`npm run build`) is not affected by these warnings. The application will run correctly in production.

