//
//  CUTESurrounding.swift
//  currant
//
//  Created by Foster Yin on 10/15/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import UIKit

class CUTESurrounding: MTLModel, MTLJSONSerializing {

    static func JSONKeyPathsByPropertyKey() -> [NSObject : AnyObject]! {
        return ["name":"name", "type":"type"]
    }
}
