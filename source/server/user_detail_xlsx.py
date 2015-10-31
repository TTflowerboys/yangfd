# coding: utf-8
from bson.objectid import ObjectId
from app import f_app
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment


def get_data_directly(user, part, deep=None):
    if user is None:
        return
    user_part = user.get(part, None)
    if (user_part is not None) and (deep is not None):
        return user.get(part).get(deep, None)
    return user_part


def get_data_complex(user, target, condition, element):

    '''this func make dict provide get_data_enum to use'''

    dic = {}
    user_id = user.get("id", None)
    target_database = getattr(f_app, target)
    condition.update({"$or": [{"user_id": ObjectId(user_id)},
                              {"creator_user_id": ObjectId(user_id)}]})
    select_item = target_database.get(target_database.search(condition, pre_page=-1))
    element_list = []
    for ticket in select_item:
        element_list.append(ticket.get(element, None))
    dic.update({element: element_list})
    return dic


def get_data_enum(user, enum_name):
    if user is None:
        return
    single = user.get(enum_name, None)
    value_list = []
    if f_app.util.batch_iterable(single):
        for true_single in single:
            enum_id = true_single.get("id", None)
            value = enum_type_list[enum_name].get(enum_id, None)
            value_list.append(value)
    elif single is not None:
        if single.get("id", None):
            value = enum_type_list[enum_name].get(enum_id, None)
            if value is not None:
                value_list.append(value)
    if not f_app.util.batch_iterable(value_list):
        value_list = [value_list]
    value_set = set(value_list)
    value_list = list(value_set)
    return '/'.join(value_list)


def get_count(user, target, condition, element, comp):
    dic = get_data_complex(user, target, condition, element)
    return dic.get(element, None).count(comp)


def get_has_flag(user, target, condition, element, comp):
    dic = get_data_complex(user, target, condition, element)
    return comp in dic.get(element, None)


enum_type = ["user_type", "landlord_type"]
enum_type_list = {}
for enum_singlt_type in enum_type:
    enum_list_subdic = {}
    for enumitem in f_app.i18n.process_i18n(f_app.enum.get_all(enum_singlt_type)):
        enum_list_subdic.update({enumitem["id"]: enumitem["value"]})
    enum_type_list.update({enum_singlt_type: enum_list_subdic})

header = ['用户名', '注册时间', '国家', '用户类型', '单独访问次数', '活跃天数',
          'app下载', '房东类型', '有没有草稿', '发布时间', '地区', '房产查看数',
          '放产量', '单间还是整套', '短租长租', '租金', '分享房产', '已出租时间',
          '求租时间', '预算', '地区', '匹配级别', '查看房产次数', '收藏房产次数',
          '查看房东联系方式的次数', '分享房产', '停留时间最多的页面或rental房产',
          '投资意向时间', '投资预算', '期房还是现房', '几居室', '浏览数量',
          '停留时间最多的页面或sales房产', '跳出的页面']

wb = Workbook()
ws = wb.active

ws.append(header)

for user in f_app.user.get(f_app.user.get_active()):
    user_id = user["_id"]
    ws.append([get_data_directly(user, "nickname"),
               get_data_directly(user, "register_time"),
               get_data_directly(user, "country", "code"),
               get_data_enum(user, "user_type"),
               "",
               "",
               "",
               get_data_enum(get_data_complex(user, "ticket", {"type": "rent"}, "landlord_type"), "landlord_type"),
               get_has_flag(user, "ticket", {"type": "rent"}, "status", "draft"),
               "",
               "",
               "",
               get_count(user, "ticket", {"type": "rent"}, "status", "rent"),
               get_data_enum(get_data_complex(user, "ticket", {"type": "rent"}, "rent_type"), "rent_type"),
               ])

wb.save("user_detail.xlsx")
