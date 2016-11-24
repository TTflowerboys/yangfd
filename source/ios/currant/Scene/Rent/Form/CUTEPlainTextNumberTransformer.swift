//
//  CUTEPlainTextNumberTransformer.swift
//  currant
//
//  Created by Foster Yin on 10/8/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import UIKit

@objc(CUTEPlainTextNumberTransformer)
class CUTEPlainTextNumberTransformer: ValueTransformer {

    override class func transformedValueClass() -> AnyClass {
        return NSString.self
    }

    override class func allowsReverseTransformation() -> Bool {
        return true
    }

    override func reverseTransformedValue(_ value: Any?) -> Any? {
        if value is String {
            return value
        }
        return nil
    }

    override func transformedValue(_ value: Any?) -> Any? {
        if value is String {
            return value
        }
        return nil
    }
}
