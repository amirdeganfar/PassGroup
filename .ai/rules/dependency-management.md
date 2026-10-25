---
name: dependency-management
type: rule
description: Guidelines for adding libraries and testing changes
trigger: Before adding dependencies or running projects
tools: [claude-code, cursor]
---

# Dependency Management

## Adding Libraries

**Always confirm** before adding new libraries or dependencies.

- Verify necessity and compatibility
- Check for security advisories
- Use the latest stable version

## Testing Changes

When adding or modifying dependencies:

1. **Run the project** to verify it builds and starts
2. **Test in browser** using available development tools
3. **Check key screens** for visual regressions
4. **Verify package versions** are up-to-date

## Version Management

- Always use the latest stable version
- Document breaking changes
- Test with the specified version before committing
