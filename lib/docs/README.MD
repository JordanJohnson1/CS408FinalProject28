# Full-Stack Web Application

This repository contains a full-stack web application built with Ruby on Rails,
Bootstrap, and SQLite. It includes scripts and documentation for setting up,
configuring, and running the application locally with automated testing using
GitHub Actions.

- [Development Guide](docs/README.md)

## Technology Stack

- Backend technology stack
    - Web Server: Built-in Rails server (Puma)
    - Backend Runtime: Ruby
    - Backend Framework: Ruby on Rails
    - Database: SQLite for lightweight development and testing storage
- Frontend technology stack
    - Templates: ERB (Embedded Ruby) for server-side rendering
    - UX/UI: Bootstrap 5 (CDN) for responsive design
- Testing Frameworks
    - Unit Testing: Minitest (Rails default testing framework)
    - Continuous Integration: GitHub Actions (runs tests on every push)
 
## Team Workflow

- Solo developer
- All development is performed directly in the main repository
- GitHub Actions automatically runs unit tests on every push to the main branch
- Documentation is maintained in the `/docs` directory and updated throughout the semester
