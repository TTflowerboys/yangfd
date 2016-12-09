//
//  CUTERentTicketAPIProxy.swift
//  currant
//
//  Created by Foster Yin on 11/24/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import UIKit

@objc(CUTERentTicketAPIProxy)
class CUTERentTicketAPIProxy: NSObject, CUTEAPIProxyProtocol {

    override init() {
        super.init()
    }

    var apiManager:CUTEAPIManager!

    static func getModifiedJsonDictionary(_ jsonDic:[String:AnyObject] ,types:[CUTEEnum]) -> [String:AnyObject] {
        var modifiedJsonDic = [String:AnyObject]()
        for (jsonKey, jsonValue) in jsonDic {
            if jsonKey == "property" {
                if jsonValue is [String:AnyObject] {
                    modifiedJsonDic[jsonKey] = CUTEPropertyAPIProxy.getModifiedJsonDictionary(jsonValue as! [String: AnyObject], types: types) as AnyObject
                }
                else {
                    modifiedJsonDic[jsonKey] = jsonValue
                }
            }
            else {
                modifiedJsonDic[jsonKey] = jsonValue
            }
        }
        return modifiedJsonDic
    }

    func getAdaptedResponseObject(_ responseObject:AnyObject!, jsonData:AnyObject?, resultClass: AnyClass!, keyPath: String!) -> BFTask<AnyObject>! {
        let tcs = BFTaskCompletionSource<AnyObject>()


        if responseObject is CUTETicket {

            CUTEAPICacheManager.sharedInstance().getEnumsByType("featured_facility_type", cancellationToken: nil).continue ({ (task:BFTask!) -> AnyObject! in
                let types = task.result as! [CUTEEnum]
                do {
                    let result = jsonData!
                    if let val = result.value(forKeyPath: keyPath) as? [String:AnyObject] {
                        let model = try MTLJSONAdapter.model(of: resultClass, fromJSONDictionary:CUTERentTicketAPIProxy.getModifiedJsonDictionary(val, types: types))
                        tcs.setResult(model as AnyObject?)
                    }
                    else {
                        tcs.setError(NSError(domain: "CUTE", code: -1, userInfo: [NSLocalizedDescriptionKey:"Parse Error"]))
                    }
                }
                catch let error as NSError {
                    print(error)
                    tcs.setError(error)
                }

                return task
            })
        }
        else if responseObject is [CUTETicket] {
            CUTEAPICacheManager.sharedInstance().getEnumsByType("featured_facility_type", cancellationToken: nil).continue ({ (task:BFTask!) -> AnyObject! in
                let types = task.result as! [CUTEEnum]
                do {
                    let result = jsonData!
                    let array = result.value(forKeyPath: keyPath) as! [[String:AnyObject]]
                    let models = try array.map({ (dic:[String:AnyObject]) -> CUTETicket in
                        return  try MTLJSONAdapter.model(of: resultClass, fromJSONDictionary:CUTERentTicketAPIProxy.getModifiedJsonDictionary(dic, types: types)) as! CUTETicket
                    })
                    tcs.setResult(models as AnyObject?)
                }
                catch let error as NSError {
                    print(error)
                    tcs.setError(error)
                }


                return task
            })
        }
        else {
            tcs.setResult(responseObject)
        }
        return tcs.task
    }

    public func method(_ method: String!, urlString URLString: String!, parameters: [AnyHashable : Any]!, resultClass: AnyClass!, resultKeyPath keyPath: String!, cancellationToken: BFCancellationToken!) -> BFTask<AnyObject>! {

        let tcs = BFTaskCompletionSource<AnyObject>()

        self.apiManager.forwardMethod(method, urlString: URLString, parameters: parameters, resultClass: resultClass, resultKeyPath: keyPath, cancellationToken: cancellationToken).continue({ (task:BFTask!) -> Any? in
            //trySetCancelled will cancel this request
            if tcs.task.isCancelled {
                return nil
            }

            if task.error != nil {
                tcs.setError(task.error!)
            }
            else {
                let result = task.result
                guard (result as? Dictionary<String, AnyObject>) != nil, result!.count == 2 else {
                    tcs.setError(NSError(domain: "com.bbtechgroup", code: -1, userInfo: [NSLocalizedDescriptionKey: "Bad Result"]))
                    return nil
                }
                let jsonData = result!["json"]
                let responseObject = result!["model"]

                if jsonData == nil || responseObject == nil {
                    tcs.setResult(nil)
                    return nil
                }
                self.getAdaptedResponseObject(responseObject as AnyObject!, jsonData: jsonData as AnyObject?, resultClass: resultClass, keyPath:keyPath).continue(successBlock: { (task:BFTask!) -> AnyObject! in
                    tcs.setResult(task.result)
                    return task
                })
            }

            return task
        })

        if cancellationToken != nil {
            cancellationToken!.registerCancellationObserver({ () -> Void in
                tcs.trySetCancelled()
            })
        }

        return tcs.task
    }

}
