// Most commonly used commit types
// build: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
// ci: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
// docs: Documentation only changes
// feat: A new feature
// fix: A bug fix
// perf: A code change that improves performance
// refactor: A code change that neither fixes a bug nor adds a feature
// style: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.)
// test: Adding missing tests or correcting existing tests

/**
 * Commit structure
 * <type>(<scope>): <subject> - the scope is optional
 * <BLANK LINE>
 * <body> - optional
 * <BLANK LINE>
 * <footer> - optional
 */

/**
 * Examples
 * feat: added new section to the 'xxxxxx' module
 * fix: updated the version of the 'xxxxx' library
 * docs(router): added documentation for the router
 *
 * Commit with body ⬇️
 * perf: improved server startup speed
 *
 * Improved the etc....
 *
 * Reviewed by: Z
 */


module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
      'subject-min-length': [2, 'always', 10],
      'subject-max-length': [2, 'always', 200]
    }
};