//
//  Playground.swift
//  currant
//
//  Created by Foster Yin on 11/4/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import Foundation

// 写测试代码的地方，调试可以把这个文件加到target上，调试完了请从target里移除
class Playground : NSObject {
    static func play() {

        let sequncer = Sequencer()

        sequncer.enqueueStep { (result:AnyObject!,
            completion:(AnyObject!->Void)!) -> Void in

            dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0), { () -> Void in
                dispatch_async(dispatch_get_main_queue(), { () -> Void in
                    completion("fhjkahf")
                })
            })
        }

        sequncer.run()

    }

    static func playSwift() {
        let sequncer = SwiftSequencer()

        sequncer.enqueueStep {(result:AnyObject?,
            completion:(AnyObject?->Void)) -> Void in


            dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0), { () -> Void in
                dispatch_async(dispatch_get_main_queue(), { () -> Void in
                    completion("haha ok")
                })
            })

        }

        sequncer.run()
    }
}