from html.parser import HTMLParser
from pathlib import Path
class Text(HTMLParser):
 def __init__(self): super().__init__(); self.skip=0; self.out=[]
 def handle_starttag(self,tag,attrs):
  if tag in ('script','style','svg','noscript'): self.skip+=1
  if tag in ('p','div','br','li','h1','h2','h3','address'): self.out.append('\n')
 def handle_endtag(self,tag):
  if tag in ('script','style','svg','noscript'): self.skip=max(0,self.skip-1)
 def handle_data(self,data):
  if not self.skip and data.strip(): self.out.append(data.strip()+' ')
Path('data/review').mkdir(exist_ok=True)
for p in Path('data/raw').glob('school-*.html'):
 if 'robots' in p.name: continue
 t=Text();t.feed(p.read_text(encoding='utf8',errors='replace'))
 lines=[' '.join(l.split()) for l in ''.join(t.out).splitlines() if l.strip()]
 Path('data/review',p.stem+'.txt').write_text('\n'.join(lines),encoding='utf8')
