"""
process_csv.py  —  AeroGPT ML-API data pipeline
Reads questions.csv, validates every row, and writes:
  1. clean_data.csv          (sanitised, deduplicated)
  2. ../frontend/src/data/questions.js  (ES module for React)
  3. questions.json          (for the Flask/FastAPI ML classifier)

Key fix: correct_answer column stores a letter (a/b/c/d).
         We resolve the display text from the matching option column.
         No fuzzy string matching needed — zero false mismatches.
"""

import csv
import json
import os
import re
import sys

# ── Config ─────────────────────────────────────────────────────────────────────
CSV_IN          = "questions.csv"
CSV_OUT         = "clean_data.csv"
JS_OUT          = "../frontend/src/data/questions.js"
JSON_OUT        = "questions.json"

REQUIRED_COLS = {
    "question_no", "main_subject", "sub_subject", "question",
    "optiona", "optionb", "optionc", "optiond",
    "correct_answer", "difficulty", "year", "typeofpaper",
}

VALID_LETTERS   = {"a", "b", "c", "d"}
VALID_DIFF      = {"Easy", "Medium", "Hard"}

LETTER_TO_COL   = {"a": "optiona", "b": "optionb", "c": "optionc", "d": "optiond"}
LETTER_TO_KEY   = {"a": "a",       "b": "b",       "c": "c",       "d": "d"}

# ── Helpers ─────────────────────────────────────────────────────────────────────
def clean(s: str) -> str:
    """Strip surrounding whitespace and normalise internal spaces."""
    return re.sub(r"\s+", " ", (s or "").strip())

def to_int_or_none(val: str):
    try:
        return int(val.strip())
    except (ValueError, AttributeError):
        return None

def js_escape(s: str) -> str:
    """Escape a string for embedding inside a JS template literal backtick string."""
    return s.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")

# ── Main ────────────────────────────────────────────────────────────────────────
def main():
    if not os.path.exists(CSV_IN):
        sys.exit(f"❌ Cannot find {CSV_IN}. Run this script from the ml-api directory.")

    rows_raw = []
    with open(CSV_IN, newline="", encoding="utf-8-sig") as fh:
        # Auto-detect delimiter (; or ,)
        sample = fh.read(2048)
        fh.seek(0)
        delimiter = ";" if sample.count(";") > sample.count(",") else ","
        reader = csv.DictReader(fh, delimiter=delimiter)

        missing = REQUIRED_COLS - set(reader.fieldnames or [])
        if missing:
            sys.exit(f"❌ CSV is missing columns: {missing}\n   Found: {reader.fieldnames}")

        for row in reader:
            rows_raw.append({k.strip().lower(): v for k, v in row.items()})

    print(f"📥 Loaded {len(rows_raw)} raw rows from {CSV_IN}")

    clean_rows  = []
    js_objects  = []
    skipped     = []
    seen_nos    = set()

    for row in rows_raw:
        qno_raw = clean(row.get("question_no", ""))
        tag     = f"Q{qno_raw}"

        # ── 1. question_no must be a positive integer ──────────────────────────
        qno = to_int_or_none(qno_raw)
        if not qno or qno <= 0:
            skipped.append((tag, "invalid question_no"))
            continue

        if qno in seen_nos:
            skipped.append((tag, "duplicate question_no"))
            continue
        seen_nos.add(qno)

        # ── 2. Core text fields must be non-empty ──────────────────────────────
        question   = clean(row.get("question", ""))
        main_subj  = clean(row.get("main_subject", ""))
        sub_subj   = clean(row.get("sub_subject", ""))
        paper_type = clean(row.get("typeofpaper", ""))

        opt_a = clean(row.get("optiona", ""))
        opt_b = clean(row.get("optionb", ""))
        opt_c = clean(row.get("optionc", ""))
        opt_d = clean(row.get("optiond", ""))

        if not question:
            skipped.append((tag, "empty question text"))
            continue
        if not all([opt_a, opt_b, opt_c, opt_d]):
            skipped.append((tag, "one or more options are empty"))
            continue

        # ── 3. Resolve correct answer from letter → option text ───────────────
        #       This is the key fix: we never try to match strings.
        answer_letter = clean(row.get("correct_answer", "")).lower()
        if answer_letter not in VALID_LETTERS:
            skipped.append((tag, f"invalid correct_answer '{answer_letter}' (must be a/b/c/d)"))
            continue

        option_map   = {"a": opt_a, "b": opt_b, "c": opt_c, "d": opt_d}
        correct_text = option_map[answer_letter]   # guaranteed match

        # ── 4. Difficulty ──────────────────────────────────────────────────────
        diff_raw = clean(row.get("difficulty", "")).capitalize()
        if diff_raw not in VALID_DIFF:
            # Normalise common variants
            diff_map = {
                "easy": "Easy", "medium": "Medium", "hard": "Hard",
                "moderate": "Medium", "difficult": "Hard",
            }
            diff_raw = diff_map.get(diff_raw.lower(), "Medium")

        # ── 5. Year (optional — some rows may be blank) ────────────────────────
        year = to_int_or_none(row.get("year", ""))   # None if blank

        # ── 6. Build clean record ─────────────────────────────────────────────
        record = {
            "no":       qno,
            "year":     year,
            "subj":     main_subj,
            "sub":      sub_subj,
            "q":        question,
            "a":        opt_a,
            "b":        opt_b,
            "c":        opt_c,
            "d":        opt_d,
            "ans":      correct_text,      # resolved from letter — no guessing
            "ans_key":  answer_letter,     # keep the letter too (useful for ML)
            "diff":     diff_raw,
            "type":     paper_type,
        }
        clean_rows.append(record)

        # ── 7. Build JS object string ─────────────────────────────────────────
        year_js = str(year) if year else "null"
        js_objects.append(
            "  {"
            f'no:{qno},year:{year_js},'
            f'subj:"{js_escape(main_subj)}",'
            f'sub:"{js_escape(sub_subj)}",'
            f'q:"{js_escape(question)}",'
            f'a:"{js_escape(opt_a)}",'
            f'b:"{js_escape(opt_b)}",'
            f'c:"{js_escape(opt_c)}",'
            f'd:"{js_escape(opt_d)}",'
            f'ans:"{js_escape(correct_text)}",'
            f'ans_key:"{answer_letter}",'
            f'diff:"{diff_raw}",'
            f'type:"{js_escape(paper_type)}"'
            "}"
        )

    # ── Write clean CSV ─────────────────────────────────────────────────────────
    fieldnames = ["no","year","subj","sub","q","a","b","c","d","ans","ans_key","diff","type"]
    with open(CSV_OUT, "w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(clean_rows)
    print(f"✅ Clean CSV saved: {CSV_OUT}")

    # ── Write JS module ─────────────────────────────────────────────────────────
    os.makedirs(os.path.dirname(JS_OUT), exist_ok=True) if os.path.dirname(JS_OUT) else None
    js_content = (
        "// AUTO-GENERATED by process_csv.py — do not edit manually\n"
        "// Questions: " + str(len(clean_rows)) + "\n\n"
        "const QUESTIONS = [\n"
        + ",\n".join(js_objects)
        + "\n];\n\nexport default QUESTIONS;\n"
    )
    with open(JS_OUT, "w", encoding="utf-8") as fh:
        fh.write(js_content)
    print(f"✅ JS file updated: {JS_OUT}")

    # ── Write JSON for ML API ───────────────────────────────────────────────────
    with open(JSON_OUT, "w", encoding="utf-8") as fh:
        json.dump(clean_rows, fh, ensure_ascii=False, indent=2)
    print(f"✅ JSON file saved: {JSON_OUT}")

    # ── Summary ─────────────────────────────────────────────────────────────────
    print(f"\n✅ Total valid questions: {len(clean_rows)}")

    if skipped:
        print(f"\n⚠️  Skipped {len(skipped)} rows:")
        for tag, reason in skipped:
            print(f"   ❌ {tag} → {reason}")
    else:
        print("🎉 No rows skipped — all questions processed cleanly!")

    # Difficulty breakdown
    diff_counts = {}
    for r in clean_rows:
        diff_counts[r["diff"]] = diff_counts.get(r["diff"], 0) + 1
    print("\n📊 Difficulty breakdown:")
    for d, cnt in sorted(diff_counts.items()):
        print(f"   {d:8s}: {cnt}")

    # Year breakdown
    year_counts = {}
    for r in clean_rows:
        k = str(r["year"]) if r["year"] else "unknown"
        year_counts[k] = year_counts.get(k, 0) + 1
    print("\n📅 Year breakdown:")
    for y, cnt in sorted(year_counts.items()):
        print(f"   {y:8s}: {cnt}")

if __name__ == "__main__":
    main()