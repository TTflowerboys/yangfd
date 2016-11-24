import re
import six


def babel_extract(fileobj, keywords, comment_tags, options):
    keyword_regex = re.compile("(" + "|".join(keywords) + r")\(['\"](.*?[^\\])['\"]\)")

    for lineno, line in enumerate(fileobj):
        if isinstance(line, six.binary_type):
            line = line.decode("utf-8")
        for match in keyword_regex.findall(line):
            yield lineno + 1, None, match[1], []
