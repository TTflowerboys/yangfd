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
    func bind(deviceToken:NSData?) -> BFTask {
        if deviceToken != nil {
            let tokenString = deviceToken!.description.stringByReplacingOccurrencesOfString(" ", withString: "").stringByReplacingOccurrencesOfString("<", withString: "").stringByReplacingOccurrencesOfString(">", withString: "")

            return CUTEAPIManager.sharedInstance().POST("/api/1/user/apns/" + uuid + "/register" + tokenString, parameters: nil, resultClass: nil)
        }
        else {
            return BFTask(error: NSError(domain: "com.bbtechgroup.apns", code: -1, userInfo: [NSLocalizedDescriptionKey: "Device token should exist"]));
        }

    }

    ///Call before logout
    func unbind() -> BFTask {
        return CUTEAPIManager.sharedInstance().POST("/api/1/user/apns/" + uuid + "/unregister", parameters: nil, resultClass: nil)
    }
}
