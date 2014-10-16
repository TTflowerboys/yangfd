import re


def babel_extract(fileobj, keywords, comment_tags, options):
    keyword_regex = re.compile("(" + "|".join(keywords) + r")\(['\"](.*?[^\\])['\"]\)")

    for lineno, line in enumerate(fileobj):
        for match in keyword_regex.findall(line):
            yield lineno + 1, None, match[1].decode("utf-8"), []
