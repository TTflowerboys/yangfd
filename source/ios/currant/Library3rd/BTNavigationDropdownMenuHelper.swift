//
//  BTNavigationDropdownMenuHelper.swift
//  currant
//
//  Created by Foster Yin on 2/29/16.
//  Copyright © 2016 BBTechgroup. All rights reserved.
//

import Foundation


@objc(BTNavigationDropdownMenuHelper) class BTNavigationDropdownMenuHelper : NSObject {

    //wrapper for to access primitives vas
    //http://stackoverflow.com/questions/26366082/cannot-access-property-of-swift-type-from-objective-c
    static func getMenu(navigationController: UINavigationController?, title:String, items:[String], didSelectItemAtIndexHandler: ((indexPath: Int) -> ())?) -> BTNavigationDropdownMenu {
        let menu = BTNavigationDropdownMenu(navigationController: navigationController, title: title, items: items)
        menu.cellSelectionColor = UIColor(hex6: 0xe63e3c)
        menu.cellSeparatorColor = UIColor(hex6: 0x666666)
        menu.cellBackgroundColor = UIColor(hex6: 0x444444)
        menu.checkMarkImage = nil
        menu.cellTextLabelAlignment = .Center
        menu.didSelectItemAtIndexHandler = didSelectItemAtIndexHandler
        return menu
    }

    static func removeMenu() {
        let window = UIApplication.sharedApplication().keyWindow

        var targetView:UIView?
        for view in (window?.subviews)! {
            for subView in view.subviews {
                if subView.classForCoder.description().hasSuffix("BTTableView") {
                    targetView = view
                    break
                }
            }
        }
        if targetView != nil {
            targetView!.removeFromSuperview()
        }
    }
}