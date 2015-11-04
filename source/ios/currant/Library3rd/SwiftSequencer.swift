//
//  SwiftSequencer.swift
//  currant
//
//  Created by Foster Yin on 11/4/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import Foundation


class SwiftSequencer {

    typealias SequencerNext = (AnyObject? -> Void)
    typealias SequencerStep = (AnyObject?, SequencerNext) -> Void

    var steps: [SequencerStep]  = []

    func run() {
        runNextStepWithResult(nil)
    }

    func enqueueStep(step: SequencerStep) {
        steps.append(step)
    }

    func dequeueNextStep() -> (SequencerStep) {
        return steps.removeAtIndex(0)
    }

    func runNextStepWithResult(result: AnyObject?) {
        if (steps.count <= 0) {
            return
        }

        let step = dequeueNextStep()
        step(result, { self.runNextStepWithResult($0) })
    }

}