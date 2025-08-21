# Socratic isiXhosa Lesson Writing Style Guide

Derived from Lessons 1–5 in `public/data/foundation_lessons.json`. This document defines structure, tone, formatting, and pedagogical rules to ensure new lessons match the established style.

## Core Teaching Principles (Thinking Method)

- **Importing Knowledge**: Use familiar analogies to introduce new sounds/concepts (e.g., tsk-tsk, horse call, cork pop).
- **One Thought at a Time**: Break constructions into minimal, sequential building blocks.
- **Managing Cognitive Load**: Reassure, avoid rote memorization, and reduce anxiety with small steps.
- **Weaving**: Reuse previously learned items to connect lessons.
- **Masked Repetition**: Practice the same pattern with new words/contexts.
- **Reframing**: Present “rules” as intuitive logic (agreement labels, sound mergers) rather than arbitrary grammar.

## Lesson Object Structure (JSON)

Each lesson in `public/data/foundation_lessons.json` follows this shape:

- **lesson_title**: Bolded Markdown, e.g., `**Lesson 2: 'I am' and 'You are' - Your First Sentences**`.
- **thinking_method_focus**: 2–4 items from: Importing Knowledge, One Thought at a Time, Managing Cognitive Load, Weaving, Masking Repetition, Reframing (others may appear later but keep consistent with prior usage).
- **objective**: Clear capability statement tied to the lesson’s minimal scope.
- **key_vocabulary**: Array of `{ word, meaning }`. Use hyphens for stems and morphemes (e.g., `ndi-`, `-funa`). Include brief grammatical tags in meaning when helpful (e.g., “verb root”, “Class 1”).
- **turns**: Ordered array of turn objects (see Turn Structure).

## Turn Structure

A turn has:

- **turn_number**: Sequential integer starting at 1.
- **section**: Use consistent labels. Common ones:
  - Opening (or Opening & Weaving)
  - Introducing ... / Building ... / Practicing ... / Practice and Consolidation
  - Student Dialogue
  - Closing (optionally with Reinforcement)
  - Bonus (rare, optional)
- **teacher_dialogue** OR **student_dialogue**: Only one per turn.
- **justification** (optional but recommended for teacher turns): 1–3 sentences citing the principle(s) used and why the move helps.

Typical flow:

1. **Opening** reframes the challenge and cues the plan.
2. **Introduce one idea** (sound, morpheme, label) and immediately apply it in a word/sentence.
3. **Student** attempts short outputs.
4. **Practice** via weaving and masked repetition (swap subjects, new adjectives/verbs, singular→plural).
5. **Closing** summarizes and normalizes imperfect mastery (“don’t memorize; we’ll reuse it”).
6. **Bonus** (optional) for an advanced but related insight.

## Teacher vs Student Utterances

- **Teacher**
  - Tone: encouraging, collaborative, confident. Frequent positive feedback: “Perfect!”, “Exactly!”
  - Style: prompts that elicit construction by the learner (“What do you think that sounds like?”).
  - Uses **analogies** and **minimal metalanguage**; when using grammar, prefer plain terms (e.g., “label”, “piece”, “prefix”) and connect to prior knowledge.
  - Explains morphological composition explicitly: “Take `ndi-` (I) + `-funa` (want) → Ndifuna.”
  - Introduces phonology as natural sound logic (e.g., vowel merging a + u → aku-, or adding m for euphony before consonants).
- **Student**
  - Outputs are short, often a single word or short sentence.
  - Frequently posed as tentative with a question mark (e.g., “Ndikhulu?”) to reflect hypothesis checking.
  - No metalinguistic explanation—only attempts/answers.

## Formatting and Notation

- **Language name**: Prefer “isiXhosa”.
- **Morphemes and stems**: Use hyphenation to signal position.
  - Prefixes: `ndi-`, `u-`, `aba-`, `um-`, `imi-`
  - Stems/roots: `-funa`, `-tya`, `-azi`, `-khulu`, `-ncinci`
- **Display conventions**
  - In running teacher text, bold full forms and key items: **Ndifuna**, **Andifuni**, **Umntu mkhulu**.
  - Use inline code for forms when emphasizing morphology or when inside parenthetical tags or objectives: `-funa`, `-tya`, `a-...-i`.
  - Use single quotes for English glosses in-line: ‘start’, ‘big’.
  - Use parentheses for quick grammatical tags: (verb root), (Class 1), (plural), etc.
  - IPA or phonetic hints may be given in section titles or briefly in-line: e.g., “Dental Click ('c' /ǀ/).” Keep to concise, high-impact hints.
- **Spelling**: Use South African/British spelling where applicable (e.g., “criticise”).
- **Punctuation**: Student attempts often end with “?”; teacher asks guiding questions; avoid exclamation overuse beyond brief encouragement.

## Justifications

- Provide for key teacher turns, especially openings, reframes, and first applications.
- Keep to 1–3 sentences, explicitly naming the principle(s) and the learning effect (e.g., “manages cognitive load by…”).
- It is acceptable for some straightforward practice turns to omit justification.

## Vocabulary Entries

- Keep entries short and high-utility; 2–5 items per lesson typical.
- Mark stems and concords with hyphens as appropriate.
- Where helpful, include class or role notes in the meaning field: “person (Class 1)”.

## Do and Don’t

- **Do**
  - Keep each step to one clear idea before combining.
  - Prompt the learner to construct forms; confirm with brief praise.
  - Reuse prior items to build continuity and confidence.
  - Use consistent section labels and title formatting.
  - Summarize at the end; tell learners not to memorize lists.
- **Don’t**
  - Overload with terminology or multi-rule steps at once.
  - Use acronyms without expansion (avoid “SC”; write “subject concord”).
  - Provide long student utterances or explanations.
  - Introduce many unrelated vocabulary items in one lesson.

## Templates

### Lesson JSON Skeleton

```json
{
  "lesson_title": "**Lesson X: Title – Subtitle**",
  "thinking_method_focus": [
    "One Thought at a Time",
    "Weaving",
    "Masked Repetition"
  ],
  "objective": "State the capability the learner will gain in this lesson.",
  "key_vocabulary": [
    { "word": "ndi-", "meaning": "Subject concord for 'I'" },
    { "word": "-funa", "meaning": "to want (verb root)" }
  ],
  "turns": [
    {
      "turn_number": 1,
      "section": "Opening",
      "teacher_dialogue": "Briefly reframe the goal and connect to prior knowledge.",
      "justification": "Names the principle(s) and effect on learning."
    },
    {
      "turn_number": 2,
      "section": "Building the Verb",
      "teacher_dialogue": "Take `ndi-` (I) + `-funa` (want). What do you think that sounds like?",
      "justification": "One Thought at a Time + masked repetition through learner construction."
    },
    {
      "turn_number": 3,
      "section": "Student Dialogue",
      "student_dialogue": "Ndifuna?"
    },
    {
      "turn_number": 4,
      "section": "Practice",
      "teacher_dialogue": "Great. Now add an object: **iti** (tea).",
      "justification": "Immediate utility; keeps cognitive load minimal."
    },
    {
      "turn_number": 5,
      "section": "Student Dialogue",
      "student_dialogue": "Ndifuna iti?"
    },
    {
      "turn_number": 6,
      "section": "Closing",
      "teacher_dialogue": "Summarize forms and reassure: we will reuse this, no need to memorize lists.",
      "justification": "Reinforcement and load management."
    }
  ]
}
```

### Turn Micro-Templates

- **Teacher** (prompting construction)

```json
{
  "turn_number": N,
  "section": "Introducing ...",
  "teacher_dialogue": "We take `X-` and attach it to `-Y`. What do you think that sounds like?",
  "justification": "One Thought at a Time; encourages active construction."
}
```

- **Student** (concise attempt)

```json
{
  "turn_number": N,
  "section": "Student Dialogue",
  "student_dialogue": "Form?"
}
```

## Quality Checklist (Per Lesson)

- **Scope**: Single primary idea with 1–2 dependent applications.
- **Weaving**: At least one explicit link to a prior lesson.
- **Masked Repetition**: Same pattern practiced with small variations.
- **Justifications**: Present at key instructional moves; concise and principle-linked.
- **Formatting**: Title bolded; morphemes hyphenated; forms bolded; stems/code forms in backticks where appropriate; SA/UK spelling.
- **Student Lines**: Short, answer-like, often tentative with question marks.
- **Closing**: Encouraging summary; no rote memorization requirement.

---

Source analyzed: `public/data/foundation_lessons.json` (Lessons 1–5). This guide should be applied consistently for new lessons to maintain tone, structure, and pedagogy.
