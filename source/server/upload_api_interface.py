# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from app import f_app
from six.moves import cStringIO as StringIO
from libfelix.f_interface import f_api, abort
import logging
logger = logging.getLogger(__name__)

f_app.dependency_register("wand", race="python")


@f_api('/upload_image', params=dict(
    nolog=("data"),
    data=("file", True),
    thumbnail_size=(list, [600, 300], int),
    width_limit=(int, 1280),
    ratio=float,
    watermark=(bool, False),
))
def upload_image(params):
    """
    Upload an image to Amazon S3

    Parse 0,0 to thumbnail_size to disable thumbnail.

    Parse 0 to width_limit to disable size limiting.
    """
    try:
        im = f_app.storage.image_open(params["data"].file)
    except:
        abort(40074, logger.warning("Invalid params: Unknown image type.", exc_info=False))

    im = f_app.storage.image_opacification(im)
    im = f_app.storage.image_limit(params.pop("ratio"), params.pop("width_limit"))

    if params.pop("watermark"):
        im = f_app.storage.image_watermark("../web/src/static/images/logo/logo-watermark.png")

    f = StringIO()
    im.save(f, "JPEG", quality=95, optimize=True, progressive=True)
    f.seek(0)

    if params["thumbnail_size"][0] > 0:
        params["data"].file.seek(0)
        im = f_app.storage.image_open(params["data"].file)
        im = f_app.storage.image_opacification(im)
        im = f_app.storage.image_thumbnail(im, params["thumbnail_size"])
        f_thumbnail = StringIO()
        im.save(f_thumbnail, "JPEG", quality=95, optimize=True, progressive=True)
        f_thumbnail.seek(0)

    with f_app.storage.aws_s3() as b:
        filename = f_app.util.uuid()
        b.upload(filename, f.read(), policy="public-read")
        result = {"url": b.get_public_url(filename)}

        if params["thumbnail_size"][0] > 0:
            b.upload(filename + "_thumbnail", f_thumbnail.read(), policy="public-read")
            result.update({"thumbnail": b.get_public_url(filename + "_thumbnail")})

        return result


@f_api('/upload_file', params=dict(
    nolog=("data"),
    data=("file", True),
    filename=str,
))
def upload_file(params):
    """
    Upload a file to Amazon S3

    If ``filename`` is not given, mime type and extension will be detected automatically.
    """
    extension = ""
    # Try to get extension via params first
    f = params["data"].file
    if "filename" in params:
        if "." in params['filename']:
            extension = "." + params['filename'].split('.')[-1]
    # Guess extension
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
            logger.warning("Failed to import magic, AWS S3 will not have mime set", exc_info=False)

        if m is not None:
            mime = m.buffer(f.read())
            extension = mimetypes.guess_extension(mime)
        else:
            logger.warning("Failed to detect extension of the file.")

    f.seek(0)

    with f_app.storage.aws_s3() as b:
        if not extension:
            extension = ""
        filename = f_app.util.uuid() + extension
        b.upload(filename, f.read(), policy="public-read")
        result = {"url": b.get_public_url(filename)}

        return result


@f_api('/upload_from_url', params=dict(
    link=(str, True),
    thumbnail_size=(list, [600, 300], int),
    width_limit=(int, 1280),
    ratio=float,
    watermark=(bool, False),
))
def upload_from_url(params):
    """
    Upload an image to Amazon S3

    Parse 0,0 to thumbnail_size to disable thumbnail.

    Parse 0 to width_limit to disable size limiting.
    """
    try:
        im_request = f_app.request.get(params["link"])
        if im_request.status_code == 200:
            im = f_app.storage.image_open(StringIO(im_request.content))
    except:
        abort(40074, logger.warning("Invalid params: Unknown image type.", exc_info=False))
    width, height = im.size
    original_width, original_height = im.size

    f = StringIO(im_request.content)

    im = f_app.storage.image_opacification(im)
    im = f_app.storage.image_limit(params.pop("ratio"), params.pop("width_limit"))

    if params.pop("watermark"):
        im = f_app.storage.image_watermark("../web/src/static/images/logo/logo-watermark.png")

    f = StringIO()
    im.save(f, "JPEG", quality=95, optimize=True, progressive=True)
    f.seek(0)

    if params["thumbnail_size"][0] > 0:
        im = f_app.storage.image_open(StringIO(im_request.content))
        im = f_app.storage.image_opacification(im)
        im = f_app.storage.image_thumbnail(im, params["thumbnail_size"])
        f_thumbnail = StringIO()
        im.save(f_thumbnail, "JPEG", quality=95, optimize=True, progressive=True)
        f_thumbnail.seek(0)

    with f_app.storage.aws_s3() as b:
        filename = f_app.util.uuid()
        b.upload(filename, f.read(), policy="public-read")
        result = {"url": b.get_public_url(filename)}

        if params["thumbnail_size"][0] > 0:
            b.upload(filename + "_thumbnail", f_thumbnail.read(), policy="public-read")
            result.update({"thumbnail": b.get_public_url(filename + "_thumbnail")})

        return result


@f_api('/qiniu/upload_file', params=dict(
    nolog=("data"),
    data=("file", True),
    filename=str,
))
def qiniu_upload_file(params):
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
    # Guess extension
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
        if not extension:
            extension = ""
        filename = f_app.util.uuid() + extension
        q.upload(filename, f.read())
        return {"url": q.get_public_url(filename)}
