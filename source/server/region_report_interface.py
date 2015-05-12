# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
import logging
from app import f_app
from libfelix.f_interface import f_get, response, redirect, abort, template_gettext as _
import currant_util
import currant_data_helper

logger = logging.getLogger(__name__)


@f_get('/region_report/<zipcode_index:re:[A-Z0-9]{2,3}>', '/region-report/<zipcode_index:re:[A-Z0-9]{2,3}>')
@currant_util.check_ip_and_redirect_domain
def postcode_area_report(zipcode_index):
    # Only redirect for now
    report_id_result = f_app.report.search({"zipcode_index": zipcode_index, "status": "new"})  # TODO: Add ', "country": "GB"' after country migration
    if len(report_id_result):
        redirect("/region-report/" + report_id_result[0])
    else:
        abort(40400)


@f_get('/region-report/<report_id:re:[0-9a-fA-F]{24}>')
@currant_util.check_ip_and_redirect_domain
def region_report(report_id):
    report = currant_data_helper.get_report(report_id)
    report = f_app.i18n.process_i18n(report)
    title = report.get('name') + _('街区分析报告')
    description = report.get('description', _('洋房东街区投资分析报告'))
    keywords = report.get('name') + ',' + u'街区投资分析报告' + ',' + ','.join(currant_util.BASE_KEYWORDS_ARRAY)
    return currant_util.common_template("region_report", report=report, title=title, description=description, keywords=keywords)


@f_get("/landregistry/<zipcode_index>/home_values", params=dict(
    width=(int, 400),
    height=(int, 212),
    force_reload=(bool, False),
))
def landregistry_home_values(zipcode_index, params):
    size = [params["width"], params["height"]]
    zipcode_index_size = "%s|%d|%d" % (zipcode_index, size[0], size[1])
    result = f_app.landregistry.get_month_average_by_zipcode_index(zipcode_index_size, zipcode_index, size=size, force_reload=params["force_reload"])
    response.set_header(b"Content-Type", b"image/png")
    return result


@f_get("/landregistry/<zipcode_index>/value_trend", params=dict(
    width=(int, 400),
    height=(int, 212),
    force_reload=(bool, False),
))
def landregistry_value_trend(zipcode_index, params):
    size = [params["width"], params["height"]]
    zipcode_index_size = "%s|%d|%d" % (zipcode_index, size[0], size[1])
    result = f_app.landregistry.get_month_average_by_zipcode_index_with_type(zipcode_index_size, zipcode_index, size=size, force_reload=params["force_reload"])
    response.set_header(b"Content-Type", b"image/png")
    return result


@f_get("/landregistry/<zipcode_index>/average_values", params=dict(
    width=(int, 400),
    height=(int, 212),
    force_reload=(bool, False),
))
def landregistry_average_values(zipcode_index, params):
    size = [params["width"], params["height"]]
    zipcode_index_size = "%s|%d|%d" % (zipcode_index, size[0], size[1])
    result = f_app.landregistry.get_average_values_by_zipcode_index(zipcode_index_size, zipcode_index, size=size, force_reload=params["force_reload"])
    response.set_header(b"Content-Type", b"image/png")
    return result


@f_get("/landregistry/<zipcode_index>/value_ranges", params=dict(
    width=(int, 400),
    height=(int, 212),
    force_reload=(bool, False),
))
def landregistry_value_ranges(zipcode_index, params):
    size = [params["width"], params["height"]]
    zipcode_index_size = "%s|%d|%d" % (zipcode_index, size[0], size[1])
    result = f_app.landregistry.get_price_distribution_by_zipcode_index(zipcode_index_size, zipcode_index, size=size, force_reload=params["force_reload"])
    response.set_header(b"Content-Type", b"image/png")
    return result
