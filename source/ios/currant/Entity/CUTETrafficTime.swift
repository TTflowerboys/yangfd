//
//  CUTETrafficTIme.swift
//  currant
//
//  Created by Foster Yin on 10/29/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import UIKit

class CUTETrafficTime: MTLModel, MTLJSONSerializing {

    var type:CUTEEnum?
    var time:CUTETimePeriod?;

    static func JSONKeyPathsByPropertyKey() -> [NSObject : AnyObject]! {
        return ["type":"type", "time":"time"]
    }

    static func typeJSONTransformer() -> NSValueTransformer {
        return NSValueTransformer.mtl_JSONDictionaryTransformerWithModelClass(CUTEEnum)
    }

    static func timeJSONTransformer() -> NSValueTransformer {
        return NSValueTransformer.mtl_JSONDictionaryTransformerWithModelClass(CUTETimePeriod)
    }
}
