//
//  BFCancellationTokenSourceCollector.swift
//  currant
//
//  Created by Foster Yin on 11/13/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import UIKit

@objc(BFCancellationTokenSourceCollector) class BFCancellationTokenSourceCollector: NSObject {

    private var tokenSources = [BFCancellationTokenSource]()

    static func collector() -> BFCancellationTokenSourceCollector {
        return BFCancellationTokenSourceCollector()
    }

    func generateCancellationTokenSource() -> BFCancellationTokenSource {
        let cts = BFCancellationTokenSource()
        self.tokenSources.append(cts)
        return cts
    }

    func dropCancellationTokenSource(tcs:BFCancellationTokenSource) {
        if let index = self.tokenSources.indexOf(tcs) {
            self.tokenSources.removeAtIndex(index)
        }
    }

    func cancelAllCancellationTokenSource() {
        for cts in self.tokenSources {
            cts.cancel()
        }
    }
}
