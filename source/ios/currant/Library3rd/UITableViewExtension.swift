//
//  UITableViewExtension.swift
//  currant
//
//  Created by Foster Yin on 11/16/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import Foundation


//http://stackoverflow.com/questions/25770119/ios-8-uitableview-separator-inset-0-not-working

extension UITableViewCell {
    func removeMargins() {

        if self.respondsToSelector("setSeparatorInset:") {
            self.separatorInset = UIEdgeInsetsZero
        }

        if self.respondsToSelector("setPreservesSuperviewLayoutMargins:") {
            if #available(iOS 8.0, *) {
                self.preservesSuperviewLayoutMargins = false
            } else {
                // Fallback on earlier versions
            }
        }

        if self.respondsToSelector("setLayoutMargins:") {
            if #available(iOS 8.0, *) {
                self.layoutMargins = UIEdgeInsetsZero
            } else {
                // Fallback on earlier versions
            }
        }
    }
}

extension UITableView {
    func removeMargins() {
        self.separatorInset = UIEdgeInsetsZero

        if #available(iOS 8.0, *) {
            self.layoutMargins = UIEdgeInsetsZero
            self.preservesSuperviewLayoutMargins = false
        } else {
            // Fallback on earlier versions
        }
        if #available(iOS 9.0, *) {
            self.cellLayoutMarginsFollowReadableWidth = false
        } else {
            // Fallback on earlier versions
        }
    }
}
