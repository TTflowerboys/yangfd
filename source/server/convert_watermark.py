#!/usr/bin/env python2
# -*- coding: utf-8 -*-

from __future__ import unicode_literals, absolute_import
from app import f_app
from six.moves import cStringIO as StringIO
from PIL import Image
import base64
import logging
logger = logging.getLogger(__name__)


# properties = f_app.property.search({"status": {"$in": ["selling", "sold out"]}}, per_page=0)
properties = ['54539b0d6a57070260ddbe33', '545249246a570700df0fa4fe', '547be878e999fb0e6e5ea654', '545ce47bec0e0103ecc8b4a9', '544fc68d6a57070031e5eb47', '5446e58cc078a20042679379', '5461f3e7ec0e01057bed55b2', '5460a43fec0e0104f55add4a', '5448b506c078a200c7e31f75', '5450da5e6a57070039e5eb49', '5452d68a6a570700e60fa456', '5452336e6a57070040e5eb47', '545275a86a570700e00fa873', '54519c8b6a5707003de5eb49', '5451545c6a57070039e5eb4e', '5453c21ae7f2ca00310e291e', '5452eb706a570700e60fa5de', '545674ab6e9615039802c935', '5457d10eec0e010031b78003', '5457bb576e9615049e6a390b', '545569156e9615039702cb5d', '5447640fc078a20045679379']
# properties = ['544362d0c8bd2305ffa488f4']
water_mark_padding = 10
water_mark_base64 = "iVBORw0KGgoAAAANSUhEUgAAAIUAAAA4CAMAAADkUMulAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAB0VBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AAADPRj0UAAAAmnRSTlMAOixGmTwIXDQdeIw1OIuWiQJSlBRrjSJ/cA0/BG6RJgp5hQGSW3F1Ox4oFQ8+X1UvIy0qAzEpFzIHOU5PDIiXj5V0SRx2U1h8LmowIWQLGT1iQTZeimgGgkB9G0eYBUQrZUMRFocTYwk3b4SAZydgUGEgSk1MRSWThndaSJBUH22BbHsSjhAkDjMYekJWc35XaUsag1FyWV1mqQoC9wAAAAFiS0dEAIgFHUgAAAAJcEhZcwAALiMAAC4jAXilP3YAAAg2SURBVFjDxZn5WxpJE4AHKA+C4KAIggpyRJGoAQWVHDAoXhgVURBZR4nEOxqJ8dyPaBLJaowma9zN7n/79ZwMitc+5qF+mKkuempeu6u7qkcMyy0iMZZ/kUBBvhGwwiKA4nxDSB+ADEryDCFXlOJ4nimUZeXleL4pVBWgxvNN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"


def process_water_mark(img):
    water_mark = f_app.storage.image_open(StringIO(base64.b64decode(water_mark_base64)))
    water_mark = water_mark.convert("RGBA")
    padding = 10

    img_request = f_app.request(img, retry=10)
    if img_request.status_code == 200:
        im = f_app.storage.image_open(StringIO(img_request.content))
        if im.size[0] > water_mark.size[0] + padding and im.size[1] > water_mark.size[1] + padding:
            layer = Image.new('RGBA', im.size, (0, 0, 0, 0))
            position = (im.size[0] - water_mark.size[0] - water_mark_padding, im.size[1] - water_mark.size[1] - water_mark_padding)
            layer.paste(water_mark, position)
            im = Image.composite(layer, im, layer)

            f = StringIO()
            im.save(f, "JPEG", quality=100)
            f.seek(0)

            with f_app.storage.aws_s3() as b:
                filename = f_app.util.uuid()
                b.upload(filename, f.read(), policy="public-read")
                img = b.get_public_url(filename)
                logger.debug("Generated %s" % img)
            # filename = f_app.util.uuid()
            # b = open('/tmp/' + filename + '.jpg', 'w+')
            # b.write(f.read())
            # b.close()

            return img
        else:
            logger.warning("Warning: im size < water_mark size, nothing is done.")

    else:
        logger.error("Error %d: Faild to process %s" % (img.status_code, img))

    return img


def upload_from_url(params):
    try:
        im_request = f_app.request.get(params["link"])
        if im_request.status_code == 200:
            im = f_app.storage.image_open(StringIO(im_request.content))
    except:
        # abort(40074, logger.warning("Invalid params: Unknown image type.", exc_info=False))
        logger.warning("Invalid params: Unknown image type.", exc_info=False)
        return None
    width, height = im.size
    original_width, original_height = im.size

    f = StringIO(im_request.content)
    # Make background to white if the file is PNG
    if im.format == "PNG" or im.format == "GIF":
        background = Image.new("RGB", im.size, (255, 255, 255))
        try:
            background.paste(im, mask=im)
        except:
            background.paste(im)
        im = background

    if params["width_limit"] > 0:

        if width <= 1280:
            if width > params["width_limit"]:
                temp_width, temp_height = im.size
                temp_ratio = float(temp_width) / temp_height
                im = im.resize((params["width_limit"], int(params["width_limit"] / temp_ratio)), Image.ANTIALIAS)
        else:
            im = im.resize((1280, 1280 * height // width), Image.ANTIALIAS)

    if params.pop("watermark"):
        water_mark = f_app.storage.image_open(StringIO(base64.b64decode(water_mark_base64)))
        water_mark_padding = 10
        layer = Image.new('RGBA', im.size, (0, 0, 0, 0))
        position = (im.size[0] - water_mark.size[0] - water_mark_padding, im.size[1] - water_mark.size[1] - water_mark_padding)
        layer.paste(water_mark, position)
        im = Image.composite(layer, im, layer)

    f = StringIO()
    im.save(f, "JPEG", quality=95)
    f.seek(0)

    with f_app.storage.aws_s3() as b:
        filename = f_app.util.uuid()
        b.upload(filename, f.read(), policy="public-read")
        result = b.get_public_url(filename)

        return result


corrupted_properties = []
for id in properties:
    property = f_app.property.get(id)
    update_params = {}
    do_update = False
    for field in ["reality_images", "surroundings_images", "effect_pictures", "indoor_sample_room_picture", "planning_map", "floor_plan"]:
        field_update = False
        for k, v in property.get(field, {}).iteritems():
            if isinstance(v, list):
                origin_images = v
                new_images = []
                for img in origin_images:
                    logger.debug(img)
                    if "bbt-currant.s3.amazonaws.com"in img:
                        do_update = True
                        new_img = process_water_mark(img)
                        new_images.append(new_img)
                    else:
                        do_update = True
                        new_img = upload_from_url({"link": img, "width_limit": 1280, "watermark": True})
                        logger.debug(new_img)
                        if new_img:
                            new_images.append(new_img)
                        else:
                            corrupted_properties.append({"id": id, "field": field})
                    update_params["%s.%s" % (field, k)] = new_images

    if do_update:
        logger.debug(id, update_params)
        f_app.property.update_set(id, update_params)


for i in corrupted_properties:
    logger.warning(i)
