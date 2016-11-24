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

        if self.responds(to: #selector(setter: UITableViewCell.separatorInset)) {
            self.separatorInset = UIEdgeInsets.zero
        }

        if #available(iOS 8.0, *) {
            if self.responds(to: #selector(setter: UIView.preservesSuperviewLayoutMargins)) {
                self.preservesSuperviewLayoutMargins = false
            }
            if self.responds(to: #selector(setter: UIView.layoutMargins)) {
                self.layoutMargins = UIEdgeInsets.zero
            }
        }
    }
}

extension UITableView {
    func removeMargins() {
        self.separatorInset = UIEdgeInsets.zero

        if #available(iOS 8.0, *) {
            self.layoutMargins = UIEdgeInsets.zero
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
