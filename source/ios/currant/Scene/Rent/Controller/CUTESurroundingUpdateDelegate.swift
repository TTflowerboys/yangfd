//
//  CUTESurroundingUpdateDelegate.swift
//  currant
//
//  Created by Foster Yin on 10/31/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import Foundation

@objc(CUTESurroundingUpdateDelegate) protocol CUTESurroundingUpdateDelegate : NSObjectProtocol {

    func onDidAddSurrounding(surrounding:CUTESurrounding, atIndex index:UInt)

    func onDidRemoveSurrouding(surrouding:CUTESurrounding, atIndex index:UInt)

    func onDidModifySurrouding(surrouding:CUTESurrounding, atIndex index:UInt)
}
