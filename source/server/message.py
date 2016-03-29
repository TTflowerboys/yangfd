from __future__ import unicode_literals, absolute_import
from app import f_app
from libfelix.f_message import f_renderer


class renderer(f_renderer):
    def new_sms(self, msg):
        user = f_app.user.get(msg["target"])
        msg["target"] = {
            "id": user["id"],
            "nickname": user["nickname"],
        }

        return msg

renderer()
