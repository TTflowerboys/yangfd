//
//  CUTEPatcher.swift
//  currant
//
//  Created by Foster Yin on 9/25/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import Foundation


class CUTEPatcher : NSObject {

    static let sharedInstance = CUTEPatcher.init()

    private static func downloadPatch() throws -> BFTask {
//        let startDate = NSDate()
        let tcs = BFTaskCompletionSource()
        let libraryPath = NSSearchPathForDirectoriesInDomains(NSSearchPathDirectory.LibraryDirectory, NSSearchPathDomainMask.UserDomainMask, true).first

        let resPrefix = NSBundle.mainBundle().objectForInfoDictionaryKey("CurrantiOSResourcesPath") as! String
        let version = NSBundle.mainBundle().objectForInfoDictionaryKey("CFBundleShortVersionString") as! String
        let URLString = resPrefix + version + ".jspatch"
        let request = NSMutableURLRequest(URL: NSURL(string: URLString)!)
        request.timeoutInterval = 10 //10 seconds

        //http://stackoverflow.com/questions/8636754/nsdate-to-rfc-2822-date-format
        let dateFormatter = NSDateFormatter()
        dateFormatter.dateFormat = "EEE, dd MMM yyyy HH:mm:ss Z"
        dateFormatter.timeZone = NSTimeZone(name: "GMT")

        var lastModifiedDate:String?

        let filePath = libraryPath! + "/" + version + ".jspatch"
        if NSFileManager.defaultManager().fileExistsAtPath(filePath) {
            let attributes:NSDictionary = try NSFileManager.defaultManager().attributesOfItemAtPath(filePath)
            if let date = attributes.fileModificationDate() {
                lastModifiedDate = dateFormatter.stringFromDate(date)
            }
        }

        if lastModifiedDate != nil {
            request.setValue(lastModifiedDate, forHTTPHeaderField: "If-Modified-Since")
        }

        var resp:NSURLResponse?

        var data:NSData? = nil

        try data = NSURLConnection.sendSynchronousRequest(request, returningResponse: &resp)

        if data != nil {
            if let response = resp as? NSHTTPURLResponse {
                if response.statusCode == 200 {
                    //save to file
                    try data?.writeToFile(filePath, options: NSDataWritingOptions.DataWritingAtomic)
                    if let newLastModified:String = response.allHeaderFields["Last-Modified"] as? String {
                        if  let date = dateFormatter.dateFromString(newLastModified) {
                            let attr:Dictionary<String, AnyObject> = [NSFileModificationDate:date]
                            try NSFileManager.defaultManager().setAttributes(attr, ofItemAtPath: filePath)
                        }
                    }

                    tcs.setResult(data)
                }
                else if response.statusCode == 304 {
                    //read local file
                    if NSFileManager.defaultManager().fileExistsAtPath(filePath) {
                        let localData = NSData(contentsOfFile: filePath)
                        tcs.setResult(localData)
                    }
                }
            }
        }

//        let endDate = NSDate()

        return tcs.task
    }

    static func patch() throws -> BFTask {
        return try downloadPatch().continueWithBlock({ (task:BFTask!) -> BFTask! in
            if task.result != nil {
                do {
                    JPEngine.startEngine()
                    let data = task.result as! NSData
                    let pass = "OG> t[*['sL;[^R%/" + "1$K!yMLuDc$ou"
                    let decryptedData = try RNDecryptor.decryptData(data, withPassword:pass)
                    if let content = NSString(data: decryptedData, encoding: NSUTF8StringEncoding) {
                        JPEngine.evaluateScript(content as String)
                    }
                }
                catch {

                }
            }
            return task
        })
    }
}