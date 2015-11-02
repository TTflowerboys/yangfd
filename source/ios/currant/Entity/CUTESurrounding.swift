//
//  CUTESurrounding.swift
//  currant
//
//  Created by Foster Yin on 10/15/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import UIKit

class CUTESurrounding: MTLModel, MTLJSONSerializing {

    var type:CUTEEnum?
    var trafficTimes:[CUTETrafficTime]?
    
    //different type surrounding have different type key and identifier
    var surroundingKey:String?
    var surroundingName:String?
    var surroundingIdentifier:String?

    override init(dictionary dictionaryValue: [NSObject : AnyObject]!, error: ()) throws {
        if let typeDic = dictionaryValue["type"] as? [String: AnyObject] {
            self.surroundingKey = typeDic["slug"] as? String
            if self.surroundingKey != nil {
                if let surroundingValue = dictionaryValue[self.surroundingKey!] as? [String: AnyObject]{
                    self.surroundingIdentifier = surroundingValue["id"] as? String
                    self.surroundingName = surroundingValue["name"] as? String
                }
            }
        }
        try super.init(dictionary: dictionaryValue, error: error)
    }

    override init!() {
        super.init()
    }

    required init!(coder: NSCoder!) {
        fatalError("init(coder:) has not been implemented")
    }

    static func JSONKeyPathsByPropertyKey() -> [NSObject : AnyObject]! {
        return ["type":"type", "trafficTimes":"traffic_time"]
    }

    static func typeJSONTransformer() -> NSValueTransformer {
        return NSValueTransformer.mtl_JSONDictionaryTransformerWithModelClass(CUTEEnum)
    }

    static func trafficTimesJSONTransformer() -> NSValueTransformer {
        return NSValueTransformer.mtl_JSONArrayTransformerWithModelClass(CUTETrafficTime)
    }

    func toParams() -> [String:AnyObject]? {
        return nil;
//        return @[self.surroudingKey:self.surroungingIndentifier];
    }
}
