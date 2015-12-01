//
//  CUTEMainMixedIndexAPIProxy.swift
//  currant
//
//  Created by Foster Yin on 11/13/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import UIKit

@objc(CUTEMainMixedIndexAPIProxy) class CUTEMainMixedIndexAPIProxy: NSObject, CUTEAPIProxyProtocol {

    private var restClient:BBTRestClient?

    func setRestClient(restClient: BBTRestClient) {
        self.restClient = restClient
    }

    func  getRestClient() -> BBTRestClient {
        return self.restClient!
    }

    func getModifiedJsonDictionary(jsonDic:[String:AnyObject] ,types:[CUTEEnum]) -> [String:AnyObject] {

        let type = jsonDic["type"] as! [String:AnyObject]
        let typeKey = type["slug"] as! String

        //tricky: server has a id but no use for client
        var removeIdDic = jsonDic
        removeIdDic.removeValueForKey("id")

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

    func getAdaptedResponseObject(responseObject:AnyObject!, jsonData:NSData?, resultClass: AnyClass!, keyPath: String!) -> BFTask! {
        let tcs = BFTaskCompletionSource()

        if responseObject is [CUTESurrounding] {
            CUTEAPICacheManager.sharedInstance().getEnumsByType("featured_facility_type", cancellationToken: nil).continueWithSuccessBlock { (task:BFTask!) -> AnyObject! in
                let types = task.result as! [CUTEEnum]
                do {
                    let result = try NSJSONSerialization .JSONObjectWithData(jsonData!, options: NSJSONReadingOptions(rawValue: 0))
                    let array = result.valueForKeyPath(keyPath) as! [[String:AnyObject]]
                    let models = array.map({ (dic:[String:AnyObject]) -> CUTESurrounding in
                        return  MTLJSONAdapter.modelOfClass(resultClass, fromJSONDictionary:self.getModifiedJsonDictionary(dic, types: types)) as! CUTESurrounding
                    })
                    tcs.setResult(models)
                }
                catch let error as NSError {
                    print(error)
                }
                return task
            }
        }
        else {
            tcs.setResult(responseObject)
        }
        return tcs.task
    }


    func method(method: String!, URLString: String!, parameters: [String : AnyObject]!, resultClass: AnyClass!, resultKeyPath keyPath: String!, cancellationToken: BFCancellationToken?) -> BFTask! {
        let tcs = BFTaskCompletionSource()
        let URL = NSURL(string: URLString, relativeToURL:self.getRestClient().baseURL)
        var absURLString = URLString
        if URL != nil {
            absURLString = URL!.absoluteString
        }
        let request = self.getRestClient().requestSerializer.requestWithMethod(method, URLString: absURLString, parameters: parameters, error: nil)
        let operation = self.getRestClient().HTTPRequestOperationWithRequest(request, resultClass: resultClass, resultKeyPath: keyPath, completion: { (operation:AFHTTPRequestOperation!, responseObject:AnyObject!, error:NSError!) -> Void in

            //trySetCancelled will cancel this request
            if tcs.task.cancelled {
                return;
            }

            if error != nil {
                tcs.setError(error)
            }
            else {
                self.getAdaptedResponseObject(responseObject, jsonData: operation.responseData, resultClass: resultClass, keyPath:keyPath).continueWithSuccessBlock({ (task:BFTask!) -> AnyObject! in
                    tcs.setResult(task.result)
                    return task
                })
            }
        })

        if cancellationToken != nil {
            cancellationToken!.registerCancellationObserverWithBlock({ () -> Void in
                operation.cancel()
                tcs.trySetCancelled()
            })
        }
        self.getRestClient().operationQueue.addOperation(operation)
        return tcs.task
    }


}
