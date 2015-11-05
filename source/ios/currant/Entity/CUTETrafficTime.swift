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
    var time:CUTETimePeriod?
    //TODO need replace all model implementation by objc
    var isDefault:Bool = false // 不赋值会产生issues https://github.com/Mantle/Mantle/issues/421


    static func JSONKeyPathsByPropertyKey() -> [NSObject : AnyObject]! {
        return ["type":"type", "time":"time", "isDefault":"default"]
    }

    static func typeJSONTransformer() -> NSValueTransformer {
        return NSValueTransformer.mtl_JSONDictionaryTransformerWithModelClass(CUTEEnum)
    }

    static func timeJSONTransformer() -> NSValueTransformer {
        return NSValueTransformer.mtl_JSONDictionaryTransformerWithModelClass(CUTETimePeriod)
    }

    func toParams() -> [String:AnyObject]? {
        guard self.type != nil else {
            return nil
        }

        guard self.time?.toParams() != nil else {
            return nil
        }

//        if self.isDefault == nil {
//            return ["type":self.type!.identifier, "time":self.time!.toParams()]
//        }
//        else {
//
//        }
        return ["type":self.type!.identifier, "time":self.time!.toParams(), "default": self.isDefault]
    }
}
