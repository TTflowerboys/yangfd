//
//  CUTEPatcher.swift
//  currant
//
//  Created by Foster Yin on 9/25/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import Foundation

//Knwon Issues: Everty time the web resource build will trigger the jspatch file moved, so the may the file content not really change only the file copy to path again
class CUTEPatcher : NSObject {

    static let sharedInstance = CUTEPatcher.init()

    private static func downloadPatch() -> BFTask {
//        let startDate = NSDate()
        let tcs = BFTaskCompletionSource()
        let libraryPath = NSSearchPathForDirectoriesInDomains(NSSearchPathDirectory.LibraryDirectory, NSSearchPathDomainMask.UserDomainMask, true).first

        let resPrefix = NSBundle.mainBundle().objectForInfoDictionaryKey("CurrantiOSResourcesPath") as! String
        let version = NSBundle.mainBundle().objectForInfoDictionaryKey("CFBundleShortVersionString") as! String
        let URLString = resPrefix + version + ".jspatch"

        //http://stackoverflow.com/questions/27048162/ios-send-if-modified-since-header-with-request
        let request = NSMutableURLRequest(URL: NSURL(string: URLString)!, cachePolicy:NSURLRequestCachePolicy.ReloadIgnoringCacheData, timeoutInterval:60.0)

        var lastModifiedDate:String?

        let filePath = libraryPath! + "/" + version + ".jspatch"
        do {

            if NSFileManager.defaultManager().fileExistsAtPath(filePath) {
                let attributes:NSDictionary = try NSFileManager.defaultManager().attributesOfItemAtPath(filePath)
                if let date = attributes.fileModificationDate() {
                    lastModifiedDate = date.RFC1123String()
                }
            }
        }
        catch let error as NSError{
            print(error.localizedDescription)
        }

        if lastModifiedDate != nil {
            request.setValue(lastModifiedDate, forHTTPHeaderField: "If-Modified-Since")
        }

        let task = NSURLSession.sharedSession().dataTaskWithRequest(request, completionHandler: {(let data, let resp, let error) in
            if data != nil {
                if let response = resp as? NSHTTPURLResponse {
                    if response.statusCode == 200 {
                        //save to file
                        do {
                            try data?.writeToFile(filePath, options: NSDataWritingOptions.DataWritingAtomic)
                            if let newLastModified:String = response.allHeaderFields["Last-Modified"] as? String {
                                if  let date = NSDate.dateFromRFC1123(newLastModified) {
                                    let attr:Dictionary<String, AnyObject> = [NSFileModificationDate:date]
                                    try NSFileManager.defaultManager().setAttributes(attr, ofItemAtPath: filePath)
                                }
                            }
                        }
                        catch let error as NSError{
                            print(error.localizedDescription)
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
        })


        task.resume()

//        let endDate = NSDate()
//        let duration = endDate.timeIntervalSinceDate(startDate)
//        print(duration)

        return tcs.task
    }

    static func patch() -> BFTask {
        return downloadPatch().continueWithBlock({ (task:BFTask!) -> BFTask! in
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
                catch let error as NSError {
                    print(error.localizedDescription)
                }
            }
            return task
        })
    }
}