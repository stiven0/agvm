# Contributing to AGVM

We welcome contributions to AGVM! This document outlines the process and guidelines to follow when contributing code, reporting bugs, or proposing features.

## 📋 Before You Start

- Check the [issues](https://github.com/stiven0/agvm/issues) to see if your suggestion or bug has already been discussed.
- For major changes, open an issue first to discuss what you’d like to change.
- Be respectful and follow our [Code of Conduct](./CODE_OF_CONDUCT.md).

## 🛠️ How to Contribute

### 1. Clone and Install
```bash
git clone https://github.com/stiven0/agvm.git
cd agvm
npm install
```

### 2. Follow Coding Standards

We use:

- ESLint for code quality
- Prettier for consistent formatting
- Commitlint + Husky for conventional commits

#### Run locally

```bash
npm run lint # check linting
npm run lint:fix # fix linting
npm run prettier # check format
npm run prettier:fix # fix format
```

### Git Conventions

We follow Conventional Commits, e.g.:

```vbnet
feat: add new version manager
fix: handle config parsing bug
docs: update README instructions
```

- See our [commitlint config](./commitlint.config.js) for allowed formats.

### Making a Pull Request (PR)

Before you submit your Pull Request (PR) consider the following guidelines:

- Make your changes in a new git branch:
```bash
git checkout -b my-new-branch dev
```

- Make sure your PR is based on the `dev` branch, not `main`.

- Follow our conventions mentioned above.

- Test your changes on the supported operating system(s) (Windows, Linux).

- Make sure npm run lint and npm run prettier pass before submitting.

- Write clear PR titles and link to relevant issues.

## ⚙️ Local Development Guide

To set up and run AGVM locally, refer to [GETTING_STARTED.md](./GETTINGSTARTED.md).

## 🤝 Thank You

Thanks for taking the time to contribute! 🙌