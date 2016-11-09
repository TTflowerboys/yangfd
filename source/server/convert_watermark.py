#!/usr/bin/env python2
# -*- coding: utf-8 -*-

from __future__ import unicode_literals, absolute_import
from app import f_app
import six
from PIL import Image
import base64
import logging
logger = logging.getLogger(__name__)


properties = f_app.property.search({"status": {"$in": ["selling", "sold out"]}}, per_page=0)
water_mark_padding = 10
water_mark_base64 = "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"


def process_water_mark(img, viewport_size=[800, 533], thumbnail_size=[600, 300], width_limit=1280):
    water_mark = f_app.storage.image_open(six.BytesIO(base64.b64decode(water_mark_base64)))
    water_mark = water_mark.convert("RGBA")
    padding = 10

    img_request = f_app.request(img, retry=10)
    if img_request.status_code == 200:
        im = f_app.storage.image_open(six.BytesIO(img_request.content))
        original_width, original_height = im.size
        original_ratio = float(original_width) / original_height

        if im.format == "PNG" or im.format == "GIF":
            background = Image.new("RGB", im.size, (255, 255, 255))
            try:
                background.paste(im, mask=im)
            except:
                background.paste(im)
            im = background

        if width_limit > 0:
            if original_width <= 1280:
                if original_width > width_limit:
                    temp_width, temp_height = im.size
                    temp_ratio = float(temp_width) / temp_height
                    im = im.resize((width_limit, int(width_limit / temp_ratio)), Image.ANTIALIAS)
            else:
                im = im.resize((1280, 1280 * original_height // original_width), Image.ANTIALIAS)

        if im.size[0] > water_mark.size[0] + padding and im.size[1] > water_mark.size[1] + padding:
            layer = Image.new('RGBA', im.size, (0, 0, 0, 0))
            position = (im.size[0] - water_mark.size[0] - water_mark_padding, im.size[1] - water_mark.size[1] - water_mark_padding)
            layer.paste(water_mark, position)
            im = Image.composite(layer, im, layer)

            f_original = six.BytesIO()
            im.save(f_original, "JPEG", quality=100, optimize=True, progressive=True)
            f_original.seek(0)

            if viewport_size[0] > 0:
                im = f_app.storage.image_open(six.BytesIO(img_request.content))
                if im.format == "PNG" or im.format == "GIF":
                    background = Image.new("RGB", im.size, (255, 255, 255))
                    try:
                        background.paste(im, mask=im)
                    except:
                        background.paste(im)
                    im = background

                viewport_width, viewport_height = viewport_size
                viewport_ratio = float(viewport_width) / viewport_height

                if original_height < viewport_height:
                    # abort(40000, logger.warning('Invalid viewport size: cannot be larger than width param', exc_info=False))
                    if original_ratio > viewport_ratio:
                        im = im.resize((int(float(original_width) * viewport_height / original_height), viewport_height), Image.ANTIALIAS)
                    else:
                        im = im.resize((viewport_width, int(float(original_height) * viewport_width / original_width)), Image.ANTIALIAS)

                elif original_width < viewport_width:
                    if original_ratio < viewport_ratio:
                        im = im.resize((viewport_width, int(float(original_height) * viewport_width / original_width)), Image.ANTIALIAS)
                    else:
                        im = im.resize((int(float(original_width) * viewport_height / original_height), viewport_height), Image.ANTIALIAS)

                if original_ratio < viewport_ratio:
                    # scale by viewport_width
                    scaled_height = int(float(original_height) / original_width * viewport_width + 0.5)
                    im = im.resize((viewport_width, scaled_height), Image.ANTIALIAS)
                    h_cut = int(float(scaled_height - viewport_height) // 2)
                    box = (0, h_cut, viewport_width, scaled_height - h_cut)
                else:
                    # scale by viewport_height
                    scaled_width = int(float(original_width) / original_height * viewport_height + 0.5)
                    im = im.resize((scaled_width, viewport_height), Image.ANTIALIAS)
                    w_cut = int(float(scaled_width - viewport_width) // 2)
                    box = (w_cut, 0, scaled_width - w_cut, viewport_height)
                im = im.crop(box)
                im = im.resize(viewport_size, Image.ANTIALIAS)

                layer = Image.new('RGBA', im.size, (0, 0, 0, 0))
                position = (im.size[0] - water_mark.size[0] - water_mark_padding, im.size[1] - water_mark.size[1] - water_mark_padding)
                layer.paste(water_mark, position)
                im = Image.composite(layer, im, layer)

                f_viewport = six.BytesIO()
                im.save(f_viewport, "JPEG", quality=95, optimize=True, progressive=True)
                f_viewport.seek(0)

            if thumbnail_size[0] > 0:
                im = f_app.storage.image_open(six.BytesIO(img_request.content))
                if im.format == "PNG" or im.format == "GIF":
                    background = Image.new("RGB", im.size, (255, 255, 255))
                    try:
                        background.paste(im, mask=im)
                    except:
                        background.paste(im)
                    im = background

                thumbnail_width, thumbnail_height = thumbnail_size
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
                im = im.resize(thumbnail_size, Image.ANTIALIAS)
                f_thumbnail = six.BytesIO()
                im.save(f_thumbnail, "JPEG", quality=95, optimize=True, progressive=True)
                f_thumbnail.seek(0)

            f_original.seek(0)

            with f_app.storage.aws_s3() as b:
                filename = f_app.util.uuid()
                b.upload(filename + "_original", f_original.read(), policy="public-read")
                result = {"original": b.get_public_url(filename + "_original")}

                if viewport_size[0] > 0:
                    b.upload(filename, f_viewport.read(), policy="public-read")
                    result.update({"url": b.get_public_url(filename)})

                if thumbnail_size[0] > 0:
                    b.upload(filename + "_thumbnail", f_thumbnail.read(), policy="public-read")
                    result.update({"thumbnail": b.get_public_url(filename + "_thumbnail")})

                return result
            # filename = f_app.util.uuid()
            # b = open('/tmp/' + filename + '.jpg', 'w+')
            # b.write(f.read())
            # b.close()

        else:
            logger.warning("Warning: im size < water_mark size, nothing is done.")

    else:
        logger.error("Error %d: Faild to process %s" % (img.status_code, img))


def main():
    corrupted_properties = []
    for id in properties:
        property = f_app.property.get(id)
        update_params = {}
        for field in ["reality_images", "surroundings_images", "effect_pictures", "indoor_sample_room_picture", "planning_map", "floor_plan"]:
            for k, v in six.iteritems(property.get(field, {})):
                if isinstance(v, list):
                    origin_images = v
                    new_images = []
                    for img in origin_images:
                        if img.strip():
                            logger.debug(img)
                            new_img = process_water_mark(img)['url']
                            logger.debug(new_img)
                            if new_img:
                                new_images.append(new_img)
                            else:
                                corrupted_properties.append({"id": id, "field": field})
                        else:
                            logger.warning('Invalid data found at %s %s' % (id, field))
                    update_params["%s.%s" % (field, k)] = new_images

        logger.debug(id, update_params)
        f_app.property.update_set(id, update_params)

    for i in corrupted_properties:
        logger.warning(i)

if __name__ == '__main__':
    main()
