import pandas as pd
import os

countries = [
    ('taiwan', 'Taiwan (zh-TW)'),
    ('united_states', 'United States (en-US)'),
    ('japan', 'Japan (ja-JP)'),
    ('south_korea', 'South Korea (ko-KR)')
]

csv_dir = '/Users/pensoair/Desktop/color-of-kiwimu-mbti-lab-v5/output/spreadsheet/'
obsidian_dir = '/Users/pensoair/Library/Mobile Documents/iCloud~md~obsidian/Documents/Penso-OS/08_專案工坊/'

for slug, name in countries:
    csv_path = os.path.join(csv_dir, f'mbti_question_bank_2026_{slug}.csv')
    if os.path.exists(csv_path):
        df = pd.read_csv(csv_path)
        safe_name = name.split(" ")[0].replace("-", "")
        if "South Korea" in name:
            safe_name = "South_Korea"
        elif "United States" in name:
            safe_name = "United_States"
        
        md_path = os.path.join(obsidian_dir, f'MBTI_Question_Bank_2026_{safe_name}.md')
        
        md_content = f"""---
title: MBTI 2026 {name} 題庫
created: 2026-02-21
category: dataset
country: {name}
tags: [mbti, questionnaire, localization, {slug}]
---

# MBTI 2026 {name} 題庫

這是 {name} 版本的 40 題 MBTI 題庫在地化版本。

"""
        headers = df.columns.tolist()
        md_content += "| " + " | ".join(headers) + " |\n"
        md_content += "| " + " | ".join(["---"] * len(headers)) + " |\n"
        for _, row in df.iterrows():
            row_vals = [str(x).replace("|", "\\|").replace("\n", "<br>") for x in row]
            md_content += "| " + " | ".join(row_vals) + " |\n"
        
        with open(md_path, 'w', encoding='utf-8') as f:
            f.write(md_content)
        print(f"Generated {md_path}")
