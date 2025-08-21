# Guidelines for Creating Practice Arrays

These guidelines describe how to add flashcard-style practice prompts for each lesson. Practice is used by the Practice page at route `/lesson/:lessonNumber/practice` and can be launched from the Lesson page via the "Practice" button.

## Where practice data lives

- **Foundations (1–10):** `public/data/foundation_lessons.json`
- **Part 2 (11–25):** `public/data/part2_lessons_11_25.json`
- **Part 3 (26–30):** `public/data/part3_lessons_26_30.json`
- **Part 3 (31–35):** `public/data/part3_lessons_31_35.json`
- **Part 4 (36–40):** `public/data/part4_lessons_36_40.json`
- **Part 4 (41–45):** `public/data/part4_lessons_41_45.json`
- **Part 4 (46–50):** `public/data/part4_lessons_46_50.json`

Each file contains a top-level `lessons` array. Add the `practice` property to the appropriate lesson object in the correct file.

## Practice array shape

- Add a `practice` array at the top level of a single lesson object (sibling to `turns`).
- Each entry is an object with two fields:
  - `prompt` (English, shown on the card first)
  - `answer` (isiXhosa, revealed when clicking "Check Answer")

Example (from Lesson 1 in `public/data/foundation_lessons.json`):

```json
"practice": [
  { "prompt": "How would you say 'side' in isiXhosa?", "answer": "Cala." },
  { "prompt": "How would you say 'criticise' in isiXhosa?", "answer": "Gxeka." },
  { "prompt": "How would you say 'start' in isiXhosa?", "answer": "Qala." }
]
```

## What to include

- **Coverage:** Aim to create one practice card for every isiXhosa utterance that a learner should produce in the lesson.
  - Preferred source is the lesson's `student_dialogue` lines inside `turns` (e.g., `"student_dialogue": "Ndifuna iti?"`).
  - If a target utterance is implied but not present as `student_dialogue`, you may still include it when the lesson clearly expects the learner to produce that form.
- **Prompt quality:** Use short, direct English prompts that cue the target isiXhosa output, e.g.:
  - "How would you say 'I want tea'?"
  - "Say 'The trees want' in isiXhosa."
- **Answer fidelity:** Copy the isiXhosa exactly as the lesson teaches (including capitalization and punctuation).

## Style rules for prompts and answers

- **English prompts:**
  - Keep concise and explicit. Prefer “How would you say '…'?” or “Say '…' in isiXhosa.”
  - Use single quotes `'` around the English phrase inside the sentence. Escape internal quotes as needed for JSON.
  - Avoid grammar metalanguage in prompts (the teaching happens in the lesson, not the card).
- **isiXhosa answers:**
  - Copy exactly from the lesson (from `student_dialogue` or the explicitly taught form).
  - Preserve punctuation (e.g., final period/question mark) if present in the lesson content.
  - Do not add English glosses in the `answer` string.

## Ordering and granularity

- **Ordering:** Follow the lesson sequence. Cards should feel like a natural recap of the taught flow.
- **Granularity:** Prefer one clear utterance per card. If a turn teaches two contrasting forms, you may split into two cards.

## Fallback behavior (when `practice` is missing)

- The Practice page will automatically derive items from `student_dialogue` entries if `practice` is absent.
- The auto-derived prompt is a generic label (e.g., "Say it in isiXhosa (card 3)").
- To provide high-quality, English-specific prompts, add a curated `practice` array.

## Validation checklist before committing JSON

- Valid JSON only (double quotes for keys/strings, no trailing commas).
- `practice` is a sibling of `turns` inside a single lesson object.
- Every entry has both `prompt` and `answer` as strings.
- Answers faithfully match the lesson-taught isiXhosa.

## How to add practice to a lesson (step-by-step)

1. Open the correct data file for the lesson range (see paths above).
2. Locate the lesson object inside the `lessons` array.
3. Identify all target isiXhosa utterances from `turns` (`student_dialogue`) or clearly taught forms.
4. Add a `practice` array with one `{ prompt, answer }` per utterance.
5. Save. Tell the user to run `pnpm build` and navigate to `/lesson/<n>/practice` to test cards.

## Relevant code paths

- Practice page: `src/pages/LessonPracticePage.tsx`
- Lesson page (Practice button): `src/pages/LessonPage.tsx`
- Routing: `src/App.tsx`
- Data files: `public/data/*.json`

By following this guide, you’ll ensure every lesson has high-quality practice cards that align tightly with the taught content and render cleanly in the Practice mode.
