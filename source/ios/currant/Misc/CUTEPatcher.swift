//
//  CUTEPatcher.swift
//  currant
//
//  Created by Foster Yin on 9/25/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import Foundation

@objc(CUTEPatcher)
class CUTEPatcher : NSObject {

    static let sharedInstance = CUTEPatcher.init()

    private static func checkUpdate() -> BFTask {
        let tcs = BFTaskCompletionSource()

        let appInfo:[String:AnyObject] = NSBundle.mainBundle().infoDictionary!
        let buildNumber = appInfo["CFBundleVersion"] as! String
        let channel = appInfo["CurrantChannel"] as! String
        let releaseVersion = appInfo["CFBundleShortVersionString"] as! String

        let URLString = "/api/1/app/currant/check_update".stringByAppendingQueryDictionary(["version":buildNumber,
            "platform": "ios_jspatch",
            "channel": channel,
            "release": releaseVersion,
            ])

        let URL = NSURL(string: URLString, relativeToURL: NSURL(string: CUTEConfiguration.apiEndpoint()))
        let task = NSURLSession.sharedSession().dataTaskWithURL(URL!) { (data, resp, error) -> Void in
            if let jsonData = data {
                if let response = resp as? NSHTTPURLResponse {
                    if response.statusCode == 200 {
                        do {
                            let result = try NSJSONSerialization .JSONObjectWithData(jsonData, options: NSJSONReadingOptions(rawValue: 0))
                            if let dic = result as? Dictionary<String, AnyObject> {
                                if dic["ret"] != nil {
                                    if let retNum = dic["ret"] as? NSNumber  {
                                        if retNum.intValue == 0 {
                                            if let val = dic["val"] {
                                                if let hasUpdate = val["update"] as? NSNumber {
                                                    if hasUpdate.intValue > 0 {
                                                        if let lastestVersion = val["latest_version"] as? Dictionary<String, AnyObject> {
                                                            if let release = lastestVersion["release"] as? String {
                                                                if releaseVersion == release {
                                                                    if let url = lastestVersion["url"] as? String {
                                                                        tcs.setResult(url)
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        catch let error as NSError {
                            print(error.localizedDescription)
                        }
                    }
                }
            }

        }
        task.resume()

        return tcs.task
    }

    private static func downloadPatch() -> BFTask {
//        let startDate = NSDate()
        let tcs = BFTaskCompletionSource()

        checkUpdate().continueWithSuccessBlock { (task:BFTask!) -> AnyObject! in
            if let URLString = task.result as? String {
                if let fileName = URLString.componentsSeparatedByString("/").last {
                    let libraryPath = NSSearchPathForDirectoriesInDomains(NSSearchPathDirectory.LibraryDirectory, NSSearchPathDomainMask.UserDomainMask, true).first

                    let filePath = libraryPath! + "/" + fileName
                    if NSFileManager.defaultManager().fileExistsAtPath(filePath) {
                        let localData = NSData(contentsOfFile: filePath)
                        tcs.setResult(localData)
                    }
                    else {
                        let request = NSMutableURLRequest(URL: NSURL(string: URLString)!)

                        let URLTask = NSURLSession.sharedSession().dataTaskWithRequest(request, completionHandler: {(let data, let resp, let error) in
                            if data != nil {
                                if let response = resp as? NSHTTPURLResponse {
                                    if response.statusCode == 200 {
                                        //save to file
                                        do {
                                            try data?.writeToFile(filePath, options: NSDataWritingOptions.DataWritingAtomic)
                                        }
                                        catch let error as NSError{
                                            print(error.localizedDescription)
                                        }

                                        tcs.setResult(data)
                                    }
                                }
                            }
                        })

                        URLTask.resume()

                    }
                }
            }
            return task
        }


//        let endDate = NSDate()
//        let duration = endDate.timeIntervalSinceDate(startDate)
//        print(duration)

        return tcs.task
    }

    static func patch() -> BFTask {
        return downloadPatch().continueWithBlock({ (task:BFTask!) -> BFTask! in
            if task.result != nil {
                do {
                    let data = task.result as! NSData
                    let pass = "OG> t[*['sL;[^R%/" + "1$K!yMLuDc$ou"
                    let decryptedData = try RNDecryptor.decryptData(data, withPassword:pass)
                    if let content = NSString(data: decryptedData, encoding: NSUTF8StringEncoding) {
                        dispatch_async(dispatch_get_main_queue(), {
                            JPEngine.startEngine()
                            JPEngine.evaluateScript(content as String)
                        })
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