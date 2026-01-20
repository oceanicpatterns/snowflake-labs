# My Snowflake Learning Hub

A lightweight, local study portal for Snowflake certification prep. This project is **not official** and is **not affiliated with Snowflake**. All materials here are free and open-source for learning, practice, and exam preparation only.

## What this includes

- Exam-focused quizzes and question packs (Core + Advanced tracks)
- Difficulty filtering and instant UI updates
- Explanations for answers
- XP + progress gamification

## Run locally (recommended)

Use a simple local web server so the app can load JSON data correctly.

### Option A — Python (macOS/Linux)

```bash
cd /path/to/my-snowflake-labs
python3 -m http.server 5173
```

Open <http://localhost:5173> in your browser.

### Option B — Python (Windows)

```bash
cd C:\path\to\my-snowflake-labs
python -m http.server 5173
```

Open <http://localhost:5173> in your browser.

## Project structure

```
my-snowflake-labs/
├─ index.html       # UI layout
├─ styles.css       # Styling
├─ app.js           # App logic (rendering, filters, quiz flow)
└─ data/
   └─ content-v3.json  # Study content (quizzes + questions)
```

## Customize content

All quizzes and questions live in:

- data/content-v3.json

You can add new question packs by:

1. Adding a quiz object in `examQuizzes`.
2. Creating question objects in `questions` with matching `questionIds`.

## Tips for studying

- Use the filters to focus on one exam or difficulty.
- Mix “domain packs” with “scenario packs” to test applied knowledge.
- Revisit explanations to strengthen weak areas.

## Troubleshooting

- **Blank page or no questions**: ensure you’re running a local server (not opening index.html directly).
- **Port already in use**: change the port, e.g. `python3 -m http.server 5180`.

## Disclaimer

This is an independent, community-built learning portal. Content is for educational use only and does not represent official Snowflake materials or guarantees.

## Contact

Open a GitHub issue in this repo for questions or requests. If issues are disabled, use the GitHub profile contact options here: <https://github.com/oceanicpatterns>
