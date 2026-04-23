import os
import glob
import re

for filepath in glob.glob("problems/*.html"):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    
    # 1. Add problem-gold.css if not present
    if 'problem-gold.css' not in content:
        content = re.sub(
            r'(<link rel="stylesheet" href="\.\./assets/base\.css">)',
            r'\1\n  <link rel="stylesheet" href="../assets/problem-gold.css">',
            content
        )

    # 2. Convert .step to .step-card for the elements
    content = re.sub(r'class="step"', 'class="step-card"', content)
    content = re.sub(r'class="step active"', 'class="step-card active"', content)
    
    # And convert JS selectors .step to .step-card
    content = re.sub(r"'\.step'", "'.step-card'", content)
    content = re.sub(r'"\.step"', '".step-card"', content)
    # Convert CSS selectors .step to .step-card (only isolated .step)
    content = re.sub(r'\.step\s*\{', '.step-card{', content)
    content = re.sub(r'\.step\s*:', '.step-card:', content)
    content = re.sub(r'\.step\s*\.', '.step-card.', content)

    # 3. Convert <div class="step-title">步骤 X：Title</div> to badge + h3
    def repl_title(m):
        num = m.group(1)
        text = m.group(2).strip()
        if text.startswith('：') or text.startswith(':'):
            text = text[1:].strip()
        return f'<div class="step-title"><div class="badge">{num}</div><h3>{text}</h3></div>'

    content = re.sub(r'<div class="step-title">\s*步骤\s*(\d+)(.*?)\s*</div>', repl_title, content)

    # 4. Convert <div class="step-desc">...</div> to <p>...</p>
    content = re.sub(r'<div class="step-desc">(.*?)</div>', r'<p>\1</p>', content, flags=re.DOTALL)

    # 5. Remove inline step styles to avoid conflict with problem-gold.css
    # We remove .step{...}, .step:hover{...}, .step.active{...}, .step-title{...}, .step-desc{...}
    content = re.sub(r'\.step-card\s*\{[^}]*\}', '', content)
    content = re.sub(r'\.step-card:hover\s*\{[^}]*\}', '', content)
    content = re.sub(r'\.step-card\.active\s*\{[^}]*\}', '', content)
    content = re.sub(r'\.step-title\s*\{[^}]*\}', '', content)
    content = re.sub(r'\.step-desc\s*\{[^}]*\}', '', content)
    content = re.sub(r'\.steps\s*\{[^}]*\}', '', content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Upgraded {filepath}")
