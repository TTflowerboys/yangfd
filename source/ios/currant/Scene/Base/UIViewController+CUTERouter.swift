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
//    private struct AssociatedKeys {
//        static var routeParams = "CUTERouteParams"
//    }
//
//    var routeParams:Dictionary<String, String>? {
//        get {
//            return objc_getAssociatedObject(self, &AssociatedKeys.routeParams) as? Dictionary<String, String>
//        }
//
//        set {
//            objc_setAssociatedObject(self, &AssociatedKeys.routeParams, newValue as Dictionary<String, String>?, objc_AssociationPolicy.OBJC_ASSOCIATION_RETAIN_NONATOMIC)
//        }
//    }

    //Make page load all third-party resources
    func setupRoute() -> BFTask {
        return BFTask(result:nil)
    }
}