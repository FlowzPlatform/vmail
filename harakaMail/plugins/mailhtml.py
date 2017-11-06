import sys
import talon
from talon import quotations

talon.init()

type = sys.argv[1]
html = sys.argv[2]

if type.lower() == 'html':
    reply = quotations.extract_from_html(html)
else:
    reply = quotations.extract_from(html, 'type/plain')

# reply == "<html><body><p>Reply</p></body></html>"
print ("%s" % reply)
