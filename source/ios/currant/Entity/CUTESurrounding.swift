//
//  CUTESurrounding.swift
//  currant
//
//  Created by Foster Yin on 10/15/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import UIKit

/*
univesity search

{
country: "GB",
hep: "HEI",
hesa_id: "149",
id: "55c4b36e5c71bcc625bd4402",
name: "University College London",
phone: "020 7679 2000",
postcode: "WC1E 6BT",
postcode_index: "WC1E6BT",
status: "new",
ukprn: "10007784"
}

*/

/*
station search

{
currant_country: "GB",
easting: "522192",
geonames_city_id: "555ed0067999ca6e3a311bdc",
id: "56373ba1d79dbbe9ca545d2b",
latitude: 51.381104516868,
longitude: -0.24556092484593,
name: "Worcester Park",
northing: "166133",
zipcode: "KT4 7ND",
zipcode_index: "KT47ND",
zone: "4"
},

*/


class CUTESurrounding: MTLModel, MTLJSONSerializing {

    var identifier:String?
    var name:String?
    var zipcode:String?
    var postcode:String? //TODO tmp use , need remove
    var type:CUTEEnum?
    var trafficTimes:[CUTETrafficTime]?

    static func JSONKeyPathsByPropertyKey() -> [NSObject : AnyObject]! {
        return ["identifier":"id", "name":"name", "zipcode":"zipcode", "postcode": "postcode", "type":"type", "trafficTimes":"traffic_time"]
    }

    static func typeJSONTransformer() -> NSValueTransformer {
        return NSValueTransformer.mtl_JSONDictionaryTransformerWithModelClass(CUTEEnum)
    }

    static func trafficTimesJSONTransformer() -> NSValueTransformer {
        return NSValueTransformer.mtl_JSONArrayTransformerWithModelClass(CUTETrafficTime)
    }

    func toParams() -> [String:AnyObject]? {

        guard self.identifier != nil else {
            return nil
        }

        guard self.type != nil else {
            return nil
        }

        guard self.trafficTimes?.count > 0 else {
            return nil
        }

        guard let trafficTimesParams = self.trafficTimes?.map({ (trafficTime:CUTETrafficTime) -> [String:AnyObject] in
            return trafficTime.toParams()!
        }) else {
            return nil
        }

        return ["id":self.identifier!, "type":self.type!.identifier, "traffic_time":trafficTimesParams]
    }
}
