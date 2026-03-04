# Snowflake Learning Hub

Independent, community-built learning portal for Snowflake certification prep.

This repository is configured for:
- Local static web preview (`index.html` + `app.js` + `styles.css`)
- Streamlit publishing (`streamlit_app.py`)
- GitHub upload/deployment from the `main` branch

## Features

- Certification path cards and study plan timeline
- Exam and difficulty filters
- Quiz flow with explanations and score feedback
- XP/level gamification using browser local storage
- Resource links for hands-on practice

## Project structure

```text
my-snowflake-labs/
├─ .streamlit/
│  └─ config.toml
├─ data/
│  └─ content-v3.json
├─ app.js
├─ index.html
├─ LICENSE
├─ README.md
├─ requirements.txt
├─ streamlit_app.py
└─ styles.css
```

## Quick start (local)

1. Create and activate a virtual environment.
2. Install dependencies.
3. Run Streamlit.

```bash
cd /Users/<your-username>/VSCode/snowflake-labs/my-snowflake-labs
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
streamlit run streamlit_app.py
```

Open `http://localhost:8501`.

## Static preview option

```bash
cd /Users/<your-username>/VSCode/snowflake-labs/my-snowflake-labs
python3 -m http.server 5173
```

Open `http://localhost:5173`.

## Streamlit Community Cloud publish

1. Push this repo to GitHub.
2. In Streamlit Community Cloud, create a new app from this repo.
3. Set:
- Branch: `main`
- Main file path: `streamlit_app.py`
4. Deploy.

## GitHub Pages publish (public static site)

This repository is configured with `.github/workflows/pages.yml` to deploy the static app from `main`.

Expected URL:
- `https://oceanicpatterns.github.io/snowflake-labs/`

Notes:
- GitHub Pages serves the static web app (`index.html`, `styles.css`, `app.js`, `data/content-v3.json`).
- `streamlit_app.py` is for Streamlit hosting, not GitHub Pages runtime.

## GitHub upload checklist (main branch)

```bash
cd /Users/<your-username>/VSCode/snowflake-labs/my-snowflake-labs
git init
git checkout -B main
git add .
git commit -m "Prepare repo for Streamlit publishing"
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

If the repo already exists locally, skip `git init` and only run the missing steps.

## Content management

Study content is maintained in:
- `data/content-v3.json`

When updating content:
1. Keep IDs stable.
2. Keep quiz `questionIds` aligned with `quizQuestions` IDs.
3. Validate JSON formatting before committing.

## Security and repository hygiene

- Secrets are not required for this app.
- `.streamlit/secrets.toml` is ignored by git.
- Vulnerability reporting process is documented in `SECURITY.md`.
- Keep `main` protected in GitHub settings (recommended):
- Require pull request before merge.
- Require status checks before merge.

## Disclaimer

This project is independent and not official, sponsored, or affiliated with Snowflake.
It is for education and practice only.
