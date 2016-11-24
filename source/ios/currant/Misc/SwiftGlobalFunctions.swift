//
//  SwiftGlobalFunctions.swift
//  currant
//
//  Created by Foster Yin on 11/17/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import Foundation

func STR(_ string:String!) -> String {
    let str = CUTELocalizationSwitcher.sharedInstance().localizedString(forKey: string)
    return str!
}
