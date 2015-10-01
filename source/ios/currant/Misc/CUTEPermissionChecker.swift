//
//  CUTEURLUtil.swift
//  currant
//
//  Created by Foster Yin on 10/1/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import Foundation

class CUTEPermissionChecker: NSObject {

    private static let loginRequiredURLs = ["/user", "/user-favorites", "/user-properties"]
    private static let needRefreshContentWhenUserUpdateURLs = ["/", "/requirement"]

    static func isURLLoginRequired(URL:NSURL) -> Bool {
        if let urlPath = URL.path?.stringByReplacingOccurrencesOfString("_", withString: "-") {
            return loginRequiredURLs.contains(urlPath)
        }
        return false
    }

    static func isURLNeedRefreshContentWhenUserUpdate(URL:NSURL) -> Bool {
        if let urlPath = URL.path?.stringByReplacingOccurrencesOfString("_", withString: "-") {
            return needRefreshContentWhenUserUpdateURLs.contains(urlPath)
        }
        return false
    }

    static func redirectedURLWithURL(URL:NSURL) -> NSURL? {
        return NSURL(string: "/signin?from=" + (URL.absoluteString.URLEncode())!, relativeToURL: CUTEConfiguration.hostURL())
    }

    static func URLWithPath(path:String) -> NSURL? {
        if let originalURL = NSURL(string: path, relativeToURL: CUTEConfiguration.hostURL()) {
            if self.isURLLoginRequired(originalURL) && !CUTEDataManager.sharedInstance().isUserLoggedIn() {
                return redirectedURLWithURL(originalURL)
            }
            else {
                return originalURL
            }
        }
        
        return nil
    }

    static func URLWithURL(originalURL:NSURL) -> NSURL? {
        if self.isURLLoginRequired(originalURL) && !CUTEDataManager.sharedInstance().isUserLoggedIn() {
            return redirectedURLWithURL(originalURL)
        }
        else {
            return originalURL
        }
    }

}
