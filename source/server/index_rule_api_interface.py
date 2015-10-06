from app import f_app
from libfelix.f_interface import f_api


@f_api('/index_rule/channel/all')
@f_app.user.login.check(role=['admin'])
def index_rule_channels(user):
    return f_app.match.rule.get_channels()


@f_api('/index_rule/channel/<channel>/rules')
@f_app.user.login.check(role=['admin'])
def index_rule_channel_rules(channel, user):
    return f_app.match.rule.get(channel)


@f_api('/index_rule/add', params=dict(
    rule=(str, True),
    channel=(str, True),
))
@f_app.user.login.check(role=['admin'])
def index_rule_add(user, params):
    """
    Possible channels: ``synonyms``, ``index_filter``, ``user_dict``
    """
    return f_app.match.rule.add(params["channel"], params["rule"])


@f_api('/index_rule/<rule_id>/edit', params=dict(
    rule=str,
    channel=str,
))
@f_app.user.login.check(role=['admin'])
def index_rule_edit(rule_id, user, params):
    return f_app.match.rule.update(rule_id, params)


@f_api('/index_rule/<rule_id>/delete')
@f_app.user.login.check(role=['admin'])
def index_rule_delete(rule_id, user):
    return f_app.match.rule.delete(rule_id)


@f_api('/cut/<text>', params=dict(
    mode=(str, "default"),
    index_filter=(bool, False)
))
@f_app.user.login.check(role=['admin'])
def cut(text, user, params):
    text.replace("\n", " ")
    text.replace("\r", " ")

    cut_result = list(f_app.mongo_index.cut(text, cut_all=True if params["mode"] == "all" else False))
    if params["index_filter"]:
        index_filter = f_app.mongo_index.get_index_filter()
        for word in cut_result[:]:
            if word in index_filter:
                for filter_word in index_filter[word]:
                    filter_word_with_synonyms = [filter_word]

                    filter_word_with_synonyms.extend(f_app.mongo_index.synonyms.find(filter_word))
                    # debug("Word:", word, "matched index_filter, filtering", "/".join(filter_word_with_synonyms))

                    for _filter_word in filter_word_with_synonyms:
                        if _filter_word in cut_result:
                            cut_result.remove(_filter_word)
    return "/".join(cut_result)
