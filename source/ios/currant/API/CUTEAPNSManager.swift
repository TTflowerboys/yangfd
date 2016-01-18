//
//  CUTEAPNSManager.swift
//  currant
//
//  Created by Foster Yin on 1/11/16.
//  Copyright © 2016 BBTechgroup. All rights reserved.
//

import Foundation


@objc(CUTEAPNSManager)
class CUTEAPNSManager : NSObject {
    static let sharedInstance = CUTEAPNSManager()
    var binded:Bool?
    var deviceToken:NSData?
    var uuid:String!

    private let keyPrefix = "com.bbtechgroup.apns."

    override init() {
        super.init()
        deviceToken = NSUserDefaults.standardUserDefaults().dataForKey(keyPrefix + "deviceToken")
        uuid = NSUserDefaults.standardUserDefaults().stringForKey(keyPrefix + "uuid")
        if uuid == nil {
            uuid = NSUUID().UUIDString
            NSUserDefaults.standardUserDefaults().setObject(uuid, forKey: keyPrefix + "uuid")
            NSUserDefaults.standardUserDefaults().synchronize()
        }
    }

    func saveDeviceToken(deviceToken:NSData) {
        self.deviceToken = deviceToken
        NSUserDefaults.standardUserDefaults().setObject(deviceToken, forKey: keyPrefix + "deviceToken")
        NSUserDefaults.standardUserDefaults().synchronize()
    }

    ///Call after login, and must check deviceToken
    func bind() -> BFTask {

        if deviceToken != nil {
            let tokenString = deviceToken!.description.stringByReplacingOccurrencesOfString(" ", withString: "").stringByReplacingOccurrencesOfString("<", withString: "").stringByReplacingOccurrencesOfString(">", withString: "")

            return CUTEAPIManager.sharedInstance().POST("/api/1/user/apns/" + uuid + "/register/" + tokenString, parameters: nil, resultClass: nil)
        }
        else {
            return BFTask(error: NSError(domain: "com.bbtechgroup.apns", code: -1, userInfo: [NSLocalizedDescriptionKey: "Device token should exist"]));
        }

    }

    ///Call before logout
    func unbind(cookie:NSHTTPCookie) -> BFTask {
        //TODO:
        let tcs = BFTaskCompletionSource()
        let url = NSURL(string: "/api/1/user/apns/" + uuid + "/unregister", relativeToURL: NSURL(string: CUTEConfiguration.apiEndpoint()))
        let request = CUTEAPIManager.sharedInstance().backingManager().requestSerializer.requestWithMethod("POST", URLString: (url?.absoluteString)!, parameters: [], error:nil)
        let cookieHeaders = NSHTTPCookie.requestHeaderFieldsWithCookies([cookie])
        let headersDic = NSMutableDictionary()
        if request.allHTTPHeaderFields != nil {
            headersDic.addEntriesFromDictionary(request.allHTTPHeaderFields!)
        }
        headersDic.addEntriesFromDictionary(cookieHeaders)

        request.allHTTPHeaderFields =  ((headersDic as NSDictionary) as! Dictionary<String, String>)
        let operation = CUTEAPIManager.sharedInstance().backingManager().HTTPRequestOperationWithRequest(request, success: { (operation:AFHTTPRequestOperation, responseObject:AnyObject) -> Void in
            tcs.setResult(responseObject)
            }) { (operation:AFHTTPRequestOperation, error:NSError) -> Void in
                tcs.setError(error)
        }
        CUTEAPIManager.sharedInstance().backingManager().operationQueue.addOperation(operation)
        return tcs.task;

    }
}
