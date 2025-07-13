# AGVM – Angular Global Version Manager (Beta)

Cross-platform Angular CLI version manager.

[![npm](https://img.shields.io/npm/v/agvm)](https://www.npmjs.com/package/agvm)
![license](https://img.shields.io/npm/l/agvm)


---

## ❓ Why AGVM?

Managing multiple global versions of Angular CLI can be a pain — especially when switching between projects.

AGVM solves this by:

- Installing multiple Angular CLI versions side-by-side
- Switching between them easily
- Automatically restoring your original global version when needed
- Working cross-platform (Linux & Windows)


## ⚙️ Initial Setup (Linux/macOS Only)

For AGVM to work **without `sudo`**, perform these steps once:

1. **Set npm's global prefix to your user directory**:

```bash
npm config set prefix ~/.local
```

2. **Add ~/.local/bin to your PATH**:

```bash
grep -qxF 'export PATH="$HOME/.local/bin:$PATH"' ~/.bashrc \
  || echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

3. **If agvm use or agvm uninstall doesn’t update the ng command properly, run:**:

```bash
hash -r   # for bash/sh
rehash    # for zsh
```

## ✅ Windows users: No setup needed, you're good to go!

---

> ⚠️ **Disclaimer – Beta Notice**
>
> AGVM is currently in **beta**. While it has been tested on Linux and Windows, you may still encounter bugs or edge cases.  
> Please report any issues or suggestions in the [issue tracker](https://github.com/stiven0/agvm/issues).
>
> If you're using `nvm` to manage your Node.js versions, **remember to re-run**:
>
> ```bash
> agvm use <angular-version>
> ```
>
> This is necessary because AGVM depends on the `npm prefix` associated with the current Node.js version.  
> Failing to do so may result in unexpected behavior or a broken `ng` command.
>
> When switching Node versions via `nvm use`, you may also see a warning like:
>
> ```
> Your user’s .npmrc file (${HOME}/.npmrc)
> has a `globalconfig` and/or a `prefix` setting, which are incompatible with nvm.
> ```
>
> You can safely suppress this by using:
>
> ```bash
> nvm use --delete-prefix <version> --silent
> ```
>
> 🩺 If you suspect a problem, run:
>
> ```bash
> agvm doctor
> ```
>
> It will validate your environment and offer hints to fix common issues.


## 📦 Installation

### 📋 Requirements:

- Node.js >= 18.19.0
- npm >= 10

Install AGVM globally:

```bash
npm install -g agvm
```


## 🚀 Basic Usage

```bash
# Install a specific Angular CLI version
agvm install 17.3.8

# Use a specific version
agvm use 17.3.8

# List installed versions
agvm list

# Check your configuration
agvm doctor

# Uninstall a version
agvm uninstall 17.3.8
```

## 🧪 Local Development
To contribute or test AGVM locally, see [GETTING_STARTED.md](./GETTINGSTARTED.md) for:

- Cloning and building the CLI

- Testing locally via npm link or direct install

- Packaging with npm pack for other machines

## 🤝 Contributing
We welcome contributions!

- See the [Contributing Guide](./CONTRIBUTING.md)

- Follow our [Code of Conduct](./CODE_OF_CONDUCT.md)

- Make sure to follow our linting and commit conventions

## 📖 Resources

- [GETTING_STARTED.md](./GETTINGSTARTED.md) – Local dev guide

- [CONTRIBUTING.md](./CONTRIBUTING.md) – Contribution guide

- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) – Community standards

- [LICENSE](./LICENSE.md) – MIT License