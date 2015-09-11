//
//  UIViewControllerRoutableProtocol.swift
//  currant
//
//  Created by Foster Yin on 9/8/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import Foundation


@objc protocol CUTERoutable {

    //Make page load all third-party resources
    func setupRoute() -> BFTask;
    
}