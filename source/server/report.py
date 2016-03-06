# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
import json
import csv
from itertools import chain
from datetime import datetime, timedelta
from six.moves import urllib
from six.moves import cStringIO as StringIO
from bson.objectid import ObjectId
from bson.code import Code
from pyquery import PyQuery as q
import numpy as np
from PIL import ImageOps
from scipy.misc import imread
from libfelix.f_common import f_app
from libfelix.f_cache import f_cache
from libfelix.f_interface import abort

# Fix crash in environments that have no display.
import matplotlib
matplotlib.use('Agg')
import matplotlib.font_manager as fm
import matplotlib.pyplot as plt
from matplotlib.dates import DateFormatter

fontprop = fm.FontProperties(fname="data/wqy-microhei.ttc")

f_app.dependency_register('matplotlib', race="python")
f_app.dependency_register('pyquery', race="python")
f_app.dependency_register('scipy', race="python")


class currant_report(f_app.module_base):
    report_database = "reports"

    def __init__(self):
        f_app.module_install("report", self)
        f_app.dependency_register("pymongo", race="python")

    def get_database(self, m):
        return getattr(m, self.report_database)

    @f_cache("report")
    def get(self, report_id_or_list, force_reload=False, ignore_nonexist=False):
        def _format_each(report):
            return f_app.util.process_objectid(report)

        if isinstance(report_id_or_list, (tuple, list, set)):
            with f_app.mongo() as m:
                result_list = list(self.get_database(m).find({"_id": {"$in": map(ObjectId, report_id_or_list)}, "status": {"$ne": "deleted"}}))

            if len(result_list) < len(report_id_or_list):
                found_list = map(lambda report: str(report["_id"]), result_list)
                if not force_reload and not ignore_nonexist:
                    abort(40400, self.logger.warning("Non-exist report:", filter(lambda report_id: report_id not in found_list, report_id_or_list), exc_info=False))
                elif ignore_nonexist:
                    self.logger.warning("Non-exist report:", filter(lambda report_id: report_id not in found_list, report_id_or_list), exc_info=False)

            result = {report["id"]: _format_each(report) for report in result_list}
            return result

        else:
            with f_app.mongo() as m:
                result = self.get_database(m).find_one({"_id": ObjectId(report_id_or_list), "status": {"$ne": "deleted"}})

                if result is None:
                    if not force_reload and not ignore_nonexist:
                        abort(40400, self.logger.warning("Non-exist report:", report_id_or_list, exc_info=False))
                    elif ignore_nonexist:
                        self.logger.warning("Non-exist report:", report_id_or_list, exc_info=False)
                    return None

            return _format_each(result)

    def add(self, params):
        params.setdefault("status", "new")
        params.setdefault("time", datetime.utcnow())
        with f_app.mongo() as m:
            report_id = self.get_database(m).insert_one(params)

        return str(report_id)

    def output(self, report_id_list, ignore_nonexist=False, multi_return=list, force_reload=False):
        reports = self.get(report_id_list, ignore_nonexist=ignore_nonexist, multi_return=multi_return, force_reload=force_reload)
        return reports

    def search(self, params, sort=["time", "desc"], notime=False, per_page=10):
        params.setdefault("status", {"$ne": "deleted"})
        if sort is not None:
            try:
                sort_field, sort_orientation = sort
            except:
                abort(40000, self.logger.warning("sort param not well in format:", sort))

        else:
            sort_field = sort_orientation = None

        report_id_list = f_app.mongo_index.search(self.get_database, params, count=False, sort=sort_orientation, sort_field=sort_field, per_page=per_page, notime=notime)["content"]

        return report_id_list

    def remove(self, report_id):
        self.update_set(report_id, {"status": "deleted"})

    def update(self, report_id, params):
        with f_app.mongo() as m:
            self.get_database(m).update(
                {"_id": ObjectId(report_id)},
                params,
            )
        report = self.get(report_id, force_reload=True)
        return report

    def update_set(self, report_id, params):
        return self.update(report_id, {"$set": params})

currant_report()


class currant_zipcode(f_app.module_base):
    zipcode_database = "zipcodes"

    def __init__(self):
        f_app.module_install("zipcode", self)
        f_app.dependency_register("pymongo", race="python")

    def get_database(self, m):
        return getattr(m, self.zipcode_database)

    @f_cache("zipcode")
    def get(self, zipcode_id_or_list, force_reload=False, ignore_nonexist=False):
        def _format_each(zipcode):
            return f_app.util.process_objectid(zipcode)

        if isinstance(zipcode_id_or_list, (tuple, list, set)):
            with f_app.mongo() as m:
                result_list = list(self.get_database(m).find({"_id": {"$in": map(ObjectId, zipcode_id_or_list)}, "status": {"$ne": "deleted"}}))

            if len(result_list) < len(zipcode_id_or_list):
                found_list = map(lambda zipcode: str(zipcode["_id"]), result_list)
                if not force_reload and not ignore_nonexist:
                    abort(40400, self.logger.warning("Non-exist zipcode:", filter(lambda zipcode_id: zipcode_id not in found_list, zipcode_id_or_list), exc_info=False))
                elif ignore_nonexist:
                    self.logger.warning("Non-exist zipcode:", filter(lambda zipcode_id: zipcode_id not in found_list, zipcode_id_or_list), exc_info=False)

            result = {zipcode["id"]: _format_each(zipcode) for zipcode in result_list}
            return result

        else:
            with f_app.mongo() as m:
                result = self.get_database(m).find_one({"_id": ObjectId(zipcode_id_or_list), "status": {"$ne": "deleted"}})

                if result is None:
                    if not force_reload and not ignore_nonexist:
                        abort(40400, self.logger.warning("Non-exist zipcode:", zipcode_id_or_list, exc_info=False))
                    elif ignore_nonexist:
                        self.logger.warning("Non-exist zipcode:", zipcode_id_or_list, exc_info=False)
                    return None

            return _format_each(result)

    def add(self, params):
        params.setdefault("status", "new")
        params.setdefault("time", datetime.utcnow())
        assert all(("zipcode" in params,
                    "country" in params,
                    not self.search({"country": params["country"], "zipcode": params["zipcode"], "status": {"$ne": "deleted"}}))), abort(40000, params, exc_info=False)

        with f_app.mongo() as m:
            zipcode_id = self.get_database(m).insert_one(params)

        return str(zipcode_id)

    def output(self, zipcode_id_list, ignore_nonexist=False, multi_return=list, force_reload=False):
        zipcodes = self.get(zipcode_id_list, ignore_nonexist=ignore_nonexist, multi_return=multi_return, force_reload=force_reload)
        return zipcodes

    def search(self, params, sort=["time", "desc"], notime=False, per_page=10):
        params.setdefault("status", {"$ne": "deleted"})
        if sort is not None:
            try:
                sort_field, sort_orientation = sort
            except:
                abort(40000, self.logger.warning("sort param not well in format:", sort))

        else:
            sort_field = sort_orientation = None

        zipcode_id_list = f_app.mongo_index.search(self.get_database, params, count=False, sort=sort_orientation, sort_field=sort_field, per_page=per_page, notime=notime)["content"]

        return zipcode_id_list

    def get_by_zipcode(self, zipcode):
        id_list = self.search({"zipcode": zipcode, "status": {"$ne": "deleted"}})
        if id_list:
            return self.output(id_list)[0]
        else:
            return None

    def remove(self, zipcode_id):
        self.update_set(zipcode_id, {"status": "deleted"})

    def update(self, zipcode_id, params):
        with f_app.mongo() as m:
            self.get_database(m).update(
                {"_id": ObjectId(zipcode_id)},
                params,
            )
        zipcode = self.get(zipcode_id, force_reload=True)
        return zipcode

    def update_set(self, zipcode_id, params):
        return self.update(zipcode_id, {"$set": params})

currant_zipcode()


class currant_policeuk(f_app.module_base):
    def __init__(self):
        f_app.module_install("policeuk", self)

    def api(self, params, method="GET"):
        """
        fields for params:
        lat: latitude
        lng: longitude
        date: YYYY-MM, from 2010-12
        """
        if params:
            params = urllib.parse.urlencode(params)
        url = "http://data.police.uk/api/crimes-street/all-crime?%s" % params
        self.logger.debug(url)
        result = f_app.request(url)
        if result.status_code == 200:
            return json.loads(result.content)
        else:
            abort(50000)

    def api_categories(self, params, method="GET"):
        if params:
            params = urllib.parse.urlencode(params)
        url = "http://data.police.uk/api/crime-categories?%s" % params
        result = f_app.request(url)
        if result.status_code == 200:
            return json.loads(result.content)
        else:
            abort(50000)

    def get_crime_by_zipcode(self, zipcode, date=None):
        zipcode_info = f_app.zipcode.get_by_zipcode(zipcode)
        if zipcode_info:
            if date:
                params = {"lat": zipcode_info["latitude"], "lng": zipcode_info["longitude"], "date": date}
            else:
                params = {"lat": zipcode_info["latitude"], "lng": zipcode_info["longitude"]}
            crime_info = self.api(params)
            return crime_info
        else:
            return None

currant_policeuk()


class currant_landregistry(f_app.module_base):

    landregistry_database = "landregistry"

    def __init__(self):
        f_app.module_install("landregistry", self)

    def get_database(self, m):
        return getattr(m, self.landregistry_database)

    def import_new(self, path):
        with f_app.mongo() as m:
            with open(path, 'rw+') as f:
                rows = csv.reader(f)
                for r in rows:
                    params = {
                        "tid": r[0],
                        "price": float(r[1]),
                        "date": datetime.strptime(r[2], "%Y-%m-%d %H:%M"),
                        "zipcode": r[3],
                        "zipcode_index": r[3].split(' ')[0],
                        "type": r[4],
                        "is_new": r[5],
                        "duration": r[6],
                        "paon": r[7].decode('latin1'),
                        "saon": r[8].decode('latin1'),
                        "street": r[9].decode('latin1'),
                        "locality": r[10].decode('latin1'),
                        "city": r[11].decode('latin1'),
                        "district": r[12].decode('latin1'),
                        "country": r[13].decode('latin1'),
                        "status": r[14]
                    }
                    self.get_database(m).insert_one(params)

    def check_update(self):
        csv_url = "http://publicdata.landregistry.gov.uk/market-trend-data/price-paid-data/b/pp-monthly-update-new-version.csv"
        page_url = 'https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads'
        page = f_app.request.get(page_url, retry=5)

        if page.status_code == 200:
            dom_root = q(page.content)
            date = q(dom_root('.govspeak h2')[0]).text()
            with f_app.mongo() as m:
                result = m.misc.find_one({"landregistry_last_modified": {"$type": 2}})
                if result:
                    if result["landregistry_last_modified"] == date:
                        self.logger.debug("landregistry data is already up-to-date.")
                    else:
                        # Has new version
                        self.logger.debug("start downloading csv...")
                        csv_request = f_app.request.get(csv_url, retry=5)
                        if csv_request.status_code == 200:
                            csv_file = StringIO(csv_request.content)
                            rows = csv.reader(csv_file.readlines())
                            for r in rows:
                                params = {
                                    "tid": r[0],
                                    "price": float(r[1]),
                                    "date": datetime.strptime(r[2], "%Y-%m-%d %H:%M"),
                                    "zipcode": r[3],
                                    "zipcode_index": r[3].split(' ')[0],
                                    "type": r[4],
                                    "is_new": r[5],
                                    "duration": r[6],
                                    "paon": r[7].decode('latin1'),
                                    "saon": r[8].decode('latin1'),
                                    "street": r[9].decode('latin1'),
                                    "locality": r[10].decode('latin1'),
                                    "city": r[11].decode('latin1'),
                                    "district": r[12].decode('latin1'),
                                    "country": r[13].decode('latin1'),
                                    "status": r[14]
                                }

                                if self.get_database(m).find_one({"tid": r[0], "status": r[14]}):
                                    self.logger.warning("Already added %s" % r[0])
                                elif r[14] != "A":
                                    if r[14] == "D":
                                        self.get_database(m).remove({"tid": r[0]})
                                    else:
                                        params.pop("status")
                                        self.get_database(m).update({"tid": r[0]}, params)
                                else:
                                    self.get_database(m).insert_one(params)
                            m.misc.update({"_id": result["_id"]}, {"$set": {"landregistry_last_modified": date}})
                        else:
                            abort(40000, self.logger.warning("Failed to get latest csv file on landregistry", exc_info=False))
                else:
                    m.misc.insert_one({"landregistry_last_modified": date})
        else:
            abort(40000, self.logger.warning("Failded to open landregistry data page", exc_info=False))

    @f_cache('homevalues')
    def get_month_average_by_zipcode_index(self, zipcode_index_size, zipcode_index, size=[0, 0], force_reload=False):
        with f_app.mongo() as m:
            result = m.landregistry_statistics.find({"_id.zipcode_index": zipcode_index, "_id.type": {"$exists": False}})
        merged_result = map(lambda x: dict(chain(x["_id"].items(), x["value"].items())), result)

        x = [i['date'] for i in merged_result]
        y = np.array([i['average_price'] for i in merged_result])

        fig, ax = plt.subplots()

        fig_width, fig_height = size
        fig_width, fig_height = float(fig_width) / 100, float(fig_height) / 100
        if fig_width and fig_height:
            fig.set_size_inches(fig_width, fig_height)

        if fig_width >= 4 or fig_width == 0:
            fontsize = 10
            markersize = 2
        else:
            fontsize = 4
            markersize = 1
        fontprop.set_size(fontsize)

        ax.plot(x, y, "#e70012", marker="o", markeredgecolor="#e70012", markersize=markersize)
        ax.autoscale_view()

        font = {
            'family': 'sans-serif',
            'color': '#999999',
            'weight': 'normal',
            'size': fontsize,
        }
        ax.set_xlabel(u'年', fontdict=font, fontproperties=fontprop)
        ax.set_ylabel(u'英镑', fontdict=font, rotation=0, fontproperties=fontprop)
        ax.xaxis.set_label_coords(1.05, 0.05)
        ax.yaxis.set_label_coords(-0.025, 1.05)

        plt.setp(ax.get_xticklabels(), fontsize=fontsize)
        plt.setp(ax.get_yticklabels(), fontsize=fontsize)
        for child in ax.get_children():
            if isinstance(child, matplotlib.spines.Spine):
                child.set_color('#cccccc')

        if fig_width >= 4:
            water_mark_buffer = StringIO()
            ImageOps.expand(f_app.storage.image_open("../web/src/static/images/logo/img_mark_no_alpha.png"), border=30, fill="#f6f6f6").save(water_mark_buffer, format="PNG")
            water_mark_buffer.seek(0)
            img = imread(water_mark_buffer)
            plt.imshow(img, extent=[ax.get_xlim()[0], ax.get_xlim()[1], 0, ax.get_ylim()[1]], aspect='auto')
            fig.text(0.5, 0.01, "来源：Land Registry - GOV.UK", fontproperties=fontprop, fontsize=fontsize, color="#cccccc", ha="center")

        ax.yaxis.grid(True, color="#e6e6e6", linewidth="1", linestyle="-")
        ax.tick_params(colors='#cccccc')
        ax.set_ylim(0)
        ax.set_axis_bgcolor("#f6f6f6")
        ax.set_axisbelow(True)
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.xaxis.set_ticks_position('none')
        ax.yaxis.set_ticks_position('left')
        ax.yaxis.get_major_formatter().set_scientific(False)

        ax.fmt_xdata = DateFormatter('%Y-%m-%d')
        # fig.autofmt_xdate()
        # ax.set_xticks([i['date'] for i in merged_result], [i['average_price'] for i in merged_result])

        graph = StringIO()
        fig.savefig(graph, format="png", dpi=100)

        return graph.getvalue()

    @f_cache('averagevalues')
    def get_average_values_by_zipcode_index(self, zipcode_index_size, zipcode_index, size=[0, 0], force_reload=False):
        name_map = {
            "D": u"独立式别墅",
            "S": u"半独立式别墅",
            "T": u"联排别墅",
            "F": u"公寓"
        }

        with f_app.mongo() as m:
            result = list(m.landregistry_statistics.aggregate([{"$match": {"_id.zipcode_index": zipcode_index}}, {"$group": {"_id": "$_id.type", "sum_price": {"$sum": "$value.price"}, "sum_count": {"$sum": "$value.count"}}}]))
        merged_result = [i for i in result if i.get("_id")]

        ind = np.arange(len(merged_result))
        width = 0.25

        fig, ax = plt.subplots()
        ax.bar(ind, [float(x['sum_price']) / x['sum_count'] for x in merged_result], width, color=['#e70012', '#ff9c00', '#6fdb2d', '#00b8e6'], edgecolor="none", align="center")

        fig_width, fig_height = size
        fig_width, fig_height = float(fig_width) / 100, float(fig_height) / 100
        if fig_width and fig_height:
            fig.set_size_inches(fig_width, fig_height)
        if fig_width >= 4 or fig_width == 0:
            fontsize = 10
        else:
            fontsize = 4
        fontprop.set_size(fontsize)

        ax.autoscale_view()

        font = {
            'family': 'sans-serif',
            'color': '#999999',
            'weight': 'normal',
            'size': fontsize,
        }

        ax.set_xlabel(u'类别', fontdict=font, fontproperties=fontprop)
        ax.set_ylabel(u'英镑', fontdict=font, rotation=0, fontproperties=fontprop)
        ax.xaxis.set_label_coords(1.05, 0.05)
        ax.yaxis.set_label_coords(-0.025, 1.05)
        ax.set_xticks(ind)
        ax.set_xticklabels([name_map.get(x['_id']) for x in merged_result], fontsize=fontsize, fontproperties=fontprop)

        plt.setp(fig.gca().get_yticklabels(), fontsize=fontsize)
        for child in ax.get_children():
            if isinstance(child, matplotlib.spines.Spine):
                child.set_color('#cccccc')

        if fig_width >= 4:
            water_mark_buffer = StringIO()
            ImageOps.expand(f_app.storage.image_open("../web/src/static/images/logo/img_mark_no_alpha.png"), border=30, fill="#f6f6f6").save(water_mark_buffer, format="PNG")
            water_mark_buffer.seek(0)
            img = imread(water_mark_buffer)
            plt.imshow(img, extent=[ax.get_xlim()[0], ax.get_xlim()[1], 0, ax.get_ylim()[1]], aspect='auto')
            fig.text(0.5, 0.01, "来源：Land Registry - GOV.UK", fontproperties=fontprop, fontsize=fontsize, color="#cccccc", ha="center")

        ax.yaxis.grid(True, color="#e6e6e6", linewidth="1", linestyle="-")
        ax.tick_params(colors='#cccccc')
        ax.set_ylim(0)
        ax.set_axis_bgcolor("#f6f6f6")
        ax.set_axisbelow(True)
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.xaxis.set_ticks_position('none')
        ax.yaxis.set_ticks_position('left')
        ax.yaxis.get_major_formatter().set_scientific(False)

        graph = StringIO()
        fig.savefig(graph, format="png", dpi=100)
        graph.seek(0)

        return graph.getvalue()

    @f_cache('valuetrend')
    def get_month_average_by_zipcode_index_with_type(self, zipcode_index_size, zipcode_index, size=[0, 0], force_reload=False):
        with f_app.mongo() as m:
            result = m.landregistry_statistics.find({"_id.zipcode_index": zipcode_index, "_id.type": {"$exists": True}})
        merged_result = map(lambda x: dict(chain(x["_id"].items(), x["value"].items())), result)

        dresult = []
        sresult = []
        tresult = []
        fresult = []
        for i in merged_result:
            if i.get("type") == "D":
                dresult.append(i)
            elif i.get("type") == "S":
                sresult.append(i)
            elif i.get("type") == "T":
                tresult.append(i)
            else:
                fresult.append(i)

        fig, ax = plt.subplots()

        fig_width, fig_height = size
        fig_width, fig_height = float(fig_width) / 100, float(fig_height) / 100
        if fig_width and fig_height:
            fig.set_size_inches(fig_width, fig_height)
        if fig_width >= 4 or fig_width == 0:
            fontsize = 10
            markersize = 2
        else:
            fontsize = 4
            markersize = 1
        fontprop.set_size(fontsize)

        colors = ["#e70012", "#ff9c00", "#6fdb2d", "#00b8e6"]
        for result, color in zip([dresult, sresult, tresult, fresult], colors):
            ax.plot([i['date'] for i in result], [i['average_price'] for i in result], color, marker="o", markeredgecolor=color, markersize=markersize)

        legend = plt.legend([u"独立式", u"半独立式", u"联排", u"公寓"], loc='upper left', fontsize=fontsize, prop=fontprop)
        frame = legend.get_frame()
        frame.set_color('#f6f6f6')
        frame.set_edgecolor('#e6e6e6')

        if fig_width >= 4:
            water_mark_buffer = StringIO()
            ImageOps.expand(f_app.storage.image_open("../web/src/static/images/logo/img_mark_no_alpha.png"), border=30, fill="#f6f6f6").save(water_mark_buffer, format="PNG")
            water_mark_buffer.seek(0)
            img = imread(water_mark_buffer)
            plt.imshow(img, extent=[ax.get_xlim()[0], ax.get_xlim()[1], 0, ax.get_ylim()[1]], aspect='auto')
            fig.text(0.5, 0.01, "来源：Land Registry - GOV.UK", fontproperties=fontprop, fontsize=fontsize, color="#cccccc", ha="center")

        for color, text in zip(colors, legend.get_texts()):
            text.set_color(color)

        font = {
            'family': 'sans-serif',
            'color': '#999999',
            'weight': 'normal',
            'size': fontsize,
        }

        ax.autoscale_view()
        ax.set_xlabel(u'年', fontdict=font, fontproperties=fontprop)
        ax.set_ylabel(u'英镑', fontdict=font, rotation=0, fontproperties=fontprop)
        ax.xaxis.set_label_coords(1.05, 0.05)
        ax.yaxis.set_label_coords(-0.025, 1.05)

        for child in ax.get_children():
            if isinstance(child, matplotlib.spines.Spine):
                child.set_color('#cccccc')

        ax.yaxis.grid(True, color="#e6e6e6", linewidth="1", linestyle="-")
        ax.tick_params(colors='#cccccc')
        ax.set_ylim(0)
        ax.set_axis_bgcolor("#f6f6f6")
        ax.set_axisbelow(True)
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.xaxis.set_ticks_position('none')
        ax.yaxis.set_ticks_position('left')
        ax.fmt_xdata = DateFormatter('%Y-%m-%d')
        ax.yaxis.get_major_formatter().set_scientific(False)

        plt.setp(fig.gca().get_xticklabels(), fontsize=fontsize)
        plt.setp(fig.gca().get_yticklabels(), fontsize=fontsize)

        graph = StringIO()
        fig.savefig(graph, format="png", dpi=100)

        return graph.getvalue()

    @f_cache('valueranges')
    def get_price_distribution_by_zipcode_index(self, zipcode_index_size, zipcode_index, size=[0, 0], force_reload=False):
        with f_app.mongo() as m:
            result_lt_100k = m.landregistry.find({"zipcode_index": zipcode_index, "price": {"$lt": 100000}}).count()
            result_100k_200k = m.landregistry.find({"zipcode_index": zipcode_index, "price": {"$gte": 100001, "$lt": 200000}}).count()
            result_200k_300k = m.landregistry.find({"zipcode_index": zipcode_index, "price": {"$gte": 200001, "$lt": 300000}}).count()
            result_300k_400k = m.landregistry.find({"zipcode_index": zipcode_index, "price": {"$gte": 300001, "$lt": 400000}}).count()
            result_400k_500k = m.landregistry.find({"zipcode_index": zipcode_index, "price": {"$gte": 400001, "$lt": 500000}}).count()
            result_500k_600k = m.landregistry.find({"zipcode_index": zipcode_index, "price": {"$gte": 500001, "$lt": 600000}}).count()
            result_600k_700k = m.landregistry.find({"zipcode_index": zipcode_index, "price": {"$gte": 600001, "$lt": 700000}}).count()
            result_700k_800k = m.landregistry.find({"zipcode_index": zipcode_index, "price": {"$gte": 700001, "$lt": 800000}}).count()
            result_800k_900k = m.landregistry.find({"zipcode_index": zipcode_index, "price": {"$gte": 800001, "$lt": 900000}}).count()
            result_900k_1m = m.landregistry.find({"zipcode_index": zipcode_index, "price": {"$gte": 900001, "$lt": 1000000}}).count()
            result_gte_1m = m.landregistry.find({"zipcode_index": zipcode_index, "price": {"$gte": 1000000}}).count()

        result_sum = result_lt_100k + result_100k_200k + result_200k_300k + result_300k_400k + result_400k_500k + result_500k_600k + result_600k_700k + result_700k_800k + result_800k_900k + result_900k_1m + result_gte_1m

        ind = np.arange(11)
        width = 0.5

        fig, ax = plt.subplots()

        fig_width, fig_height = size
        fig_width, fig_height = float(fig_width) / 100, float(fig_height) / 100
        if fig_width and fig_height:
            fig.set_size_inches(fig_width, fig_height)

        if fig_width >= 4 or fig_width == 0:
            fontsize = 10
        else:
            fontsize = 4
        fontprop.set_size(fontsize)

        if result_sum > 0:
            ax.bar(ind + width * 2, [result_lt_100k / float(result_sum) * 100, result_100k_200k / float(result_sum) * 100, result_200k_300k / float(result_sum) * 100, result_300k_400k / float(result_sum) * 100, result_400k_500k / float(result_sum) * 100, result_500k_600k / float(result_sum) * 100, result_600k_700k / float(result_sum) * 100, result_700k_800k / float(result_sum) * 100, result_800k_900k / float(result_sum) * 100, result_900k_1m / float(result_sum) * 100, result_gte_1m / float(result_sum) * 100], width, color='#e70012', edgecolor="none", align="center")
        else:
            ax.bar(ind + width * 2, [0 for i in range(0, 11)], width, color="#e70012", edgecolor="none")

        ax.autoscale_view()
        font = {
            'family': 'sans-serif',
            'color': '#999999',
            'weight': 'normal',
            'size': fontsize,
        }
        ax.set_xlabel(u'价格', fontdict=font, fontproperties=fontprop)
        ax.set_ylabel('%', fontdict=font, rotation=0, fontproperties=fontprop)
        ax.xaxis.set_label_coords(1.05, 0.025)
        ax.yaxis.set_label_coords(-0.025, 1.05)

        ax.set_xticks(ind + width * 2)
        ax.set_xticklabels(["under 100k", "100k~200k", "200k~300k", "300k~400k", "400k~500k", "500k~600k", "600k~700k", "700k~800k", "800k~900k", "900k~1m", "over 1m"])

        plt.setp(fig.gca().get_xticklabels(), horizontalalignment='right', fontsize=fontsize, rotation=30)
        plt.setp(fig.gca().get_yticklabels(), fontsize=fontsize)
        plt.gcf().subplots_adjust(bottom=0.2)

        for child in ax.get_children():
            if isinstance(child, matplotlib.spines.Spine):
                child.set_color('#cccccc')

        for child in ax.get_children():
            if isinstance(child, matplotlib.spines.Spine):
                child.set_color('#cccccc')

        if fig_width >= 4:
            water_mark_buffer = StringIO()
            ImageOps.expand(f_app.storage.image_open("../web/src/static/images/logo/img_mark_no_alpha.png"), border=20, fill="#f6f6f6").save(water_mark_buffer, format="PNG")
            water_mark_buffer.seek(0)
            img = imread(water_mark_buffer)
            plt.imshow(img, extent=[ax.get_xlim()[0], ax.get_xlim()[1], 0, ax.get_ylim()[1]], aspect='auto')
            fig.text(0.5, 0.01, "来源：Land Registry - GOV.UK", fontproperties=fontprop, fontsize=fontsize, color="#cccccc", ha="center")

        ax.yaxis.grid(True, color="#e6e6e6", linewidth="1", linestyle="-")
        ax.tick_params(colors='#cccccc')
        ax.set_ylim(0)
        ax.set_axis_bgcolor("#f6f6f6")
        ax.set_axisbelow(True)
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.xaxis.set_ticks_position('none')
        ax.yaxis.set_ticks_position('left')
        ax.yaxis.get_major_formatter().set_scientific(False)

        graph = StringIO()
        fig.savefig(graph, format="png", dpi=100)

        return graph.getvalue()

    def aggregation_monthly(self):
        func_map = Code("""
            function() {
                var key_with_type = {
                    "zipcode_index": this.zipcode_index,
                    "date": new Date(this.date.getFullYear(), 0, 1 ,0 ,0 ,0 ,0),
                    "type": this.type
                };
                var key = {
                    "zipcode_index": this.zipcode_index,
                    "date": new Date(this.date.getFullYear(), 0, 1 ,0 ,0 ,0 ,0),
                };
                var value = {
                    "price": this.price,
                    "count": 1
                };
                emit(key, value);
                emit(key_with_type, value);
            }
        """)
        func_reduce = Code("""
            function(key, values) {
                result = {"price": 0, "count": 0};
                values.forEach(function(value) {
                    result.count += value.count;
                    result.price += value.price;
                });
                return result;
            }
        """)
        func_finalize = Code("""
            function (key, value) {
                value.average_price = value.price / value.count;
                return value;
            }
        """)

        with f_app.mongo() as m:
            f_app.landregistry.get_database(m).map_reduce(func_map, func_reduce, "landregistry_statistics", finalize=func_finalize)
            result = m.landregistry_statistics.find({})

        merged_result = map(lambda x: dict(chain(x["_id"].items(), x["value"].items())), result)
        return merged_result

currant_landregistry()


class currant_landregistry_plugin(f_app.plugin_base):
    task = ["update_landregistry"]

    def task_on_update_landregistry(self, taks):
        f_app.landregistry.check_update()
        f_app.task.put(dict(
            type="update_landregistry",
            start=datetime.utcnow() + timedelta(days=30),
        ))

    def task_on_mapreduce_landregistry(self, taks):
        f_app.landregistry.aggregation_monthly()
        f_app.task.put(dict(
            type="mapreduce_landregistry",
            start=datetime.utcnow() + timedelta(days=30),
        ))

currant_landregistry_plugin()
