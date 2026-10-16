"""One-time installation of consent-gated analytics on J.B Property Developments."""
from pathlib import Path
import re

root = Path(__file__).resolve().parent
assert (root / 'cookie-consent.js').exists(), 'Missing cookie-consent.js'
assert (root / 'index.html').exists(), 'Run within your main website repository'
assert (root / 'thank-you.html').exists(), 'Missing thank-you.html'

install = '<script defer src="/cookie-consent.js"></script>'
changed = []
for filename in sorted(root.glob('*.html')):
    original = filename.read_text(encoding='utf-8')
    content = original
    if filename.name in ('index.html', 'thank-you.html'):
        old_tag = re.compile(
            r'<head><!-- Google tag \(gtag\.js\) -->\s*'
            r'<script async src="https://www\.googletagmanager\.com/gtag/js\?id=AW-[^"]+"></script>\s*'
            r'<script>[\s\S]*?</script>'
            r'(?:\s*<!-- Event snippet for Request quote conversion page -->\s*<script>[\s\S]*?</script>)?'
        )
        content, count = old_tag.subn('<head>', content, count=1)
        assert count == 1 or install in content, f'Could not replace old tags in {filename.name}'
    if install not in content:
        assert '</head>' in content, f'No </head> in {filename.name}'
        content = content.replace('</head>', '  ' + install + '\n</head>', 1)
    if content != original:
        filename.write_text(content, encoding='utf-8')
        changed.append(filename.name)
print('Installed consent-gated Analytics and Ads script on', len(changed), 'HTML pages:')
print(', '.join(changed))
notice = '<p><strong>24/7 Emergency Roof Repairs:</strong> Call us day or night about urgent leaks or storm damage. Attendance depends on safe access, weather and availability.</p>'

for page in sorted(root.glob('*.html')):
    if page.name in ('shop.html', 'thank-you.html', 'cookies.html'):
        continue
    html = page.read_text(encoding='utf-8')
    if '24/7 Emergency Roof Repairs:' in html:
        continue
    if page.name == 'index.html':
        pattern = r'(<h2>Let.s talk about your project\.</h2>\s*<p>.*?</p>)'
    elif page.name in ('roofers-barnes.html', 'roofers-chiswick.html'):
        pattern = r'(<h2>Looking for a roofer in [^<]+</h2>\s*<p>.*?</p>)'
    else:
        pattern = r'(<section class="cta">.*?<h2>.*?</h2>\s*<p>.*?</p>)'
    html, count = re.subn(pattern, lambda m: m.group(1) + '\n' + notice, html, count=1, flags=re.S)
    assert count == 1, f'Contact block missing in {page.name}'
    page.write_text(html, encoding='utf-8')
    print('24/7 emergency roofing added to', page.name)
