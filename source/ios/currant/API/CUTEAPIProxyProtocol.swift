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

    func setRestClient(restClient:BBTRestClient) -> Void

    func getRestClient() -> BBTRestClient

    func GET(URLString: String!, parameters: [String : AnyObject]!, resultClass: AnyClass!) -> BFTask!

    func GET(URLString: String!, parameters: [String : AnyObject]!, resultClass: AnyClass!, resultKeyPath keyPath: String!) -> BFTask!

    func POST(URLString: String!, parameters: [String : AnyObject]!, resultClass: AnyClass!) -> BFTask!

    func POST(URLString: String!, parameters: [String : AnyObject]!, resultClass: AnyClass!, resultKeyPath keyPath: String!) -> BFTask!
    
}