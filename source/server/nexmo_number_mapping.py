from __future__ import unicode_literals, absolute_import
from datetime import datetime
import random
from bson.objectid import ObjectId
from libfelix.f_common import f_app
from libfelix.f_cache import f_cache
from libfelix.f_interface import abort


class nexmo_number(f_app.module_base):
    nexmo_number_database = "nexmo_number"

    def __init__(self):
        f_app.sms.nexmo.module_install("number", self)

    def get_database(self, m):
        return getattr(m, self.nexmo_number_database)

    @f_cache("nexmo_number")
    def get(self, nexmo_number_id_or_list, force_reload=False, ignore_nonexist=False):
        def _format_each(nexmo_number):
            return f_app.util.process_objectid(nexmo_number)

        if isinstance(nexmo_number_id_or_list, (tuple, list, set)):
            with f_app.mongo() as m:
                result_list = list(self.get_database(m).find({"_id": {"$in": map(ObjectId, nexmo_number_id_or_list)}, "status": {"$ne": "deleted"}}))

            if len(result_list) < len(nexmo_number_id_or_list):
                found_list = map(lambda nexmo_number: str(nexmo_number["_id"]), result_list)
                if not force_reload and not ignore_nonexist:
                    abort(40400, self.logger.warning("Non-exist nexmo_number:", filter(lambda nexmo_number_id: nexmo_number_id not in found_list, nexmo_number_id_or_list), exc_info=False))
                elif ignore_nonexist:
                    self.logger.warning("Non-exist nexmo_number:", filter(lambda nexmo_number_id: nexmo_number_id not in found_list, nexmo_number_id_or_list), exc_info=False)

            result = {nexmo_number["id"]: _format_each(nexmo_number) for nexmo_number in result_list}
            return result

        else:
            with f_app.mongo() as m:
                result = self.get_database(m).find_one({"_id": ObjectId(nexmo_number_id_or_list), "status": {"$ne": "deleted"}})

                if result is None:
                    if not force_reload and not ignore_nonexist:
                        abort(40400, self.logger.warning("Non-exist nexmo_number:", nexmo_number_id_or_list, exc_info=False))
                    elif ignore_nonexist:
                        self.logger.warning("Non-exist nexmo_number:", nexmo_number_id_or_list, exc_info=False)
                    return None

            return _format_each(result)

    def add(self, params):
        assert "country" in params, abort(40000, "country must be present")
        assert "phone" in params, abort(40000, "phone must be present")
        params.setdefault("status", "new")
        params.setdefault("time", datetime.utcnow())

        with f_app.mongo() as m:
            nexmo_number_id = self.get_database(m).insert_one(params).inserted_id

        return str(nexmo_number_id)

    def get_by_number(self, phone):
        with f_app.mongo() as m:
            nexmo_number = self.get_database(m).find_one(
                {"phone": phone, "status": {"$ne": "deleted"}},
                {},
            )

        if nexmo_number is None:
            abort(40400)

        return str(nexmo_number["_id"])

    def get_all(self, country=None):
        params = {"status": {"$ne": "deleted"}}
        if country:
            params["country"] = country
        with f_app.mongo() as m:
            nexmo_numbers = self.get_database(m).find(params, {})

        return map(lambda nexmo_number: str(nexmo_number["_id"]), nexmo_numbers)

    def get_random(self, country=None, exclude=[]):
        all_nexmo_numbers = self.get_all(country)
        for nexmo_number in exclude:
            if nexmo_number in all_nexmo_numbers:
                all_nexmo_numbers.remove(nexmo_number)
        if len(all_nexmo_numbers) < 1:
            abort(40086, "insufficient nexmo numbers")
        return random.choice(all_nexmo_numbers)

    def update(self, nexmo_number_id, params):
        with f_app.mongo() as m:
            self.get_database(m).update_one(
                {"_id": ObjectId(nexmo_number_id)},
                params,
            )
        nexmo_number = self.get(nexmo_number_id, force_reload=True)
        return nexmo_number

    def update_set(self, nexmo_number_id, params):
        return self.update(nexmo_number_id, {"$set": params})

nexmo_number()


class nexmo_number_mapping(f_app.module_base):
    nexmo_number_mapping_database = "nexmo_number_mapping"

    def __init__(self):
        f_app.sms.nexmo.number.module_install("mapping", self)

    def get_database(self, m):
        return getattr(m, self.nexmo_number_mapping_database)

    @f_cache("nexmo_number_mapping")
    def get(self, nexmo_number_mapping_id_or_list, force_reload=False, ignore_nonexist=False):
        def _format_each(nexmo_number_mapping):
            if "loc" in nexmo_number_mapping:
                nexmo_number_mapping["longitude"], nexmo_number_mapping["latitude"] = nexmo_number_mapping.pop("loc")
            return f_app.util.process_objectid(nexmo_number_mapping)

        if isinstance(nexmo_number_mapping_id_or_list, (tuple, list, set)):
            with f_app.mongo() as m:
                result_list = list(self.get_database(m).find({"_id": {"$in": map(ObjectId, nexmo_number_mapping_id_or_list)}, "status": {"$ne": "deleted"}}))

            if len(result_list) < len(nexmo_number_mapping_id_or_list):
                found_list = map(lambda nexmo_number_mapping: str(nexmo_number_mapping["_id"]), result_list)
                if not force_reload and not ignore_nonexist:
                    abort(40400, self.logger.warning("Non-exist nexmo_number_mapping:", filter(lambda nexmo_number_mapping_id: nexmo_number_mapping_id not in found_list, nexmo_number_mapping_id_or_list), exc_info=False))
                elif ignore_nonexist:
                    self.logger.warning("Non-exist nexmo_number_mapping:", filter(lambda nexmo_number_mapping_id: nexmo_number_mapping_id not in found_list, nexmo_number_mapping_id_or_list), exc_info=False)

            result = {nexmo_number_mapping["id"]: _format_each(nexmo_number_mapping) for nexmo_number_mapping in result_list}
            return result

        else:
            with f_app.mongo() as m:
                result = self.get_database(m).find_one({"_id": ObjectId(nexmo_number_mapping_id_or_list), "status": {"$ne": "deleted"}})

                if result is None:
                    if not force_reload and not ignore_nonexist:
                        abort(40400, self.logger.warning("Non-exist nexmo_number_mapping:", nexmo_number_mapping_id_or_list, exc_info=False))
                    elif ignore_nonexist:
                        self.logger.warning("Non-exist nexmo_number_mapping:", nexmo_number_mapping_id_or_list, exc_info=False)
                    return None

            return _format_each(result)

    def add(self, params):
        assert "nexmo_number" in params, abort(40000, "nexmo_number must be present")
        assert "user_id" in params, abort(40000, "user_id must be present")
        for dimension in f_app.common.nexmo_number_mapping_dimensions:
            assert dimension in params, abort(40000, dimension + " must be present")
        if "nexmo_number" in params:
            params["nexmo_number"] = ObjectId(params["nexmo_number"])
        params.setdefault("status", "new")
        params.setdefault("time", datetime.utcnow())

        with f_app.mongo() as m:
            nexmo_number_mapping_id = self.get_database(m).insert_one(params).inserted_id

        return str(nexmo_number_mapping_id)

    def find_or_add(self, params):
        assert "user_id" in params, abort(40000, "user_id must be present")
        for dimension in f_app.common.nexmo_number_mapping_dimensions:
            assert dimension in params, abort(40000, dimension + " must be present")
        params.setdefault("status", {"$ne": "deleted"})

        with f_app.mongo() as m:
            nexmo_number_mapping = self.get_database(m).find_one(params, {})

        if nexmo_number_mapping is None:
            with f_app.mongo() as m:
                existing_mappings = self.get_database(m).find({"user_id": params["user_id"], "status": {"$ne": "deleted"}})
                excluded_numbers = map(lambda mapping: str(mapping["nexmo_number"]), existing_mappings)

            #todo resolve merge conflict
            params["nexmo_number"] = ObjectId(f_app.sms.nexmo.number.get_random(exclude=excluded_numbers))

            params.pop('status')
            return self.add(params)
        else:
            return str(nexmo_number_mapping["_id"])

    def clean(self, params):
        with f_app.mongo() as m:
            self.get_database(m).update_many(params, {"$set": {"status": "deleted"}})

    def reverse_lookup(self, nexmo_number, user_id):
        params = {"nexmo_number": ObjectId(nexmo_number), "user_id": ObjectId(user_id), "status": {"$ne": "deleted"}}

        with f_app.mongo() as m:
            nexmo_number_mapping = self.get_database(m).find_one(params, {})

        if nexmo_number_mapping is not None:
            nexmo_number_mapping = str(nexmo_number_mapping["_id"])

        return nexmo_number_mapping

    def update(self, nexmo_number_mapping_id, params):
        with f_app.mongo() as m:
            self.get_database(m).update_one(
                {"_id": ObjectId(nexmo_number_mapping_id)},
                params,
            )
        nexmo_number_mapping = self.get(nexmo_number_mapping_id, force_reload=True)
        return nexmo_number_mapping

    def update_set(self, nexmo_number_mapping_id, params):
        return self.update(nexmo_number_mapping_id, {"$set": params})

nexmo_number_mapping()
