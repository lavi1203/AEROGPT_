import pandas as pd
import json

df = pd.read_csv('data1.csv', on_bad_lines='skip', engine='python')
df = df.dropna(subset=['question'])

js_objects = []
valid_count = 0

for i, row in df.iterrows():
    qno = row.get('question_no', i+1)
    year = row.get('year', 'null')
    if pd.isna(year):
        year = 'null'
    
    subj = str(row.get('main_subject', '')).strip()
    sub = str(row.get('sub_subject', '')).strip()
    q = str(row.get('question', '')).strip()
    a = str(row.get('optiona', '')).strip()
    b = str(row.get('optionb', '')).strip()
    c = str(row.get('optionc', '')).strip()
    d = str(row.get('optiond', '')).strip()
    ans_text = str(row.get('correct_answer', '')).strip()
    diff = str(row.get('difficulty', 'Medium')).strip()
    ptype = str(row.get('typeofpaper', '')).strip()
    
    ans_key = 'a'
    if ans_text == b: ans_key = 'b'
    elif ans_text == c: ans_key = 'c'
    elif ans_text == d: ans_key = 'd'
    
    def esc(s):
        if str(s).lower() == 'nan':
            return ""
        return str(s).replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')
        
    js_objects.append(
        '  {\n'
        f'    no: "{qno}",\n'
        f'    year: {year},\n'
        f'    subj: "{esc(subj)}",\n'
        f'    sub: "{esc(sub)}",\n'
        f'    q: "{esc(q)}",\n'
        f'    a: "{esc(a)}",\n'
        f'    b: "{esc(b)}",\n'
        f'    c: "{esc(c)}",\n'
        f'    d: "{esc(d)}",\n'
        f'    ans: "{esc(ans_text)}",\n'
        f'    ans_key: "{ans_key}",\n'
        f'    diff: "{esc(diff)}",\n'
        f'    type: "{esc(ptype)}"\n'
        '  }'
    )
    valid_count += 1

js_content = '// AUTO-GENERATED\nexport const QUESTIONS = [\n' + ',\n'.join(js_objects) + '\n];\n'

with open('../frontend/src/data/questions.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f'Successfully generated questions.js with {valid_count} questions')
