import re
import six


def babel_extract(fileobj, keywords, comment_tags, options):
    keyword_regex = re.compile("(" + "|".join(keywords) + r")\(u?['\"](.*?[^\\])['\"]\)")
    js_regex = re.compile(r"i18n\(['\"](.+?)['\"](,|\))")

    for lineno, line in enumerate(fileobj):
        if isinstance(line, six.binary_type):
            line = line.decode("utf-8")
        for match in keyword_regex.findall(line):
            yield lineno + 1, None, match[1], []
        for match in js_regex.findall(line):
            yield lineno + 1, None, match[0], []
