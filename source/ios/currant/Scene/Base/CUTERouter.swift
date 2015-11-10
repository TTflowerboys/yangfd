//
//  CUTERouter.swift
//  currant
//
//  Created by Foster Yin on 9/21/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import Foundation

@objc(CUTERouter)
class CUTERouter : NSObject {

    static let globalRouter = CUTERouter()

    override init() {
        let mappings: Dictionary<String, String>? = CUTEWebConfiguration.sharedInstance().getRoutes()
        let router = HHRouter.shared()
        for (key, value) in mappings! {
            router.map(key, toControllerClass: NSClassFromString(value))
        }
    }


    func matchController(URL:NSURL) -> UIViewController? {

        if URL.isYangfdURL() {
            let key = URL.absoluteString.substringFromIndex("yangfd://".endIndex)
            return HHRouter.shared().matchController("/" + key)
        }
        else if URL.isHttpOrHttpsURL() {
            if let path = URL.path {
                if path.hasPrefix("/property-list") {
                    return CUTEPropertyListViewController()
                }
                else if path.hasPrefix("/property-to-rent-list") {
                    return CUTERentListViewController()
                }
            }

            
            return CUTEWebViewController()
        }

        return nil
    }
}