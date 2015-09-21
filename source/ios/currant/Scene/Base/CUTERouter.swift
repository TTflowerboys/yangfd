//
//  CUTERouter.swift
//  currant
//
//  Created by Foster Yin on 9/21/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import Foundation

class CUTERouter : NSObject {

    static let globalRouter = CUTERouter()

    override init() {
        let mappings: Dictionary<String, String>? = CUTEWebConfiguration.sharedInstance().getRoutes()
        let router = HHRouter.shared()
        for (key, value) in mappings! {
            router.map(key, toControllerClass: NSClassFromString(value))
        }
    }

    //TODO this mapping file should md5 check update
    func matchController(URL:NSURL) -> UIViewController? {

        if URL.isYangfdURL() {
            let key = URL.absoluteString.substringFromIndex("yangfd://".endIndex)
            return HHRouter.shared().matchController("/" + key)
        }
        else if URL.isHttpOrHttpsURL() {
            return CUTEWebViewController()
        }

        return nil
    }
}