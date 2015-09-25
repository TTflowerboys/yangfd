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

    static func patch() throws -> BFTask {
        JPEngine.startEngine()
        let tcs = BFTaskCompletionSource()

        let resPrefix = NSBundle.mainBundle().objectForInfoDictionaryKey("CurrantiOSResourcesPath") as! String
        let version = NSBundle.mainBundle().objectForInfoDictionaryKey("CFBundleShortVersionString") as! String
        let URLString = resPrefix + version + ".jspatch"
        let request = NSURLRequest(URL: NSURL(string: URLString)!)
        var resp:NSURLResponse?

        var data:NSData? = nil

        try data = NSURLConnection.sendSynchronousRequest(request, returningResponse: &resp)

        if data != nil {
            if let response = resp as? NSHTTPURLResponse {
                if response.statusCode == 200 {
                    let patchContent = NSString(data:data!, encoding:CFStringConvertEncodingToNSStringEncoding(CFStringConvertIANACharSetNameToEncoding(response.textEncodingName))) as! String
                    JPEngine.evaluateScript(patchContent)
                    //save to file

                    //save lastmodified date

                }
                else if response.statusCode == 304 {
                    //read local file
                }
            }
        }


        return tcs.task
    }
}