# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
import random
from datetime import datetime
from bson import SON
from bson.objectid import ObjectId
from pymongo import GEO2D
from libfelix.f_common import f_app
from libfelix.f_cache import f_cache
from libfelix.f_interface import abort


class currant_property(f_app.module_base):
    property_database = "propertys"

    def __init__(self):
        f_app.module_install("property", self)
        f_app.dependency_register("pymongo", race="python")

    def get_database(self, m):
        return getattr(m, self.property_database)

    @f_cache("property")
    def get(self, property_id_or_list, force_reload=False, ignore_nonexist=False):
        def _format_each(property):
            if "loc" in property:
                property["longitude"], property["latitude"] = property.pop("loc")
            return f_app.util.process_objectid(property)

        if isinstance(property_id_or_list, (tuple, list, set)):
            with f_app.mongo() as m:
                result_list = list(self.get_database(m).find({"_id": {"$in": map(ObjectId, property_id_or_list)}, "status": {"$ne": "deleted"}}))

            if len(result_list) < len(property_id_or_list):
                found_list = map(lambda property: str(property["_id"]), result_list)
                if not force_reload and not ignore_nonexist:
                    abort(40400, self.logger.warning("Non-exist property:", filter(lambda property_id: property_id not in found_list, property_id_or_list), exc_info=False))
                elif ignore_nonexist:
                    self.logger.warning("Non-exist property:", filter(lambda property_id: property_id not in found_list, property_id_or_list), exc_info=False)

            result = {property["id"]: _format_each(property) for property in result_list}
            return result

        else:
            with f_app.mongo() as m:
                result = self.get_database(m).find_one({"_id": ObjectId(property_id_or_list), "status": {"$ne": "deleted"}})

                if result is None:
                    if not force_reload and not ignore_nonexist:
                        abort(40400, self.logger.warning("Non-exist property:", property_id_or_list, exc_info=False))
                    elif ignore_nonexist:
                        self.logger.warning("Non-exist property:", property_id_or_list, exc_info=False)
                    return None

            return _format_each(result)

    def add(self, params, _ignore_render_pdf=False):
        params.setdefault("status", "draft")
        params.setdefault("time", datetime.utcnow())
        params.setdefault("mtime", datetime.utcnow())

        if "latitude" in params and "longitude" in params:
            params["loc"] = [
                params.pop("longitude"),
                params.pop("latitude"),
            ]
        elif "latitude" in params or "longitude" in params:
            abort(40000, self.logger.warning("latitude and longitude must be present together"))

        if not _ignore_render_pdf and "brochure" in params:
            for item in params["brochure"]:
                item["rendering"] = True

        with f_app.mongo() as m:
            property_id = self.get_database(m).insert(params)
            self.get_database(m).create_index([("loc", GEO2D)])

        if params["status"] in ("selling", "hidden", "sold out"):
            f_app.task.put(dict(
                type="assign_property_short_id",
                property_id=str(property_id),
            ))

        elif not _ignore_render_pdf and "brochure" in params and params["brochure"]:
            for item in params["brochure"]:
                f_app.task.add(dict(
                    type="render_pdf",
                    url=item["url"],
                    property_id=str(property_id),
                    property_field="brochure",
                ))

        new_url = "http://yangfd.com/property/" + str(property_id)
        if params["status"] in ("selling", "sold out"):
            f_app.task.put(dict(
                type="ping_sitemap",
                url=new_url
            ))

        f_app.mongo_index.update(self.get_database, str(property_id), self.get_index_fields(str(property_id)))

        return str(property_id)

    def output(self, property_id_list, ignore_nonexist=False, multi_return=list, force_reload=False, permission_check=True, location_only=False):
        ignore_sales_comment = True
        propertys = f_app.util.extract_obj(property_id_list, self, ignore_nonexist=ignore_nonexist, force_reload=force_reload)
        if permission_check:
            user = f_app.user.login.get()
            if user:
                user_roles = f_app.user.get_role(user["id"])
                if not location_only:
                    if set(["admin", "jr_admin", "sales", "jr_sales"]) & set(user_roles):
                        ignore_sales_comment = False

        for property in propertys:
            if isinstance(property, dict):
                if not location_only:
                    if permission_check and not user:
                        if "brochure" in property:
                            for item in property["brochure"]:
                                item.pop("url", None)
                                item["rendered"] = item.get("rendered", [])[:5]
                    if "featured_facility" in property:
                        for item in property["featured_facility"]:
                            if "hesa_university" in item:
                                item["hesa_university"] = f_app.hesa.university.get(item["hesa_university"])
                            if "doogal_station" in item:
                                item["doogal_station"] = f_app.doogal.station.get(item["doogal_station"])

                    if permission_check and (not user or not len(user_roles)):
                        property.pop("real_address", None)
                    if ignore_sales_comment:
                        property.pop("sales_comment", None)
                if property["status"] not in ["selling", "sold out", "restricted"] and permission_check:
                    assert property.get("user_generated") or user and set(user_roles) & set(["admin", "jr_admin", "operation", "jr_operation"]), abort(40300, "No access to specify status or target_property_id")

        if location_only:
            new_property_list = []
            for property in propertys:
                new_property = {"id": property["id"]}
                if "latitude" in property:
                    new_property.update(dict(
                        latitude=property["latitude"],
                        longitude=property["longitude"],
                    ))
                new_property_list.append(new_property)
            propertys = new_property_list

        if multi_return == list:
            return propertys

        else:
            return dict(zip(property_id_list, propertys))

    def search(self, params, sort=["time", "desc"], notime=False, per_page=10, count=False, time_field="time"):
        f_app.util.process_search_params(params)
        params.setdefault("status", {"$ne": "deleted"})
        if sort is not None:
            try:
                sort_field, sort_orientation = sort
            except:
                abort(40000, self.logger.warning("sort param not well in format:", sort))

        else:
            sort_field = sort_orientation = None

        if count:
            property_id_list = f_app.mongo_index.search(self.get_database, params, count=count, sort=sort_orientation, sort_field=sort_field, per_page=per_page, notime=notime, time_field=time_field)
        else:
            property_id_list = f_app.mongo_index.search(self.get_database, params, count=count, sort=sort_orientation, sort_field=sort_field, per_page=per_page, notime=notime, time_field=time_field)['content']

        return property_id_list

    def crawler_insert_update(self, params):
        from property_api_interface import property_params
        property_crawler_id = params.pop("property_crawler_id")

        params = f_app.param_parser(_source=params, **property_params)

        current_records = self.search({"property_crawler_id": property_crawler_id, "target_property_id": {"$exists": False}, "status": {"$exists": True}})
        assert len(current_records) <= 2, self.logger.error("Multiple property found for property_crawler_id:", property_crawler_id)

        if len(current_records):
            current_record = self.get(current_records[0], ignore_nonexist=True)

            if current_record is None:
                return

            else:
                if "target_property_id" in current_record and current_record["target_property_id"] == current_records[-1]:
                    current_record = self.get(current_records[-1], ignore_nonexist=True)

                    if current_record is None:
                        current_record = self.get(current_records[0], ignore_nonexist=True)

            for key in list(params.keys()):
                if params[key] == current_record.get(key):
                    params.pop(key)

            property_id = current_record["id"]
            existing_draft = f_app.property.search({"target_property_id": property_id, "status": {"$ne": "deleted"}})

            if existing_draft:
                action = lambda _params: f_app.property.update_set(existing_draft[0], _params)

            else:
                params.setdefault("status", "draft")
                params["target_property_id"] = property_id
                action = lambda params: f_app.property.add(params)

        else:
            params.setdefault("status", "draft")
            params.setdefault("property_crawler_id", property_crawler_id)
            action = lambda params: f_app.property.add(params)

        return action(params)

    def remove(self, property_id):
        for child_property_id in self.search({'target_property_id': str(property_id)}, per_page=0):
            self.remove(child_property_id)
        self.update_set(property_id, {"status": "deleted"})

    def get_nearby(self, params, output=True):
        latitude = params.pop("latitude")
        longitude = params.pop("longitude")
        search_range = params.pop("search_range")

        search_command = SON([
            ('geoNear', self.property_database),
            ('near', [float(longitude), float(latitude)]),
            ('maxDistance', search_range * 1.0 / f_app.common.earth_radius),
            ('spherical', True),
            ('query', params),
            ('num', 20),
        ])

        with f_app.mongo() as m:
            tmp_result = m.command(search_command)["results"]

        result = []
        property_id_list = map(lambda item: str(item["obj"]["_id"]), tmp_result)

        if not output:
            return property_id_list

        property_dict = self.output(property_id_list, multi_return=dict)

        for tmp_property in tmp_result:

            distance = tmp_property["dis"] * f_app.common.earth_radius
            property = property_dict.get(str(tmp_property["obj"].pop("_id")))
            property["distance"] = distance

            result.append(property)

        return result

    def update(self, property_id, params, _ignore_render_pdf=False):
        if "$set" in params:
            params["$set"].setdefault("mtime", datetime.utcnow())
            if "latitude" in params["$set"] and "longitude" in params["$set"]:
                params["$set"]["loc"] = [
                    params["$set"].pop("longitude"),
                    params["$set"].pop("latitude"),
                ]
            elif "latitude" in params["$set"] or "longitude" in params["$set"]:
                abort(40000, self.logger.warning("latitude and longitude must be present together", exc_info=False))

            if not _ignore_render_pdf and "brochure" in params["$set"] and params["$set"]["brochure"]:
                old_property = f_app.property.get(property_id)
                old_urls = map(lambda item: item["url"], old_property.get("brochure", []))
                for item in params["$set"]["brochure"]:
                    if item["url"] not in old_urls:
                        item["rendering"] = True

        with f_app.mongo() as m:
            self.get_database(m).update(
                {"_id": ObjectId(property_id)},
                params,
            )
        property = self.get(property_id, force_reload=True)

        if property is not None:
            if property["status"] in ("selling", "hidden", "sold out"):
                if "short_id" not in property:
                    f_app.task.put(dict(
                        type="assign_property_short_id",
                        property_id=property_id,
                    ))

            elif not _ignore_render_pdf and "$set" in params and "brochure" in params["$set"] and params["$set"]["brochure"]:
                old_urls = map(lambda item: item["url"], old_property.get("brochure", []))
                for item in params["$set"]["brochure"]:
                    if item["url"] not in old_urls:
                        f_app.task.add(dict(
                            type="render_pdf",
                            url=item["url"],
                            property_id=str(property_id),
                            property_field="brochure",
                        ))

            new_url = "http://yangfd.com/property/" + str(property_id)
            if property["status"] in ("selling", "sold out") and "params" in params.get("$set", {}):
                f_app.task.put(dict(
                    type="ping_sitemap",
                    url=new_url
                ))

            if {"country", "city", "maponics_neighborhood", "zipcode", "zipcode_index", "featured_facility"} & set(params):
                f_app.mongo_index.update(self.get_database, property_id, self.get_index_fields(property_id))

        return property

    def update_set(self, property_id, params, _ignore_render_pdf=False):
        return self.update(property_id, {"$set": params}, _ignore_render_pdf=_ignore_render_pdf)

    @f_cache("propertybyslug")
    def get_by_slug(self, slug, force_reload=False):
        if f_app.common.test:
            return f_app.mock_data["property_get_by_slug"]

        with f_app.mongo() as m:
            property = self.get_database(m).find_one({
                "slug": slug,
                "status": {
                    "$ne": "deleted",
                }
            })
            if not force_reload:
                assert property is not None, abort(40000)

        return f_app.util.process_objectid(property)

    def get_index_fields(self, property_id):
        property = f_app.i18n.process_i18n(self.output([property_id], permission_check=False)[0])
        index_params = f_app.util.try_get_value(property, ["zipcode", "zipcode_index"]).values()

        if "city" in property and property["city"] and "name" in property["city"]:
            index_params.append(property["city"]["name"])

        if "maponics_neighborhood" in property and property["maponics_neighborhood"] and "name" in property["maponics_neighborhood"]:
            index_params.append(property["maponics_neighborhood"]["name"])
            if "parent_name" in property["maponics_neighborhood"]:
                index_params.append(property["maponics_neighborhood"]["parent_name"])

        if "featured_facility" in property and property["featured_facility"]:
            for featured_facility in property["featured_facility"]:
                if "doogal_station" in featured_facility and "name" in featured_facility["doogal_station"]:
                    index_params.append(featured_facility["doogal_station"]["name"])
                elif "hesa_university" in featured_facility and "name" in featured_facility["hesa_university"]:
                    index_params.append(featured_facility["hesa_university"]["name"])

        return index_params

    def reindex(self):
        for property_id in f_app.property.search({"status": "selling"}, per_page=-1):
            f_app.mongo_index.update(f_app.property.get_database, property_id, f_app.property.get_index_fields(property_id))

currant_property()


class currant_property_plugin(f_app.plugin_base):
    task = ["render_pdf", "assign_property_short_id"]

    def task_on_render_pdf(self, task):
        property_id = task["property_id"]
        try:
            property = f_app.property.get(property_id)
            assert property["status"] in ["draft", "not translated", "translating"]
            for n, item in enumerate(property[task["property_field"]]):
                if item["url"] == task["url"]:
                    def update(value):
                        property[task["property_field"]][n] = value
                    break

            else:
                raise ValueError

        except:
            self.logger.warning("render_pdf task no longer valid, ignoring task:", task, exc_info=False)
            return

        from wand.image import Image
        image_pdf = Image(blob=f_app.request(task["url"]).content)

        result = {"url": task["url"], "rendered": []}

        with f_app.storage.aws_s3() as b:
            for page in image_pdf.sequence:
                pdf_page = Image(image=page)
                img = pdf_page.convert('jpeg')
                filename = f_app.util.uuid() + ".jpg"
                b.upload(filename, img.make_blob(), policy="public-read")
                result["rendered"].append(b.get_public_url(filename))

        update(result)
        f_app.property.update_set(task["property_id"], {task["property_field"]: property[task["property_field"]]})

    def task_on_assign_property_short_id(self, task):
        # Validate that the property is still available:
        try:
            property = f_app.property.get(task["property_id"])
        except:
            self.logger.warning("Invalid property to assign short id:", task["property_id"])
            return

        if "short_id" in property:
            self.logger.debug("Short id already exist for property", task["property_id"], ", ignoring assignment.")
            return

        self.logger.debug("Looking for a free short id for property", task["property_id"])
        # TODO: not infinity?
        while True:
            new_short_id = "".join([str(random.randint(0, 9)) for i in range(6)])
            found_property = f_app.property.search({"status": {"$in": ["selling", "hidden", "sold out"]}, "short_id": new_short_id})
            if not len(found_property):
                break

        self.logger.debug("Setting short id", new_short_id, "for property", task["property_id"])
        f_app.property.update_set(task["property_id"], {"short_id": new_short_id})

currant_property_plugin()


class currant_plot(f_app.module_base):
    plot_database = "plots"

    def __init__(self):
        f_app.module_install("plot", self)
        f_app.dependency_register("pymongo", race="python")

    def get_database(self, m):
        return getattr(m, self.plot_database)

    @f_cache("plot", support_multi=True)
    def get(self, plot_id_or_list, force_reload=False, ignore_nonexist=False):
        def _format_each(plot):
            return f_app.util.process_objectid(plot)

        if isinstance(plot_id_or_list, (tuple, list, set)):
            with f_app.mongo() as m:
                result_list = list(self.get_database(m).find({"_id": {"$in": map(ObjectId, plot_id_or_list)}, "status": {"$ne": "deleted"}}))

            if len(result_list) < len(plot_id_or_list):
                found_list = map(lambda plot: str(plot["_id"]), result_list)
                if not force_reload and not ignore_nonexist:
                    abort(40400, self.logger.warning("Non-exist plot:", filter(lambda plot_id: plot_id not in found_list, plot_id_or_list), exc_info=False))
                elif ignore_nonexist:
                    self.logger.warning("Non-exist plot:", filter(lambda plot_id: plot_id not in found_list, plot_id_or_list), exc_info=False)

            result = {plot["id"]: _format_each(plot) for plot in result_list}
            return result

        else:
            with f_app.mongo() as m:
                result = self.get_database(m).find_one({"_id": ObjectId(plot_id_or_list), "status": {"$ne": "deleted"}})

                if result is None:
                    if not force_reload and not ignore_nonexist:
                        abort(40400, self.logger.warning("Non-exist plot:", plot_id_or_list, exc_info=False))
                    elif ignore_nonexist:
                        self.logger.warning("Non-exist plot:", plot_id_or_list, exc_info=False)
                    return None

            return _format_each(result)

    def add(self, params):
        if "property_id" in params:
            f_app.property.get(params["property_id"])
        else:
            abort(40000, self.logger.warning("Invalid params: property_id not present"))
        params.setdefault("status", "new")
        params.setdefault("time", datetime.utcnow())
        with f_app.mongo() as m:
            plot_id = self.get_database(m).insert(params)

        return str(plot_id)

    def output(self, plot_id_list, ignore_nonexist=False, multi_return=list, force_reload=False):
        plots = self.get(plot_id_list, ignore_nonexist=ignore_nonexist, multi_return=multi_return, force_reload=force_reload)
        return plots

    def search(self, params, sort=["time", "desc"], notime=False, per_page=10):
        params.setdefault("status", {"$ne": "deleted"})
        if sort is not None:
            try:
                sort_field, sort_orientation = sort
            except:
                abort(40000, self.logger.warning("sort param not well in format:", sort))

        else:
            sort_field = sort_orientation = None

        plot_id_list = f_app.mongo_index.search(self.get_database, params, count=False, sort=sort_orientation, sort_field=sort_field, per_page=per_page, notime=notime)["content"]

        return plot_id_list

    def remove(self, plot_id):
        self.update_set(plot_id, {"status": "deleted"})

    def update(self, plot_id, params):
        with f_app.mongo() as m:
            self.get_database(m).update(
                {"_id": ObjectId(plot_id)},
                params,
            )
        plot = self.get(plot_id, force_reload=True)
        return plot

    def update_set(self, plot_id, params):
        return self.update(plot_id, {"$set": params})

    def crawler_insert_update(self, params):
        from plot_api_interface import plot_params
        plot_crawler_id = params.pop("plot_crawler_id")

        params = f_app.param_parser(_source=params, **plot_params)

        current_records = self.search({"plot_crawler_id": plot_crawler_id, "status": {"$exists": True}})
        assert len(current_records) <= 1, self.logger.error("Multiple plot found for plot_crawler_id:", plot_crawler_id)

        if len(current_records):
            current_record = self.get(current_records[0], ignore_nonexist=True)

            if current_record is None:
                return

            for key in list(params.keys()):
                if params[key] == current_record.get(key):
                    params.pop(key)

            plot_id = current_record["id"]

            action = lambda _params: f_app.plot.update_set(plot_id, _params)

        else:
            params.setdefault("plot_crawler_id", plot_crawler_id)
            action = lambda params: f_app.plot.add(params)

        return action(params)

currant_plot()
