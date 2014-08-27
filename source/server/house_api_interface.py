from bson.objectid import ObjectId
from libfelix.f_common import f_app
from libfelix.f_interface import f_api

import logging
logger = logging.getLogger(__name__)


@f_api('/house/search', params=dict(
    per_page=int,
    time=datetime,
    status=str,
))
def house_search(params):
    per_page = params.pop("per_page", 0)
    house_list = f_app.house.search(params, per_page=per_page)
    return f_app.house.output(house_list)


@f_api('/house/<house_id>/edit', params=dict(
    target_house_id=ObjectId,
    status=str,
))
@f_app.user.login.check(role=['admin', 'jr_admin', 'operation', 'jr_operation', 'developer', 'agency'])
def house_add(house_id, user, params):
    """
    This API will act based on the house_id. To be specific, if any field other than "status" is edited:

    1. If the house has ``status`` in (``draft``, ``not translated``, ``translating``, ``rejected``), the changes will be saved immediately.
    1.1. If the ``status`` is ``rejected``, it will be automatically changed to ``draft`` upon any edit.
    2. If ``status`` is ``not reviewed``, the edit will be rejected. Cancel the review process before you can do any more edit.
    3. Otherwise this API will actually create a partial house with only the changes. After approval:
    3.1. If ``target_house_id`` present, the changes and the ``status`` will be applied together to that house if the ``status`` was submitted within (``selling``, ``hidden``, ``sold out``, ``deleted``) and the partial house will be removed.
    3.2. Otherwise, the status of _this_ partial house will be updated to whatever the reviewer submitted, so it reforms a "real" new house.

    Edit ``status`` to advance the process. For ``status``-only submits, the following rules are followed:

    4. If ``status`` in (``draft``, ``not translated``, ``translating``, ``rejected``, ``not reviewed``)
    4.1. Anyone could submit ``status``-only edits and they will be saved immediately. But only ``admin``, ``jr_admin`` and ``operation`` could advance the status beyond "not reviewed".
    5. Otherwise, only ``admin``, ``jr_admin`` and ``operation`` could send ``status``-only edits, and the ``status`` is limited to (``selling``, ``hidden``, ``sold out``, ``deleted``). If you need to edit it in any way, go with the previous process.

    When submitting a (partial or full) house for reviewing:

    6. A house without all needed fields _and_ ``target_house_id`` will raise an error here.

    After discussion, we've decided that only one "draft" was allowed for the same "target_house_id" at the same time. This means:

    7. The first edit to an existing house should pass the house's id to ``target_house_id``.
    8. The second and so forth edits should only pass the current ``partial`` house's id to ``target_house_id``.
    9. Submit another edit while an existing one still in its life cycle will cause an error.

    All statuses, for reference: ``draft``, ``not translated``, ``translating``, ``rejected``, ``not reviewed``, ``selling``, ``hidden``, ``sold out``, ``deleted``.
    """
    raise NotImplementedError


@f_api('/house/<house_id>')
def house_get(house_id):
    return f_app.house.output([house_id])[0]
