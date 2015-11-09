//
//  CUTESurroundingUpdateDelegate.swift
//  currant
//
//  Created by Foster Yin on 10/31/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import Foundation

@objc(CUTESurroundingUpdateDelegate) protocol CUTESurroundingUpdateDelegate : NSObjectProtocol {

    func onDidAddSurrounding(surrounding:CUTESurrounding, atIndex index:Int)

    func onDidRemoveSurrouding(surrounding:CUTESurrounding, atIndex index:Int)

    func onDidModifySurrouding(surrounding:CUTESurrounding, atIndex index:Int)
}
