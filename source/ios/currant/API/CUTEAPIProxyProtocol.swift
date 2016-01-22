//
//  CUTEAPIProtocol.swift
//  currant
//
//  Created by Foster Yin on 11/6/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import Foundation

//Same with CUTEAPIManager export API

@objc(CUTEAPIProxyProtocol)
protocol CUTEAPIProxyProtocol : NSObjectProtocol {

    var restClient:BBTRestClient {get set}

    func method(method: String!, URLString: String!, parameters: [String : AnyObject]!, resultClass: AnyClass!, resultKeyPath keyPath: String!, cancellationToken: BFCancellationToken?) -> BFTask!
}