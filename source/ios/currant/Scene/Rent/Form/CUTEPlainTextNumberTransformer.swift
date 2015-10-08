//
//  CUTEPlainTextNumberTransformer.swift
//  currant
//
//  Created by Foster Yin on 10/8/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import UIKit

class CUTEPlainTextNumberTransformer: NSValueTransformer {

    override class func transformedValueClass() -> AnyClass {
        return NSString.self
    }

    override class func allowsReverseTransformation() -> Bool {
        return true
    }

    override func reverseTransformedValue(value: AnyObject?) -> AnyObject? {
        if value is String {
            return value
        }
        return nil
    }

    override func transformedValue(value: AnyObject?) -> AnyObject? {
        if value is String {
            return value
        }
        return nil
    }
}
