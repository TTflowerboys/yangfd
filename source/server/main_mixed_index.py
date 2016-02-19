# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from collections import defaultdict
from bson import SON
from bson.objectid import ObjectId
from pymongo import ASCENDING, GEO2D
import csv
from libfelix.f_common import f_app
from libfelix.f_cache import f_cache
from libfelix.f_interface import abort


class f_doogal(f_app.module_base):
    nested_attr = ("station",)
    doogal_database = "doogal"
    doogal_station_database = "doogal_stations"

    def __init__(self):
        f_app.module_install("doogal", self)

    def get_database(self, m):
        return getattr(m, self.doogal_database)

    @f_cache("doogal_districts_wards", noid=True)
    def get_districts_wards(self):
        districts = defaultdict(set)
        with f_app.mongo() as m:
            for item in self.get_database(m).find({}, {"district": 1, "ward": 1}):
                districts[item["district"]].add(item["ward"])

        return districts

    def import_new(self, path):
        with f_app.mongo() as m:
            self.get_database(m).create_index([("currant_country", ASCENDING)])
            self.get_database(m).create_index([("zipcode", ASCENDING)])
            self.get_database(m).create_index([("currant_region", ASCENDING)])
            with open(path, 'rw+') as f:
                rows = csv.reader(f)

                first = True
                count = 0
                for r in rows:
                    # Ignore first line
                    if first:
                        first = False
                        continue

                    params = {
                        "currant_country": "GB",  # Hardcoded
                        "zipcode": r[0],
                        "latitude": float(r[1]),
                        "longitude": float(r[2]),
                        "easting": r[3],
                        "northing": r[4],
                        "gridref": r[5],
                        "county": r[6],
                        "district": r[7],
                        "ward": r[8],
                        "currant_region": r[8],  # We take ward as region
                        "district_code": r[9],
                        "ward_code": r[10],
                        "country": r[11],
                        "country_code": r[12],
                        "constituency": r[13],
                        "introduced": r[14],
                        "terminated": r[15],
                        "parish": r[16],
                        "national_park": r[17],
                        "population": int(r[18]) if r[18] else r[18],
                        "household": int(r[19]) if r[19] else r[19],
                        "built_up_area": r[20],
                        "built_up_sub_division": r[21],
                        "lower_layer_super_output_area": r[22],
                        "rural_urban": r[23],
                        "region": r[24],
                    }
                    self.get_database(m).update({
                        "currant_country": params["currant_country"],
                        "zipcode": params["zipcode"],
                    }, {"$set": params}, upsert=True)
                    count += 1
                    if count % 100 == 1:
                        self.logger.debug("doogal postcode imported", count, "records...")

    def station_get_database(self, m):
        return getattr(m, self.doogal_station_database)

    @f_cache("doogalstation", support_multi=True)
    def station_get(self, station_id_or_list, force_reload=False):
        def _format_each(station):
            station.pop("loc", None)
            return f_app.util.process_objectid(station)

        if f_app.util.batch_iterable(station_id_or_list):
            result = {}

            with f_app.mongo() as m:
                result_list = list(self.station.get_database(m).find({"_id": {"$in": [ObjectId(user_id) for user_id in station_id_or_list]}, "status": {"$ne": "deleted"}}))

            if not force_reload and len(result_list) < len(station_id_or_list):
                found_list = map(lambda station: str(station["_id"]), result_list)
                abort(40400, self.logger.warning("Non-exist station:", filter(lambda station_id: station_id not in found_list, station_id_or_list), exc_info=False))

            for station in result_list:
                result[station["id"]] = _format_each(station)

            return result

        else:
            with f_app.mongo() as m:
                result = self.station.get_database(m).find_one({"_id": ObjectId(station_id_or_list), "status": {"$ne": "deleted"}})

                if result is None:
                    if not force_reload:
                        abort(40400, self.logger.warning("Non-exist station:", station_id_or_list, exc_info=False))

                    return None

            return _format_each(result)

    def station_search(self, params, per_page=0):
        return f_app.mongo_index.search(self.station.get_database, params, notime=True, sort_field="name", count=False, per_page=per_page)["content"]

    def station_import_new(self, path, geonames_city_id):
        with f_app.mongo() as m:
            self.station.get_database(m).create_index([("currant_country", ASCENDING)])
            self.station.get_database(m).create_index([("zipcode", ASCENDING)])
            self.station.get_database(m).create_index([("geonames_city_id", ASCENDING)])
            with open(path, 'rw+') as f:
                rows = csv.reader(f)

                first = True
                count = 0
                for r in rows:
                    # Ignore first line
                    if first:
                        first = False
                        continue

                    params = {
                        "currant_country": "GB",  # Hardcoded
                        "name": r[0],
                        "latitude": float(r[3]),
                        "longitude": float(r[4]),
                        "loc": [float(r[4]), float(r[3])],
                        "easting": r[1],
                        "northing": r[2],
                        "zone": r[5],
                        "zipcode": r[6],
                        "zipcode_index": r[6].replace(" ", ""),
                        "geonames_city_id": ObjectId(geonames_city_id),
                    }
                    self.station.get_database(m).update({
                        "currant_country": params["currant_country"],
                        "name": params["name"],
                    }, {"$set": params}, upsert=True)
                    count += 1
                    if count % 20 == 1:
                        self.logger.debug("doogal station imported", count, "records...")

f_doogal()


class f_maponics(f_app.plugin_base):
    nested_attr = ("neighborhood",)
    maponics_neighborhood_database = "maponics_neighborhood"

    def __init__(self, *args, **kwargs):
        f_app.module_install("maponics", self)

    def neighborhood_get_database(self, m):
        return getattr(m, self.maponics_neighborhood_database)

    @f_cache("maponicsneighborhood", support_multi=True)
    def neighborhood_get(self, neighborhood_id_or_list, force_reload=False, ignore_nonexist=False):
        def _format_each(neighborhood):
            neighborhood.pop("wkt", None)
            return f_app.util.process_objectid(neighborhood)

        if f_app.util.batch_iterable(neighborhood_id_or_list):
            with f_app.mongo() as m:
                result_list = list(self.neighborhood.get_database(m).find({"_id": {"$in": map(ObjectId, neighborhood_id_or_list)}, "status": {"$ne": "deleted"}}))

            if len(result_list) < len(neighborhood_id_or_list):
                found_list = map(lambda neighborhood: str(neighborhood["_id"]), result_list)
                if not force_reload and not ignore_nonexist:
                    abort(40400, self.logger.warning("Non-exist neighborhood:", filter(lambda neighborhood_id: neighborhood_id not in found_list, neighborhood_id_or_list), exc_info=False))
                elif ignore_nonexist:
                    self.logger.warning("Non-exist neighborhood:", filter(lambda neighborhood_id: neighborhood_id not in found_list, neighborhood_id_or_list), exc_info=False)

            result = {neighborhood["id"]: _format_each(neighborhood) for neighborhood in result_list}
            return result

        else:
            with f_app.mongo() as m:
                result = self.neighborhood.get_database(m).find_one({"_id": ObjectId(neighborhood_id_or_list), "status": {"$ne": "deleted"}})

                if result is None:
                    if not force_reload and not ignore_nonexist:
                        abort(40400, self.logger.warning("Non-exist neighborhood:", neighborhood_id_or_list, exc_info=False))
                    elif ignore_nonexist:
                        self.logger.warning("Non-exist neighborhood:", neighborhood_id_or_list, exc_info=False)

                    return None

            return _format_each(result)

    def neighborhood_get_by_nid(self, nid):
        return self.neighborhood.search({"nid": nid})

    def neighborhood_import(self, filename, geonames_city_id):
        with open(filename) as f:
            rows = csv.reader(f.readlines(), delimiter=b"|", quoting=csv.QUOTE_NONE)
            count = 0
            first = True

            with f_app.mongo() as m:
                self.neighborhood.get_database(m).create_index([("nid", ASCENDING)])
                self.neighborhood.get_database(m).create_index([("loc", GEO2D)])
                self.neighborhood.get_database(m).create_index([("country", ASCENDING)])

                for r in rows:
                    if first:
                        # First line is header
                        first = False
                        continue

                    params = {
                        "nid": r[0],
                        "name": r[1].decode("utf-8"),
                        "ntype": r[2],
                        "country": r[3],
                        "metro": r[4],
                        "latitude": r[5],
                        "longitude": r[6],
                        "loc": [float(r[6]), float(r[5])],
                        "ncs_code": r[7],
                        "parentnid": r[8],
                        "relver": r[9],
                        "wkt": r[10],
                        "status": "new",
                        "geonames_city_id": ObjectId(geonames_city_id),
                    }

                    self.neighborhood.get_database(m).update({
                        "nid": params["nid"],
                    }, {"$set": params}, upsert=True)

                    count += 1
                    if count % 100 == 1:
                        self.logger.debug("maponics neighborhood imported", count, "records...")

    def neighborhood_search(self, params, per_page=0):
        return f_app.mongo_index.search(self.neighborhood.get_database, params, notime=True, sort_field="population", count=False, per_page=per_page)["content"]

    # TODO: work with new get()
    def neighborhood_assign_to_geonames_postcode(self, country):
        import shapely.wkt
        import shapely.geometry

        all_neighborhoods = self.neighborhood.get(self.neighborhood.search({"country": country}))

        for neighborhood in all_neighborhoods:
            neighborhood["shapely"] = shapely.wkt.loads(neighborhood["wkt"])

        with f_app.mongo() as m:
            for postcode in f_app.geonames.postcode.get_database(m).find({"country": country}):
                if "loc" not in postcode:
                    continue

                postcode["neighborhoods"] = []
                point = shapely.geometry.Point(*postcode["loc"])
                for neighborhood in all_neighborhoods:
                    if point.within(neighborhood["shapely"]):
                        postcode["neighborhoods"].append(ObjectId(neighborhood["id"]))

                if len(postcode["neighborhoods"]):
                    self.logger.debug("Assigning neighborhoods", postcode["neighborhoods"], "to postcode", postcode["postcode"], "id:", postcode["_id"])
                    f_app.geonames.postcode.get_database(m).update({"_id": postcode["_id"]}, {"$set": {"neighborhoods": postcode["neighborhoods"]}})
                    f_app.geonames.postcode.get(postcode["_id"], force_reload=True)

                else:
                    self.logger.debug("Warning: no neighborhood found for postcode", postcode["postcode"], "id:", postcode["_id"])

    def neighborhood_assign_to_property(self, country):
        for property in f_app.property.get(f_app.property.search({"country.code": country, "zipcode": {"$exists": True}}, per_page=-1)):
            postcode_ids = f_app.geonames.postcode.search({"country": country, "postcode_index": property["zipcode"].replace(" ", "")})
            if len(postcode_ids) != 1:
                self.logger.warning("Multiple or no zipcode found for property", property["id"], "zipcode:", property["zipcode"], "ignoring assignment...")
                continue
            postcode = f_app.geonames.postcode.get(postcode_ids[0])
            if "neighborhoods" in postcode and postcode["neighborhoods"]:
                self.logger.debug("Assigning neighborhood", postcode["neighborhoods"][0], "to property", property["id"])
                f_app.property.update_set(property["id"], {"maponics_neighborhood": {"_maponics_neighborhood": True, "_id": ObjectId(postcode["neighborhoods"][0])}})
                if len(postcode["neighborhoods"]) > 1:
                    self.logger.debug("Assigning other neighborhoods", postcode["neighborhoods"][1:], "to property", property["id"])
                    f_app.property.update_set(property["id"], {"maponics_parent_neighborhood": [{"_maponics_neighborhood": True, "_id": ObjectId(x)} for x in postcode["neighborhoods"][1:]]})

f_maponics()


class f_hesa(f_app.plugin_base):
    nested_attr = ("university",)
    hesa_university_database = "hesa_university"

    def __init__(self, *args, **kwargs):
        f_app.module_install("hesa", self)

    def university_get_database(self, m):
        return getattr(m, self.hesa_university_database)

    @f_cache("hesauniversity", support_multi=True)
    def university_get(self, university_id_or_list, force_reload=False, ignore_nonexist=False):
        def _format_each(university):
            return f_app.util.process_objectid(university)

        if f_app.util.batch_iterable(university_id_or_list):
            with f_app.mongo() as m:
                result_list = list(self.university.get_database(m).find({"_id": {"$in": map(ObjectId, university_id_or_list)}, "status": {"$ne": "deleted"}}))

            if len(result_list) < len(university_id_or_list):
                found_list = map(lambda university: str(university["_id"]), result_list)
                if not force_reload and not ignore_nonexist:
                    abort(40400, self.logger.warning("Non-exist university:", filter(lambda university_id: university_id not in found_list, university_id_or_list), exc_info=False))
                elif ignore_nonexist:
                    self.logger.warning("Non-exist university:", filter(lambda university_id: university_id not in found_list, university_id_or_list), exc_info=False)

            result = {university["id"]: _format_each(university) for university in result_list}
            return result

        else:
            with f_app.mongo() as m:
                result = self.university.get_database(m).find_one({"_id": ObjectId(university_id_or_list), "status": {"$ne": "deleted"}})

                if result is None:
                    if not force_reload and not ignore_nonexist:
                        abort(40400, self.logger.warning("Non-exist university:", university_id_or_list, exc_info=False))
                    elif ignore_nonexist:
                        self.logger.warning("Non-exist university:", university_id_or_list, exc_info=False)

                    return None

            return _format_each(result)

    def university_get_by_hesa_id(self, hesa_id):
        return self.university.search({"hesa_id": hesa_id})

    def university_update(self, university_id, params):
        with f_app.mongo() as m:
            self.university.get_database(m).update(
                {"_id": ObjectId(university_id)},
                params,
            )
        university = self.university.get(university_id, force_reload=True)
        return university

    def university_update_set(self, university_id, params):
        return self.university.update(university_id, {"$set": params})

    def university_import(self, filename, country="GB"):
        with open(filename) as f:
            rows = csv.reader(f.readlines())
            count = 0
            with f_app.mongo() as m:
                self.university.get_database(m).create_index([("hesa_id", ASCENDING)])
                self.university.get_database(m).create_index([("postcode", ASCENDING)])
                self.university.get_database(m).create_index([("country", ASCENDING)])

                for r in rows:
                    params = {
                        "hesa_id": r[0],
                        "hep": r[1],
                        "ukprn": r[2],
                        "name": r[3],
                        "phone": r[4],
                        "postcode": r[5],
                        "postcode_index": r[5].replace(" ", ""),
                        "country": country,
                        "status": "new",
                    }

                    self.university.get_database(m).update({
                        "hesa_id": params["hesa_id"],
                    }, {"$set": params}, upsert=True)

                    count += 1
                    if count % 100 == 1:
                        self.logger.debug("hesa university imported", count, "records...")

    def university_search(self, params, per_page=0):
        return f_app.mongo_index.search(self.university.get_database, params, notime=True, sort_field="population", count=False, per_page=per_page)["content"]

f_hesa()


class f_main_mixed_index(f_app.plugin_base):
    main_mixed_index_database = "main_mixed_index"

    def __init__(self, *args, **kwargs):
        f_app.module_install("main_mixed_index", self)

    def get_database(self, m):
        return getattr(m, self.main_mixed_index_database)

    @f_cache("main_mixed_index", support_multi=True)
    def get(self, main_mixed_index_id_or_list, force_reload=False, ignore_nonexist=False):
        def _format_each(main_mixed_index):
            main_mixed_index.pop("loc", None)
            main_mixed_index.pop("index", None)
            main_mixed_index.pop("suggestion_index", None)
            return f_app.util.process_objectid(main_mixed_index)

        if f_app.util.batch_iterable(main_mixed_index_id_or_list):
            with f_app.mongo() as m:
                result_list = list(self.get_database(m).find({"_id": {"$in": map(ObjectId, main_mixed_index_id_or_list)}, "status": {"$ne": "deleted"}}))

            if len(result_list) < len(main_mixed_index_id_or_list):
                found_list = map(lambda main_mixed_index: str(main_mixed_index["_id"]), result_list)
                if not force_reload and not ignore_nonexist:
                    abort(40400, self.logger.warning("Non-exist main_mixed_index:", filter(lambda main_mixed_index_id: main_mixed_index_id not in found_list, main_mixed_index_id_or_list), exc_info=False))
                elif ignore_nonexist:
                    self.logger.warning("Non-exist main_mixed_index:", filter(lambda main_mixed_index_id: main_mixed_index_id not in found_list, main_mixed_index_id_or_list), exc_info=False)

            result = {main_mixed_index["id"]: _format_each(main_mixed_index) for main_mixed_index in result_list}
            return result

        else:
            with f_app.mongo() as m:
                result = self.get_database(m).find_one({"_id": ObjectId(main_mixed_index_id_or_list), "status": {"$ne": "deleted"}})

                if result is None:
                    if not force_reload and not ignore_nonexist:
                        abort(40400, self.logger.warning("Non-exist main_mixed_index:", main_mixed_index_id_or_list, exc_info=False))
                    elif ignore_nonexist:
                        self.logger.warning("Non-exist main_mixed_index:", main_mixed_index_id_or_list, exc_info=False)

                    return None

            return _format_each(result)

    def search(self, params, per_page=0):
        if "suggestion" in params:
            sort = "Levenshtein"
            sort_field = "name"
        else:
            # TODO
            sort = "desc"
            sort_field = "time"
        return f_app.mongo_index.search(self.get_database, params, notime=True, sort=sort, sort_field=sort_field, count=False, per_page=per_page)["content"]

    def get_nearby(self, params, output=True):
        latitude = params.pop("latitude")
        longitude = params.pop("longitude")
        search_range = params.pop("search_range")

        search_command = SON([
            ('geoNear', self.main_mixed_index_database),
            ('near', [float(longitude), float(latitude)]),
            ('maxDistance', search_range * 1.0 / f_app.common.earth_radius),
            ('spherical', True),
            ('query', params),
            ('num', 20),
        ])

        with f_app.mongo() as m:
            tmp_result = m.command(search_command)["results"]

        result = []
        index_id_list = map(lambda item: str(item["obj"]["_id"]), tmp_result)

        if not output:
            return index_id_list

        index_dict = self.get(index_id_list, multi_return=dict)

        for tmp_index in tmp_result:

            distance = tmp_index["dis"] * f_app.common.earth_radius
            index = index_dict.get(str(tmp_index["obj"].pop("_id")))
            index["distance"] = distance
            index.pop("id")

            result.append(index)

        return result

    def build_maponics_neighborhood(self):
        processed = 0
        with f_app.mongo() as m:
            self.get_database(m).create_index([("loc", GEO2D)])
            for neighborhood in f_app.maponics.neighborhood.get_database(m).find({"status": {"$ne": "deleted"}}):
                self.get_database(m).update({"maponics_neighborhood": neighborhood["_id"]}, {
                    "maponics_neighborhood": neighborhood["_id"],
                    "name": neighborhood["name"],
                    "latitude": neighborhood["latitude"],
                    "longitude": neighborhood["longitude"],
                    "loc": neighborhood["loc"],
                }, upsert=True)
                index_id = self.get_database(m).find_one({"maponics_neighborhood": neighborhood["_id"]})["_id"]
                f_app.mongo_index.update(self.get_database, str(index_id), neighborhood["name"], enable_suggestion=True)
                processed += 1

                if processed % 100 == 0:
                    self.logger.info("neighborhood", processed, "processed.")

    def build_hesa_university(self, type_enum):
        processed = 0
        with f_app.mongo() as m:
            self.get_database(m).create_index([("loc", GEO2D)])
            for university in f_app.hesa.university.get_database(m).find({"status": {"$ne": "deleted"}}):
                try:
                    postcode = f_app.geonames.postcode.get(f_app.geonames.postcode.search({"postcode": university["postcode"]}, per_page=-1))[0]
                except:
                    self.logger.warning("cannot lookup postcode for university", str(university["_id"]), ":", university["postcode"])
                    continue
                self.get_database(m).update({"hesa_university": university["_id"]}, {
                    "hesa_university": university["_id"],
                    "name": university["name"],
                    "latitude": postcode["latitude"],
                    "longitude": postcode["longitude"],
                    "loc": [float(postcode["longitude"]), float(postcode["latitude"])],
                    "type": {
                        "_id": ObjectId(type_enum),
                        "type": "featured_facility_type",
                        "_enum": "featured_facility_type",
                    },
                }, upsert=True)
                index_id = self.get_database(m).find_one({"hesa_university": university["_id"]})["_id"]
                f_app.mongo_index.update(self.get_database, str(index_id), university["name"].replace(",", " "), enable_suggestion=True)
                processed += 1

                if processed % 100 == 0:
                    self.logger.info("university", processed, "processed.")

    def build_doogal_station(self, type_enum):
        processed = 0
        with f_app.mongo() as m:
            self.get_database(m).create_index([("loc", GEO2D)])
            for station in f_app.doogal.station.get_database(m).find({"status": {"$ne": "deleted"}}):
                self.get_database(m).update({"doogal_station": station["_id"]}, {
                    "doogal_station": station["_id"],
                    "name": station["name"],
                    "latitude": station["latitude"],
                    "longitude": station["longitude"],
                    "loc": station["loc"],
                    "type": {
                        "_id": ObjectId(type_enum),
                        "type": "featured_facility_type",
                        "_enum": "featured_facility_type",
                    },
                }, upsert=True)
                index_id = self.get_database(m).find_one({"doogal_station": station["_id"]})["_id"]
                f_app.mongo_index.update(self.get_database, str(index_id), station["name"], enable_suggestion=True)
                processed += 1

                if processed % 100 == 0:
                    self.logger.info("station", processed, "processed.")

    def build_geonames_gazetteer(self, identifier, params):
        params.setdefault("feature_code", identifier)
        params.setdefault("status", {"$ne": "deleted"})
        if params.get("feature_code") == "city":
            params["feature_code"] = {"$in": ["PPLC", "PPLA", "PPLA2"]}

        processed = 0
        with f_app.mongo() as m:
            self.get_database(m).create_index([("loc", GEO2D)])
            for gazetteer in f_app.geonames.gazetteer.get_database(m).find(params):
                self.get_database(m).update({identifier: gazetteer["_id"]}, {
                    identifier: gazetteer["_id"],
                    "name": gazetteer["name"],
                    "latitude": gazetteer["latitude"],
                    "longitude": gazetteer["longitude"],
                    "loc": gazetteer["loc"],
                }, upsert=True)
                index_id = self.get_database(m).find_one({identifier: gazetteer["_id"]})["_id"]
                f_app.mongo_index.update(self.get_database, str(index_id), gazetteer["name"], enable_suggestion=True)
                processed += 1

                if processed % 100 == 0:
                    self.logger.info("gazetteer", processed, "processed.")

f_main_mixed_index()
