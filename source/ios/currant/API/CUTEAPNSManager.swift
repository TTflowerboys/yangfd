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

    override init() {
        super.init()
        //TODO load binded value
    }

    static func udid() -> String! {
        //TODO choose a UDID generator
        return "";
    }

    var binded:Bool?
    var deviceToken:NSData?

    func saveDeviceToken(deviceToken:NSData) {
        self.deviceToken = deviceToken
    }

    ///Call after login
    func bind(deviceToken:NSData) -> BFTask {
        let tokenString = deviceToken.description.stringByReplacingOccurrencesOfString(" ", withString: "").stringByReplacingOccurrencesOfString("<", withString: "").stringByReplacingOccurrencesOfString(">", withString: "")
        let udid = CUTEAPNSManager.udid()
        return CUTEAPIManager.sharedInstance().POST("/api/1/user/apns/" + udid + "/register" + tokenString, parameters: nil, resultClass: nil)
    }

    ///Call before logout
    func unbind() -> BFTask {
        let udid = CUTEAPNSManager.udid()
        return CUTEAPIManager.sharedInstance().POST("/api/1/user/apns/" + udid + "/unregister", parameters: nil, resultClass: nil)
    }
}
