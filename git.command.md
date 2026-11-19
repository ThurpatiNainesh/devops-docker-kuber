# Git — Push Code to a Different Repository

## 1. Check the current remote

```bash
git remote -v
```

This shows which GitHub repository your project is currently connected to.

---

## 2. Change the remote repository

If you want to replace the existing GitHub repository with a new one:

```bash
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_NEW_REPO.git
```

Verify the change:

```bash
git remote -v
```

---

## 3. Add your changes

```bash
git add .
```

---

## 4. Commit your changes

```bash
git commit -m "Your commit message"
```

Example:

```bash
git commit -m "Update user API"
```

---

## 5. Push to the new repository

```bash
git push -u origin main
```

If your branch is named `master` instead:

```bash
git push -u origin master
```

---

## Complete Workflow

```bash
git remote -v

git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_NEW_REPO.git

git add .

git commit -m "Update code"

git push -u origin main
```

---

## Option 2 — Keep Both Repositories

If you want to keep the original repository and push to another repository without replacing `origin`:

### Add a second remote

```bash
git remote add newrepo https://github.com/YOUR_USERNAME/YOUR_NEW_REPO.git
```

### Check remotes

```bash
git remote -v
```

### Push to the new repository

```bash
git push -u newrepo main
```

### Push to the original repository

```bash
git push origin main
```

---

## Useful Git Commands

| Command | Purpose |
|---|---|
| `git status` | Check working tree changes |
| `git remote -v` | Show connected repositories |
| `git remote set-url origin URL` | Change the origin URL |
| `git remote add NAME URL` | Add another remote |
| `git add .` | Stage all changes |
| `git commit -m "message"` | Commit changes |
| `git push origin main` | Push to original remote |
| `git push newrepo main` | Push to another remote |
| `git pull origin main` | Pull changes from original repo |
| `git branch` | List local branches |
| `git log --oneline` | View commit history |

---

## Important

- Changing `origin` does **not** delete your local code.
- You can push the same project to multiple GitHub repositories.
- Make sure the target repository exists on GitHub.
- If the new repository already contains commits, you may need to pull or reconcile them before pushing.
- Never commit `.env`, passwords, API keys, or secrets.
