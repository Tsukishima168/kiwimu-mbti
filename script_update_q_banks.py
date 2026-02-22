import sys
import re

def read_markdown_table(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    in_table = False
    table_lines = []
    header_idx = -1
    
    for i, line in enumerate(lines):
        if line.strip().startswith('| Question_ID |') or line.strip().startswith('| Question_ID'):
            in_table = True
            header_idx = i
        if in_table:
            if not line.strip().startswith('|'):
                break
            table_lines.append(line)
            
    data = []
    # Skip header and separator
    for line in table_lines[2:]:
        cols = [x.strip() for x in line.split('|')[1:-1]]
        if len(cols) >= 6:
            data.append(cols)
            
    return lines, header_idx, len(table_lines), data

def write_updated_file(filepath, lines, header_idx, table_len, orig_data, tw_dict):
    new_table = []
    # Header
    new_table.append("| Question_ID | Country | Dimension | Context | Option_A | Option_B | Context_ZH | Option_A_ZH | Option_B_ZH | Cultural_Note |\n")
    new_table.append("| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n")
    
    for row in orig_data:
        qid = row[0]
        if qid in tw_dict:
            tw_row = tw_dict[qid]
            # row: [QID, Country, Dim, Context, OptA, OptB, CultNote(optional)]
            # tw_row: [QID, Country, Dim, Context, OptA, OptB, CultNote]
            
            cult_note = row[6] if len(row) > 6 else ""
            if not cult_note and len(tw_row) > 6:
                cult_note = tw_row[6]
                
            new_row = f"| {row[0]} | {row[1]} | {row[2]} | {row[3]} | {row[4]} | {row[5]} | {tw_row[3]} | {tw_row[4]} | {tw_row[5]} | {cult_note} |\n"
            new_table.append(new_row)
        else:
            new_row = "| " + " | ".join(row) + " |\n"
            new_table.append(new_row)
            
    new_lines = lines[:header_idx] + new_table + lines[header_idx + table_len:]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print(f"Updated {filepath}")

if __name__ == "__main__":
    base_dir = "/Users/pensoair/Library/Mobile Documents/iCloud~md~obsidian/Documents/Penso-OS/08_專案工坊/Kiwimu_MBTI_Lab_內容庫/2026_H1_跨國升級版/"
    tw_file = base_dir + "MBTI_Question_Bank_2026_Taiwan.md"
    
    _, _, _, tw_data = read_markdown_table(tw_file)
    tw_dict = {row[0]: row for row in tw_data}
    
    files_to_update = [
        "MBTI_Question_Bank_2026_Japan.md",
        "MBTI_Question_Bank_2026_South_Korea.md",
        "MBTI_Question_Bank_2026_United_States.md"
    ]
    
    for filename in files_to_update:
        filepath = base_dir + filename
        lines, h_idx, t_len, data = read_markdown_table(filepath)
        write_updated_file(filepath, lines, h_idx, t_len, data, tw_dict)
