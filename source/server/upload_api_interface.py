# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from app import f_app
from six.moves import cStringIO as StringIO
from libfelix.f_interface import f_api, abort, request
import logging
logger = logging.getLogger(__name__)

f_app.dependency_register("pillow", race="python")
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
    from PIL import Image
    try:
        im = f_app.storage.image_open(params["data"].file)
    except:
        abort(40074, logger.warning("Invalid params: Unknown image type.", exc_info=False))
    width, height = im.size
    original_width, original_height = im.size
    original_ratio = float(width) / height

    f = params["data"].file
    # Make background to white if the file is PNG
    if im.format == "PNG" or im.format == "GIF":
        background = Image.new("RGB", im.size, (255, 255, 255))
        try:
            background.paste(im, mask=im)
        except:
            background.paste(im)
        im = background

    if params.get("ratio"):
        if float(width) / height > params["ratio"]:
            # crop based on height
            w_cut = int((width - params["ratio"] * height) // 2)
            box = (w_cut, 0, width - w_cut, height)
            im = im.crop(box)
        elif float(width) / height < params["ratio"]:
            # crop based on width
            h_cut = int((height - width / params["ratio"]) // 2)
            box = (0, h_cut, width, height - h_cut)
            logger.debug(box)
            im = im.crop(box)

    if params["width_limit"] > 0:
        if params.get("ratio"):
            width, height = im.size

        if width > params["width_limit"]:
            temp_width, temp_height = im.size
            temp_ratio = float(temp_width) / temp_height
            im = im.resize((params["width_limit"], int(params["width_limit"] / temp_ratio)), Image.ANTIALIAS)

    if params.pop("watermark"):
        with open("../web/src/static/images/logo/logo-watermark.png") as f:
            water_mark = f_app.storage.image_open(f)
            water_mark_padding = 10
            layer = Image.new('RGBA', im.size, (0, 0, 0, 0))
            position = (im.size[0] - water_mark.size[0] - water_mark_padding, im.size[1] - water_mark.size[1] - water_mark_padding)
            layer.paste(water_mark, position)
            im = Image.composite(layer, im, layer)

    f = StringIO()
    im.save(f, "JPEG", quality=95, optimize=True, progressive=True)
    f.seek(0)

    if params["thumbnail_size"][0] > 0:
        params["data"].file.seek(0)
        im = f_app.storage.image_open(params["data"].file)
        if im.format == "PNG" or im.format == "GIF":
            background = Image.new("RGB", im.size, (255, 255, 255))
            try:
                background.paste(im, mask=im)
            except:
                background.paste(im)
            im = background

        thumbnail_width, thumbnail_height = params["thumbnail_size"]
        thumbnail_ratio = float(thumbnail_width) / thumbnail_height

        if original_height < thumbnail_height:
            # abort(40000, logger.warning('Invalid thumbnail size: cannot be larger than width param', exc_info=False))
            if original_ratio > thumbnail_ratio:
                im = im.resize((int(float(original_width) * thumbnail_height / original_height), thumbnail_height), Image.ANTIALIAS)
            else:
                im = im.resize((thumbnail_width, int(float(original_height) * thumbnail_width / original_width)), Image.ANTIALIAS)

        elif original_width < thumbnail_width:
            if original_ratio < thumbnail_ratio:
                im = im.resize((thumbnail_width, int(float(original_height) * thumbnail_width / original_width)), Image.ANTIALIAS)
            else:
                im = im.resize((int(float(original_width) * thumbnail_height / original_height), thumbnail_height), Image.ANTIALIAS)

        if original_ratio < thumbnail_ratio:
            # scale by thumbnail_width
            scaled_height = int(float(original_height) / original_width * thumbnail_width + 0.5)
            im = im.resize((thumbnail_width, scaled_height), Image.ANTIALIAS)
            h_cut = int(float(scaled_height - thumbnail_height) // 2)
            box = (0, h_cut, thumbnail_width, scaled_height - h_cut)
        else:
            # scale by thumbnail_height
            scaled_width = int(float(original_width) / original_height * thumbnail_height + 0.5)
            im = im.resize((scaled_width, thumbnail_height), Image.ANTIALIAS)
            w_cut = int(float(scaled_width - thumbnail_width) // 2)
            box = (w_cut, 0, scaled_width - w_cut, thumbnail_height)
        im = im.crop(box)
        im = im.resize(params["thumbnail_size"], Image.ANTIALIAS)
        f_thumbnail = StringIO()
        im.save(f_thumbnail, "JPEG", quality=95, optimize=True, progressive=True)
        f_thumbnail.seek(0)

    f.seek(0)
    with f_app.storage.aws_s3() as b:
        filename = f_app.util.uuid()
        b.upload(filename, f.read(), policy="public-read")
        result = {"url": b.get_public_url(filename)}

        if params["thumbnail_size"][0] > 0:
            b.upload(filename + "_thumbnail", f_thumbnail.read(), policy="public-read")
            result.update({"thumbnail": b.get_public_url(filename + "_thumbnail")})

        return result
    # filename = f_app.util.uuid()
    # b = open('/tmp/' + filename + '.jpg', 'w+')
    # b.write(f.read())
    # b.close()
    # if params["thumbnail_size"][0] > 0:
    #     b = open('/tmp/' + filename + "_thumbnail.jpg", 'w+')
    #     b.write(f_thumbnail.read())
    #     b.close()


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
    from PIL import Image
    try:
        im_request = f_app.request.get(params["link"])
        if im_request.status_code == 200:
            im = f_app.storage.image_open(StringIO(im_request.content))
    except:
        abort(40074, logger.warning("Invalid params: Unknown image type.", exc_info=False))
    width, height = im.size
    original_width, original_height = im.size
    original_ratio = float(width) / height

    f = StringIO(im_request.content)
    # Make background to white if the file is PNG
    if im.format == "PNG" or im.format == "GIF":
        background = Image.new("RGB", im.size, (255, 255, 255))
        try:
            background.paste(im, mask=im)
        except:
            background.paste(im)
        im = background

    if params.get("ratio"):
        if float(width) / height > params["ratio"]:
            # crop based on height
            w_cut = int((width - params["ratio"] * height) // 2)
            box = (w_cut, 0, width - w_cut, height)
            im = im.crop(box)
        elif float(width) / height < params["ratio"]:
            # crop based on width
            h_cut = int((height - width / params["ratio"]) // 2)
            box = (0, h_cut, width, height - h_cut)
            logger.debug(box)
            im = im.crop(box)

    if params["width_limit"] > 0:
        if params.get("ratio"):
            width, height = im.size

        if width <= 1280:
            if width > params["width_limit"]:
                temp_width, temp_height = im.size
                temp_ratio = float(temp_width) / temp_height
                im = im.resize((params["width_limit"], int(params["width_limit"] / temp_ratio)), Image.ANTIALIAS)
        else:
            im = im.resize((1280, 1280 * height // width), Image.ANTIALIAS)

    if params.pop("watermark"):
        with open("../web/src/static/images/logo/logo-watermark.png") as f:
            water_mark = f_app.storage.image_open(f)
            water_mark_padding = 10
            layer = Image.new('RGBA', im.size, (0, 0, 0, 0))
            position = (im.size[0] - water_mark.size[0] - water_mark_padding, im.size[1] - water_mark.size[1] - water_mark_padding)
            layer.paste(water_mark, position)
            im = Image.composite(layer, im, layer)

    f = StringIO()
    im.save(f, "JPEG", quality=95, optimize=True, progressive=True)
    f.seek(0)

    if params["thumbnail_size"][0] > 0:
        im = f_app.storage.image_open(StringIO(im_request.content))
        if im.format == "PNG" or im.format == "GIF":
            background = Image.new("RGB", im.size, (255, 255, 255))
            try:
                background.paste(im, mask=im)
            except:
                background.paste(im)
            im = background

        thumbnail_width, thumbnail_height = params["thumbnail_size"]
        thumbnail_ratio = float(thumbnail_width) / thumbnail_height

        if original_height < thumbnail_height:
            # abort(40000, logger.warning('Invalid thumbnail size: cannot be larger than width param', exc_info=False))
            if original_ratio > thumbnail_ratio:
                im = im.resize((int(float(original_width) * thumbnail_height / original_height), thumbnail_height), Image.ANTIALIAS)
            else:
                im = im.resize((thumbnail_width, int(float(original_height) * thumbnail_width / original_width)), Image.ANTIALIAS)

        elif original_width < thumbnail_width:
            if original_ratio < thumbnail_ratio:
                im = im.resize((thumbnail_width, int(float(original_height) * thumbnail_width / original_width)), Image.ANTIALIAS)
            else:
                im = im.resize((int(float(original_width) * thumbnail_height / original_height), thumbnail_height), Image.ANTIALIAS)

        if original_ratio < thumbnail_ratio:
            # scale by thumbnail_width
            scaled_height = int(float(original_height) / original_width * thumbnail_width + 0.5)
            im = im.resize((thumbnail_width, scaled_height), Image.ANTIALIAS)
            h_cut = int(float(scaled_height - thumbnail_height) // 2)
            box = (0, h_cut, thumbnail_width, scaled_height - h_cut)
        else:
            # scale by thumbnail_height
            scaled_width = int(float(original_width) / original_height * thumbnail_height + 0.5)
            im = im.resize((scaled_width, thumbnail_height), Image.ANTIALIAS)
            w_cut = int(float(scaled_width - thumbnail_width) // 2)
            box = (w_cut, 0, scaled_width - w_cut, thumbnail_height)
        im = im.crop(box)
        im = im.resize(params["thumbnail_size"], Image.ANTIALIAS)
        f_thumbnail = StringIO()
        im.save(f_thumbnail, "JPEG", quality=95, optimize=True, progressive=True)
        f_thumbnail.seek(0)

    f.seek(0)
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
