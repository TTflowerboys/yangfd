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



    func openRouteWithURL(_ URL:Foundation.URL) {
        if (URL as NSURL).isHttpOrHttpsURL() {
            openRouteWithWebRequest(URLRequest(url: URL))
        }
        else if (URL as NSURL).isYangfdURL() {
            openRouteWithYangfdURL(URL)
        }
        else if (URL as NSURL).isWebArchiveURL() {


            if let URLString:NSString = (URL as NSURL).queryDictionary()["from"] as? NSString {
                if let archiveURL = URLString.urlDecode() {
                    if let archive: CUTEWebArchive = CUTEWebArchiveManager.sharedInstance().getWebArchive(with: Foundation.URL(string: archiveURL)) {
                        openRouteWithWebArchive(archive)
                    }
                }
            }

        }
        else {
            //
        }
    }

    func openRouteWithWebRequest(_ URLRequest:Foundation.URLRequest) {
        trackOpenURL(URLRequest.url!);

        let viewController = CUTERouter.globalRouter.matchController(URLRequest.url!)
        var webViewController:CUTEWebViewController?
        if (viewController != nil) {
            if  viewController is CUTEWebViewController {
                webViewController = viewController as? CUTEWebViewController
            }
        }

        if webViewController == nil {
            webViewController = CUTEWebViewController()
        }

        webViewController!.url = URLRequest.url;

        self.checkPreExecuteInternalCommand(URLRequest.url!)
        if self.viewControllers.count > 0 {
            webViewController!.hidesBottomBarWhenPushed = true
            self.pushViewController(webViewController!, animated: true)
        }
        else {
            self.viewControllers = [webViewController!]
        }
        webViewController!.load(URLRequest)
    }


    // MARK: - Private

    func openRouteWithWebArchive(_ archive:CUTEWebArchive) {
        trackOpenURL(archive.url!)
        let viewController = CUTERouter.globalRouter.matchController(archive.url!)
        var webViewController:CUTEWebViewController?

        if (viewController != nil) {
            webViewController = viewController as? CUTEWebViewController
        }

        if webViewController == nil {
            webViewController = CUTEWebViewController()
        }

        webViewController!.url = archive.url;
        self.checkPreExecuteInternalCommand(archive.url)
        if self.viewControllers.count > 0 {
            webViewController!.hidesBottomBarWhenPushed = true
            self.pushViewController(webViewController!, animated: true)
        }
        else {
            self.viewControllers = [webViewController!]
        }
        webViewController!.load(archive)
    }

    func openRouteWithYangfdURL(_ URL:Foundation.URL) {
        let queryDic:Dictionary<String, String> = (URL as NSURL).queryDictionary() as! Dictionary<String, String>

        if let controller:UIViewController = CUTERouter.globalRouter.matchController(URL) {
            
            if let screenname = CUTETracker.sharedInstance().getScreenName(from: controller) {
                trackOpenScreen(screenname)
            }
            //TODO not show
            SVProgressHUD.show()
            controller.setupRoute().continue({ (task: BFTask!) -> AnyObject! in
                if (task.error != nil) {
                    SVProgressHUD.showErrorWithError(task.error)
                }
                else if (task.exception != nil) {
                    SVProgressHUD.showError(with: task.exception)
                }
                else if (task.isCancelled) {
                    SVProgressHUD.showErrorWithCancellation()
                }
                else {
                    self.checkPreExecuteInternalCommand(URL)
                    if (queryDic["modal"] != nil && queryDic["modal"] == "true") {

                        let title = STR("取消")
                        controller.navigationItem.leftBarButtonItem = UIBarButtonItem(title: title, style: UIBarButtonItemStyle.plain, block: { (sender: Any) -> Void in

                            controller.dismiss(animated: true, completion: { () -> Void in
                            })
                        })

                        let nav = UINavigationController(rootViewController: controller)
                        self.present(nav, animated: true, completion: { () -> Void in
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

    func getControllerScreenName(_ viewController: UIViewController?) -> String? {
        if viewController != nil {
            if viewController is CUTEWebViewController {
                let webviewController  = viewController as! CUTEWebViewController
                if let url = webviewController.url {
                    return CUTETracker.sharedInstance().getScreenName(from: url)
                }
                else {
                    return CUTETracker.sharedInstance().getScreenName(from: webviewController)
                }
            }
            else {
                return CUTETracker.sharedInstance().getScreenName(from: viewController!)
            }
        }
        return nil
    }

    func trackOpenScreen(_ screenName:String) {
        let currentViewController = self.viewControllers.last
        if let fromScreenName = getControllerScreenName(currentViewController) {
            CUTETracker.sharedInstance().trackEvent(withCategory: fromScreenName, action: "press", label: screenName, value: nil)
        }
        else {
            CUTETracker.sharedInstance().trackEvent(withCategory: "", action: "press", label: screenName, value: nil)
        }

    }

    func trackOpenURL(_ url:URL?) {
        if  let toURL = url {
            if let screenname = CUTETracker.sharedInstance().getScreenName(from: toURL) {
                trackOpenScreen(screenname)
            }

            if toURL.path != nil && toURL.path.hasPrefix("/property-to-rent") {
                let components:[String]? = (toURL.path.components(separatedBy: "/"))
                if components != nil && components!.count >= 3 {
                    let ticketId = components![2]
                    CUTEUsageRecorder.sharedInstance().saveVisitedTicket(withId: ticketId)
                }
            }
        }
    }

    func checkPreExecuteInternalCommand(_ URL:Foundation.URL) {
        
    }
}
