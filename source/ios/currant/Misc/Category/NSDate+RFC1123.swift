//
//  NSDate+RFC1123.swift
//  currant
//
//  Created by Foster Yin on 9/30/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//
//  http://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.3.1

import Foundation


extension NSDate {

    static func dateFromRFC1123(dateString:String) -> NSDate? {
        //http://blog.mro.name/2009/08/nsdateformatter-http-header/
        //http://stackoverflow.com/questions/8636754/nsdate-to-rfc-2822-date-format
        let dateFormatter = NSDateFormatter()
        dateFormatter.locale = NSLocale(localeIdentifier: "en_US") //need locale for some iOS 9 verision, will not select correct default locale
        dateFormatter.dateFormat = "EEE, dd MMM yyyy HH:mm:ss Z"
        dateFormatter.timeZone = NSTimeZone(name: "GMT")
        return dateFormatter.dateFromString(dateString)
    }

    func rfc1123String() -> String? {
        let dateFormatter = NSDateFormatter()
        dateFormatter.locale = NSLocale(localeIdentifier: "en_US") //need locale for some iOS 9 verision, will not select correct default locale
        dateFormatter.dateFormat = "EEE, dd MMM yyyy HH:mm:ss Z"
        dateFormatter.timeZone = NSTimeZone(name: "GMT")
        return dateFormatter.stringFromDate(self)
    }
}