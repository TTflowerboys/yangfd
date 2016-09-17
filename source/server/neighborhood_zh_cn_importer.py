#coding:utf-8

from __future__ import unicode_literals, print_function
import six
from app import f_app

data = """
卡姆登 Camden
    
兰贝斯 Lambeth
南温布尔登   South Wimbledon
雷恩斯公园   Raynes Park
温布尔登    Wimbledon
厄尔斯菲尔德  Earlsfield
图庭  Tooting
普特尼 Putney
巴恩斯 Barnes
巴尔汉姆    Balham
克拉珀姆交汇站 Clapham Junction
巴特西 Battersea
斯托克韦尔   Stockwell
南兰贝斯    South Lambeth
九榆树 Nine Elms
大象堡 Elephant & Castle
兰贝斯 Lambeth
德特福德    Deptford
卡特福德    Catford
南肯辛顿    South Kensington
帕森斯格林   Parson's green
富勒姆 Fulham
伯爵宫 Earl's Court
布里克斯顿   Brixton
威斯敏斯特   Westminster
皮米里科    Pimlico
贝尔格莱维亚区 Belgravia
斯特拉特福   Stratford
科林戴尔    Colindale
圣约翰森林   St John's Wood
磨坊山 Mill Hill
西汉普斯特德  West Hampstead
女王公园    Queen's Park
基尔本 Kilburn
肯特镇 Kentish Town
亨顿  Hendon
布伦特十字   Brent Cross
瑞士小屋    Swiss Cottage
切尔西 Chelsea
波普拉 Poplar
布莱克沃尔   Blackwall
金丝雀码头   Canary Wharf
莱姆豪斯    Limehouse
萨瑟克 Southwark
伯蒙赛 Bermondsey
博罗  Borough
麦尔安德    Mile End
白教堂 Whitechapel
霍洛威 Holloway
南柏孟塞    South Bermondsey
萨里码头    Surrey Quays
肖尔迪奇    Shoreditch
海伊汉姆斯公园 Highams Park
厄普顿公园   Upton Park
达尔斯顿    Dalston
霍本  Holborn
北芬奇利    North Finchley
布莱克西斯   Blackheath
霍恩西 Hornsey
汉普斯特德   Hampstead
西汉姆 West Ham
七姐妹 Seven Sisters
索斯盖特    Southgate
帕尔默斯格林  Palmers Green
麦斯威山    Muswell Hill
埃德蒙顿下区  Lower Edmonton
霍恩西 Hornsey
克劳奇区    Crouch End
斯特拉特福   Stratford
九榆树 Nine Elms
西库姆公园   Westcombe Park
伍德塞德公园  Woodside Park
新索斯盖特  New Southgate
海格特 Highgate
科芬园 Covent Garden
庄园公园    Manor Park
雷顿斯通    Leytonstone
雷敦  Leyton
哈克尼 Hackney
哈克尼 Hackney
福利斯特盖特  Forest Gate
东汉姆 East Ham
克莱普顿    Clapton
清福德 Chingford
贝思纳尔格林  Bethnal Green
鲍区  Bow
布卢姆斯伯里  Bloomsbury
巴尼特 Barnet
费特巷 Fetter Lane
克拉珀姆    Clapham
温布尔顿    Wimbledon
斯坦摩尔    Stanmore
艾奇韦尔    Edgware
伍尔维奇    Woolwich
埃尔特姆    Eltham
哈罗  Harrow
西汉普斯特德  West Hampstead
德特福德    Deptford
哈默史密斯和富勒姆   Hammersmith and Fulham
哈林盖 Haringey
萨里码头    Surrey Docks
罗瑟希德    Rotherithe
伦敦金融城 City of London
珠宝区 Jewellery Quarter
纽汉区 Newham
布罗姆利    Bromley
贝克斯利    Bexley
伊斯灵顿    Islington
索撒尔 Southall
苏豪区 Soho
巴尼特 Barnet
布伦特福德   Brentford
富勒姆 Fulham
罗瑟希德    Rotherhithe
克罗伊登    Croydon
卡姆登 Camden
帕特尼 Putney
亨顿  Hendon
格林威治    Greenwich
皇家码头    The Royal Docks
刘易舍姆    Lewisham
卡特福德    Catford
巴尼特 Barnet
伊斯灵顿    Islington
阿尔德盖特   Aldgate
威斯敏斯特   Westminster
    
肯辛顿 Kensington
滑铁卢 Waterloo
沃平  Wapping
狗岛  Isle of Dogs
"""

en_mapper = {}

for line in data.split("\n"):
    try:
        zh, en = line.split(None, 1)
        assert zh and en
        en_mapper[en] = zh
    except:
        print("Malformed line ignored:", line)

all_neighborhoods = f_app.maponics.neighborhood.get(f_app.maponics.neighborhood.search({"country": "GB"}))

for neighborhood in all_neighborhoods:
    if isinstance(neighborhood["name"], six.string_types) and neighborhood["name"] in en_mapper:
        with f_app.mongo() as m:
            f_app.maponics.neighborhood.get_database(m).update_one({
                "nid": neighborhood["nid"],
            }, {"$set": {"name": {
                "en_GB": neighborhood["name"],
                "zh_Hans_CN": en_mapper[neighborhood["name"]],
                "_i18n": True,
            }}})
        print("Neighborhood", neighborhood["name"], "now has Chinese name:", en_mapper[neighborhood["name"]])
    else:
        print("Neighborhood", neighborhood["name"], "ignored.")
