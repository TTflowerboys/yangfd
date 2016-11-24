//
//  CUTEURLUtil.swift
//  currant
//
//  Created by Foster Yin on 10/1/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import Foundation

@objc(CUTEPermissionChecker)
class CUTEPermissionChecker: NSObject {

    fileprivate static let loginRequiredURLs = ["/user", "/user-favorites", "/user-properties"]
    fileprivate static let needRefreshContentWhenUserUpdateURLs = ["/", "/requirement"]

    static func isURLLoginRequired(_ URL:Foundation.URL) -> Bool {
        let urlPath = URL.path.replacingOccurrences(of: "_", with: "-")
        return loginRequiredURLs.contains(urlPath)
    }

    static func isURLNeedRefreshContentWhenUserUpdate(_ URL:Foundation.URL) -> Bool {
        let urlPath = URL.path.replacingOccurrences(of: "_", with: "-")
        return needRefreshContentWhenUserUpdateURLs.contains(urlPath)
    }

    static func redirectedURLWithURL(_ URL:Foundation.URL) -> Foundation.URL? {
        return Foundation.URL(string: "/signin?from=" + (URL.absoluteString.urlEncode())!, relativeTo: CUTEConfiguration.hostURL())
    }

    static func URLWithPath(_ path:String) -> URL? {
        if let originalURL = URL(string: path, relativeTo: CUTEConfiguration.hostURL()) {
            if self.isURLLoginRequired(originalURL) && !CUTEDataManager.sharedInstance().isUserLoggedIn() {
                return redirectedURLWithURL(originalURL)
            }
            else {
                return originalURL
            }
        }
        
        return nil
    }

    static func URLWithURL(_ originalURL:URL) -> URL? {
        if self.isURLLoginRequired(originalURL) && !CUTEDataManager.sharedInstance().isUserLoggedIn() {
            return redirectedURLWithURL(originalURL)
        }
        else {
            return originalURL
        }
    }

}
