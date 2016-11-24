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

    fileprivate static func checkUpdate() -> BFTask<AnyObject> {
        let tcs = BFTaskCompletionSource<AnyObject>()

        let appInfo:[String:AnyObject] = Bundle.main.infoDictionary! as [String : AnyObject]
        let buildNumber = appInfo["CFBundleVersion"] as! String
        let channel = appInfo["CurrantChannel"] as! String
        let releaseVersion = appInfo["CFBundleShortVersionString"] as! String

        let URLString = "/api/1/app/currant/check_update".appendingQueryDictionary(["version":buildNumber,
            "platform": "ios_jspatch",
            "channel": channel,
            "release": releaseVersion,
            ])

        let URL = Foundation.URL(string: URLString!, relativeTo: Foundation.URL(string: "https://" + CUTEConfiguration.host()))
        let task = URLSession.shared.dataTask(with: URL!, completionHandler: { (data, resp, error) -> Void in

            //TODO replace the if cycles to guard
            if let jsonData = data {
                if let response = resp as? HTTPURLResponse {
                    if response.statusCode == 200 {
                        do {
                            let result = try JSONSerialization .jsonObject(with: jsonData, options: JSONSerialization.ReadingOptions(rawValue: 0))
                            if let dic = result as? Dictionary<String, AnyObject> {
                                if dic["ret"] != nil {
                                    if let retNum = dic["ret"] as? NSNumber  {
                                        if retNum.int32Value == 0 {
                                            if let val = dic["val"] {
                                                if let hasUpdate = val["update"] as? NSNumber {
                                                    if hasUpdate.int32Value > 0 {
                                                        if let lastestVersion = val["latest_version"] as? Dictionary<String, AnyObject> {
                                                            if let release = lastestVersion["release"] as? String {
                                                                if releaseVersion == release {
                                                                    if let url = lastestVersion["url"] as? String {
                                                                        tcs.setResult(url as AnyObject!)
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

        }) 
        task.resume()

        return tcs.task
    }

    fileprivate static func downloadPatch() -> BFTask<AnyObject> {
//        let startDate = NSDate()
        let tcs = BFTaskCompletionSource<AnyObject>()

        checkUpdate().continue({ (task:BFTask!) -> AnyObject! in
            if let URLString = task.result as? String {
                if let fileName = URLString.components(separatedBy: "/").last {
                    let libraryPath = NSSearchPathForDirectoriesInDomains(FileManager.SearchPathDirectory.libraryDirectory, FileManager.SearchPathDomainMask.userDomainMask, true).first

                    let filePath = libraryPath! + "/" + fileName
                    if FileManager.default.fileExists(atPath: filePath) {
                        let localData = try? Data(contentsOf: URL(fileURLWithPath: filePath))
                        tcs.setResult(localData as AnyObject)
                    }
                    else {
                        let request = NSMutableURLRequest(url: URL(string: URLString)!)                     
                        let URLTask = URLSession.shared.dataTask(with: request as URLRequest, completionHandler:{(data, resp, error) in
                            if data != nil {
                                if let response = resp as? HTTPURLResponse {
                                    if response.statusCode == 200 {
                                        //save to file
                                        do {
                                            try data?.write(to: URL(fileURLWithPath: filePath), options: NSData.WritingOptions.atomic)
                                        }
                                        catch let error as NSError{
                                            print(error.localizedDescription)
                                        }

                                        tcs.setResult(data as AnyObject)
                                    }
                                }
                            }
                        })

                        URLTask.resume()

                    }
                }
            }
            return task
        })


//        let endDate = NSDate()
//        let duration = endDate.timeIntervalSinceDate(startDate)
//        print(duration)

        return tcs.task
    }

    static func patch() -> BFTask<AnyObject> {
        return downloadPatch().continue({ (task:BFTask!) -> BFTask<AnyObject>! in
            if let data = task.result as? Data {
                if let content = NSString(data: data, encoding: String.Encoding.utf8.rawValue) {
                    DispatchQueue.main.async(execute: {
                        JPEngine.start()
                        JPEngine.evaluateScript(content as String)
                    })
                }
            }
            return task
        })
    }
}
