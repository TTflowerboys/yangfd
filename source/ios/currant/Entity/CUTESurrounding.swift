//
//  CUTESurrounding.swift
//  currant
//
//  Created by Foster Yin on 10/15/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import UIKit

class CUTESurrounding: MTLModel, MTLJSONSerializing {

    var name:String?
    var type:CUTEEnum?
    var trafficTimes:[CUTETrafficTime]?

    static func JSONKeyPathsByPropertyKey() -> [NSObject : AnyObject]! {
        return ["name":"name", "type":"type", "trafficTimes":"traffic_time"]
    }

    static func typeJSONTransformer() -> NSValueTransformer {
        return NSValueTransformer.mtl_JSONDictionaryTransformerWithModelClass(CUTEEnum)
    }

    static func trafficTimesJSONTransformer() -> NSValueTransformer {
        return NSValueTransformer.mtl_JSONArrayTransformerWithModelClass(CUTETrafficTime)
    }
}
