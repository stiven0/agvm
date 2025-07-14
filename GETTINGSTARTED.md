# Getting Started

In this document we will explain how you can adapt your local environment.

## 🛠️ Tools

- Nodejs >= 18.19.0
- Npm >= 10

## 📋 Development Workflow

### 1. Clone and Install

```bash
git clone https://github.com/stiven0/agvm.git
cd agvm
npm install
npm run build
```

### 2. Run Locally

For this you have two options

- Option A (npm link):

```bash
npm link # Create a global symbolic link
npm run build #  Re-run after every code change
agvm # You can now use the command globally
npm unlink -g agvm # (Optional) Disconnect when you're done

```

- Option B (npm run install-cli-local)

If you have problems with the previous step (npm link) you can do this:

```bash
npm run install-cli-local # Builds and installs the CLI globally
agvm # You can now use the command globally
```

### 3. Test on another machine (simulate user installation)

To simulate how a real user would install AGVM:

- Create package:

```bash
npm pack # → generates agvm-x.x.x.tgz
```

- Install package:

```bash
npm install -g ./agvm-x.x.x.tgz # agvm - You now have the command available to test
```

- Uninstall package:

```bash
npm uninstall -g agvm
```

Thus installing the generated **.tgz** simulates the behavior of **npm install -g agvm**