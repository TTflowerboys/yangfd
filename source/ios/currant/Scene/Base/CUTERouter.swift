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
        let router = HHRouter.shared() as HHRouter
        for (key, value) in mappings! {
            let cls:AnyClass! = NSClassFromString(value)
            router.map(key, toControllerClass: cls)
        }
    }


    func matchController(_ URL:Foundation.URL) -> UIViewController? {

        if (URL as NSURL).isYangfdURL() {
            let key = URL.absoluteString.substring(from: "yangfd://".endIndex)
            return HHRouter.shared().matchController("/" + key)
        }
        else if (URL as NSURL).isHttpOrHttpsURL() {
            let path = URL.path

            if path.hasPrefix("/property-list") {
                return CUTEPropertyListViewController()
            }
            else if path.hasPrefix("/property-to-rent-list") {
                return CUTERentListViewController()
            }

            return CUTEWebViewController()
        }

        return nil
    }
}
