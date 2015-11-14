//
//  BFCancellationTokenSourceCollector.swift
//  currant
//
//  Created by Foster Yin on 11/13/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import UIKit

/// 由于cancellable 设置和，和触发都跟界面跳转有关，不一定这里的逻辑不是统一的，不能只是都简单的放到viewWillDisappear里面去cancel所有request
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
