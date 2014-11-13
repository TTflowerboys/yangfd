# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from app import f_app
from libfelix.f_interface import f_api
import logging
logger = logging.getLogger(__name__)


@f_api('/qiniu/upload_file', params=dict(
    nolog=("data"),
    data=("file", True),
    filename=str,
))
def upload_file(params):
    """
    Upload a file to Qiniu

    If ``filename`` is not given, mime type and extension will be detected automatically.
    """
    extension = ""
    # Try to get extension via params first
    f = params["data"].file
    if "filename" in params:
        if "." in params['filename']:
            extension = "." + params['filename'].split('.')[-1]
    #Guess extension
    if not extension:
        try:
            import magic
            import mimetypes
            m = magic.open(magic.MAGIC_MIME_TYPE)
            m.load()
        except ImportError:
            m = None
            import logging
            logger = logging.getLogger(__name__)
            logger.warning("Failed to import magic, qiniu will not have mime set", exc_info=False)

        if m is not None:
            mime = m.buffer(f.read())
            extension = mimetypes.guess_extension(mime)
        else:
            logger.warning("Failed to detect extension of the file.")

    f.seek(0)

    with f_app.storage.qiniu() as q:
        filename = f_app.util.uuid() + extension
        q.upload(filename, f.read())
        return {"url": q.get_public_url(filename)}
