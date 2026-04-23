import os
import glob
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # 1. Add problem-gold.css if not present
    if 'problem-gold.css' not in content:
        # Insert after base.css
        content = re.sub(
            r'(<link rel="stylesheet" href="\.\./assets/base\.css">)',
            r'\1\n  <link rel="stylesheet" href="../assets/problem-gold.css">',
            content
        )
        # If base.css not found, insert before theme.js
        if 'problem-gold.css' not in content:
            content = re.sub(
                r'(<script src="\.\./assets/theme\.js")',
                r'<link rel="stylesheet" href="../assets/problem-gold.css">\n  \1',
                content
            )

    # 2. Add problem-stepper.js if not present
    if 'problem-stepper.js' not in content:
        content = re.sub(
            r'(<script src="\.\./assets/theme\.js"[^>]*>)',
            r'\1\n  <script src="../assets/problem-stepper.js" defer></script>',
            content
        )

    # 3. Convert .step structure to .step-card structure
    # Match:
    # <div class="step" data-step="X">
    #   <div class="step-title">步骤 X：Title</div>
    #   <div class="step-desc">Desc</div>
    # </div>
    # OR similar.

    # 4. Remove inline styles related to .hero, .step, etc to avoid conflicts?
    # Actually, removing <style>...</style> might be dangerous if there are custom simulators.
    # Let's just remove the definitions of .hero h1, .subtitle, .hero-question, .card, .step, etc.
    # We can do this with a regex that removes specific blocks, or just let problem-gold.css override.
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for filepath in glob.glob("problems/*.html"):
    process_file(filepath)
