//
//  UINavigationViewController+CUTERouter.swift
//  currant
//
//  Created by Foster Yin on 9/21/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import Foundation
import UIKit

extension UINavigationController {

    private func getControllerScreenName(viewController: UIViewController?) -> String? {
        if viewController != nil {
            if viewController is CUTEWebViewController {
                let webviewController  = viewController as! CUTEWebViewController
                return CUTETracker.sharedInstance().getScreenNameFromObject(webviewController.URL)
            }
            else {
                return CUTETracker.sharedInstance().getScreenNameFromObject(viewController)
            }
        }
        return nil
    }

    private func trackOpenScreen(screenName:String) {
        let currentViewController = self.viewControllers.last
        if let fromScreenName = getControllerScreenName(currentViewController) {
            CUTETracker.sharedInstance().trackEventWithCategory(fromScreenName, action: "press", label: screenName, value: nil)
        }
        else {
            CUTETracker.sharedInstance().trackEventWithCategory("", action: "press", label: screenName, value: nil)
        }

    }

    private func trackOpenURL(url:NSURL?) {
        if  let toURL = url {
            let screenname = CUTETracker.sharedInstance().getScreenNameFromObject(toURL)
            trackOpenScreen(screenname)

            if toURL.path != nil && toURL.path!.hasPrefix("/property-to-rent") {
                let components:[String]? = (toURL.path?.componentsSeparatedByString("/"))
                if components != nil && components!.count >= 3 {
                    let ticketId = components![2]
                    CUTEUsageRecorder.sharedInstance().saveVisitedTicketWithId(ticketId)
                }
            }
        }
    }

    private func checkPreExecuteInternalCommand(URL:NSURL) {
       
    }

    func openRouteWithURL(URL:NSURL) {
        if URL.isHttpOrHttpsURL() {
            openRouteWithWebRequest(NSURLRequest(URL: URL))
        }
        else if URL.isYangfdURL() {
            openRouteWithYangfdURL(URL)
        }
        else if URL.isWebArchiveURL() {


            if let URLString:NSString = URL.queryDictionary()["from"] as? NSString {
                if let archiveURL = URLString.URLDecode() {
                    if let archive: CUTEWebArchive = CUTEWebArchiveManager.sharedInstance().getWebArchiveWithURL(NSURL(string: archiveURL)) {
                        openRouteWithWebArchive(archive)
                    }
                }
            }

        }
        else {
            //
        }
    }

    func openRouteWithWebRequest(URLRequest:NSURLRequest) {
        trackOpenURL(URLRequest.URL!);

        let viewController = CUTERouter.globalRouter.matchController(URLRequest.URL!)
        var webViewController:CUTEWebViewController?
        if (viewController != nil) {
            if  viewController is CUTEWebViewController {
                webViewController = viewController as? CUTEWebViewController
            }
        }

        if webViewController == nil {
            webViewController = CUTEWebViewController()
        }

        webViewController!.URL = URLRequest.URL;

        self.checkPreExecuteInternalCommand(URLRequest.URL!)
        if self.viewControllers.count > 0 {
            webViewController!.hidesBottomBarWhenPushed = true
            self.pushViewController(webViewController!, animated: true)
        }
        else {
            self.viewControllers = [webViewController!]
        }
        webViewController!.loadRequest(URLRequest)
    }

    private func openRouteWithWebArchive(archive:CUTEWebArchive) {
        trackOpenURL(archive.URL!)
        let viewController = CUTERouter.globalRouter.matchController(archive.URL!)
        var webViewController:CUTEWebViewController?

        if (viewController != nil) {
            webViewController = viewController as? CUTEWebViewController
        }

        if webViewController == nil {
            webViewController = CUTEWebViewController()
        }

        webViewController!.URL = archive.URL;
        self.checkPreExecuteInternalCommand(archive.URL)
        if self.viewControllers.count > 0 {
            webViewController!.hidesBottomBarWhenPushed = true
            self.pushViewController(webViewController!, animated: true)
        }
        else {
            self.viewControllers = [webViewController!]
        }
        webViewController!.loadWebArchive(archive)
    }

    private func openRouteWithYangfdURL(URL:NSURL) {
        let queryDic:Dictionary<String, String> = URL.queryDictionary() as! Dictionary<String, String>

        if let controller:UIViewController = CUTERouter.globalRouter.matchController(URL) {
            
            let screenname = CUTETracker.sharedInstance().getScreenNameFromObject(controller)
            trackOpenScreen(screenname)
            //TODO not show
            SVProgressHUD.show()
            controller.setupRoute().continueWithBlock({ (task: BFTask!) -> AnyObject! in
                if (task.error != nil) {
                    SVProgressHUD.showErrorWithError(task.error)
                }
                else if (task.exception != nil) {
                    SVProgressHUD.showErrorWithException(task.exception)
                }
                else if (task.cancelled) {
                    SVProgressHUD.showErrorWithCancellation()
                }
                else {
                    self.checkPreExecuteInternalCommand(URL)
                    if (queryDic["modal"] != nil && queryDic["modal"] == "true") {

                        let title = STR("取消")
                        controller.navigationItem.leftBarButtonItem = UIBarButtonItem(title: title, style: UIBarButtonItemStyle.Plain, block: { (sender: AnyObject!) -> Void in

                            controller.dismissViewControllerAnimated(true, completion: { () -> Void in
                            })
                        })

                        let nav = UINavigationController(rootViewController: controller)
                        self.presentViewController(nav, animated: true, completion: { () -> Void in
                        })
                    }
                    else {

                        if self.viewControllers.count > 0 {
                            controller.hidesBottomBarWhenPushed = true;
                            self.pushViewController(controller, animated: true)
                        }
                        else {
                            self.viewControllers = [controller]
                        }
                    }

                    SVProgressHUD.dismiss()
                }

                return task;
            })
        }
    }
}