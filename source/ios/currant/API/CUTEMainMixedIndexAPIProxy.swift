//
//  CUTEMainMixedIndexAPIProxy.swift
//  currant
//
//  Created by Foster Yin on 11/13/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import UIKit

@objc(CUTEMainMixedIndexAPIProxy) class CUTEMainMixedIndexAPIProxy: NSObject, CUTEAPIProxyProtocol {

    override init() {
        super.init()
    }

    var apiManager:CUTEAPIManager!

    func getModifiedJsonDictionary(_ jsonDic:[String:AnyObject] ,types:[CUTEEnum]) -> [String:AnyObject] {

        let type = jsonDic["type"] as! [String:AnyObject]
        let typeKey = type["slug"] as! String

        //tricky: server has a id but no use for client
        var removeIdDic = jsonDic
        removeIdDic.removeValue(forKey: "id")

        var dic = [String:AnyObject]()
        for (key, value) in removeIdDic {
            if key == typeKey {
                dic["id"] = value
            }
            else {
                dic[key] = value
            }
        }
        return dic
    }

    func getAdaptedResponseObject(_ responseObject:AnyObject!, jsonData:AnyObject?, resultClass: AnyClass!, keyPath: String!) -> BFTask<AnyObject>! {
        let tcs = BFTaskCompletionSource<AnyObject>()

        if responseObject is [CUTESurrounding] {
            CUTEAPICacheManager.sharedInstance().getEnumsByType("featured_facility_type", cancellationToken: nil).continue({ (task:BFTask!) -> AnyObject! in
                let types = task.result as! [CUTEEnum]
                do {
                    let result = jsonData!
                    let array = result.value(forKeyPath: keyPath) as! [[String:AnyObject]]
                    let models = try array.map({ (dic:[String:AnyObject]) -> CUTESurrounding in
                        return try MTLJSONAdapter.model(of: resultClass, fromJSONDictionary:self.getModifiedJsonDictionary(dic, types: types)) as! CUTESurrounding
                    })
                    tcs.setResult(models as AnyObject?)
                }
                catch let error as NSError {
                    print(error)
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
                return tcs.task
            }

            if task.error != nil {
                tcs.setError(task.error!)
            }
            else {
                let resultArray = task.result
                guard ((resultArray as? Array<AnyObject>) != nil), resultArray!.count == 2 else {
                    tcs.setError(NSError(domain: "com.bbtechgroup", code: -1, userInfo: [NSLocalizedDescriptionKey: "Bad Result"]))
                    return nil
                }
                let jsonData = resultArray![0]
                let responseObject = resultArray![1]

                if (jsonData as? NSNull) != nil || (responseObject as? NSNull) != nil {
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
