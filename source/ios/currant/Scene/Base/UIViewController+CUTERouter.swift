//
//  UIViewController+CUTERouter.swift
//  currant
//
//  Created by Foster Yin on 9/8/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import Foundation
import UIKit

extension UIViewController {
    private struct AssociatedKeys {
        static var CUTEPage = "CUTEPage"
        static var CUTEParams = "CUTEParams"
    }

    var CUTEParams:Dictionary<String, String>? {
        get {
            return objc_getAssociatedObject(self, &AssociatedKeys.CUTEParams) as? Dictionary<String, String>
        }

        set {
            objc_setAssociatedObject(self, &AssociatedKeys.CUTEParams, newValue as Dictionary<String, String>?, objc_AssociationPolicy.OBJC_ASSOCIATION_RETAIN_NONATOMIC)
        }
    }


    //TODO this mapping file should md5 check update
    func getCUTEViewControllerClassFromHost(host:String, path: String) -> String? {
        let mappings: Dictionary<String, String>? = CUTEWebConfiguration.sharedInstance().getRoutes()
        let key = host + path
        if  let m = mappings  {
            if m[key] != nil {
                return m[key]!
            }
        }

        return nil
    }

    func openYangfdURL(URL:NSURL) {
        let queryDic:Dictionary<String, String> = URL.queryDictionary() as! Dictionary<String, String>
        let clsName = getCUTEViewControllerClassFromHost(URL.host!, path: URL.path!)
        if (clsName != nil) {
            let cls:AnyClass? = NSClassFromString(clsName!)
            if let viewControllerClass = cls as? UIViewController.Type {

                let controller:UIViewController = viewControllerClass.init()

                if let routableController = controller as? CUTERoutable {
                    controller.CUTEParams = queryDic
                    routableController.setupRoute().continueWithBlock({ (task: BFTask!) -> AnyObject! in
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
                            if (queryDic["modal"] != nil && queryDic["modal"] == "true") {

                                let title = NSLocalizedString("取消", comment:"")
                                controller.navigationItem.leftBarButtonItem = UIBarButtonItem(title: title, style: UIBarButtonItemStyle.Plain, block: { (sender: AnyObject!) -> Void in

                                    controller.dismissViewControllerAnimated(true, completion: { () -> Void in
                                    })
                                })


                                let nav = UINavigationController(rootViewController: controller)
                                self.presentViewController(nav, animated: true, completion: { () -> Void in
                                })                                
                            }
                            else {
                                controller.hidesBottomBarWhenPushed = true;
                                self.navigationController?.pushViewController(controller, animated: true)
                            }
                        }

                        return task;
                    })
                }

            }
        }
    }
}