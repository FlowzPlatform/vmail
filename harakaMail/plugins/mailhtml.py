import sys
import talon
import base64
from talon import quotations

talon.init()

type = sys.argv[1]
#html = base64.b64decode(sys.argv[2])
#html = sys.stdin.readline().rstrip()
html = ""
for line in sys.stdin:
    html += line.rstrip()

html = base64.b64decode(html)


if type.lower() == 'html':
    reply = quotations.extract_from_html(html)
else:
    reply = quotations.extract_from(html, 'type/plain')

# reply == "<html><body><p>Reply</p></body></html>"
print ("%s" % reply)
