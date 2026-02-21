---
title: MBTI Question Bank 2026
created: 2026-02-21
category: dataset
status: active
source: in-house
summary: Localized MBTI questionnaire (40 items) for Taiwan, United States, Japan, South Korea with cultural notes.
tags: [mbti, questionnaire, localization, 2026, obsidian-db]
---

## Files (authoritative)
- Combined CSV: `output/spreadsheet/mbti_question_bank_2026.csv`
- Per-country CSVs: `output/spreadsheet/mbti_question_bank_2026_taiwan.csv`, `..._united_states.csv`, `..._japan.csv`, `..._south_korea.csv`

## Schema
| column | description |
| --- | --- |
| Question_ID | Stable ID (Q01–Q40 per country). |
| Country | Taiwan / United States / Japan / South Korea. |
| Dimension | EI, SN, TF, JP, AT (last = Attitude/Anxiety Tolerance). |
| Context | Scenario/question stem, localized. |
| Option_A | First answer choice, localized. |
| Option_B | Second answer choice, localized. |
| Cultural_Note | Local meme/explanation to retain nuance. |

## Usage
- Default filter by `Country` to keep cultural tone intact.
- Question order is preserved per country via `Question_ID` (01–40).
- Safe for ingestion by apps/LLMs; text is UTF-8.

### Quick pandas snippet
```python
import pandas as pd
df = pd.read_csv('output/spreadsheet/mbti_question_bank_2026.csv')
taiwan = df[df.Country == 'Taiwan']
```

## Maintenance
- Add new locales by appending a country CSV in `tmp/spreadsheets/`, then regenerate via the python combine step (see git history for command).
- Keep `Question_ID` stable when updating wording; add new IDs only when adding new items.
