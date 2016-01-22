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

    init(restClient:BBTRestClient) {
        self.restClient = restClient
        super.init()
    }

    var restClient:BBTRestClient

    static func getModifiedJsonDictionary(jsonDic:[String:AnyObject] ,types:[CUTEEnum]) -> [String:AnyObject] {
        var modifiedJsonDic = [String:AnyObject]()
        for (jsonKey, jsonValue) in jsonDic {
            if jsonKey == "property" {
                if jsonValue is [String:AnyObject] {
                    modifiedJsonDic[jsonKey] = CUTEPropertyAPIProxy.getModifiedJsonDictionary(jsonValue as! [String : AnyObject], types: types)
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

    func getAdaptedResponseObject(responseObject:AnyObject!, jsonData:NSData?, resultClass: AnyClass!, keyPath: String!) -> BFTask! {
        let tcs = BFTaskCompletionSource()


        if responseObject is CUTETicket {

            CUTEAPICacheManager.sharedInstance().getEnumsByType("featured_facility_type", cancellationToken: nil).continueWithSuccessBlock { (task:BFTask!) -> AnyObject! in
                let types = task.result as! [CUTEEnum]
                do {
                    let result = try NSJSONSerialization .JSONObjectWithData(jsonData!, options: NSJSONReadingOptions(rawValue: 0))
                    if let val = result.valueForKeyPath(keyPath) as? [String:AnyObject] {
                        let model = MTLJSONAdapter.modelOfClass(resultClass, fromJSONDictionary:CUTERentTicketAPIProxy.getModifiedJsonDictionary(val, types: types))
                        tcs.setResult(model)
                    }
                }
                catch let error as NSError {
                    print(error)
                }

                return task
            }
        }
        else if responseObject is [CUTETicket] {
            CUTEAPICacheManager.sharedInstance().getEnumsByType("featured_facility_type", cancellationToken: nil).continueWithSuccessBlock { (task:BFTask!) -> AnyObject! in
                let types = task.result as! [CUTEEnum]
                do {
                    let result = try NSJSONSerialization .JSONObjectWithData(jsonData!, options: NSJSONReadingOptions(rawValue: 0))
                    let array = result.valueForKeyPath(keyPath) as! [[String:AnyObject]]
                    let models = array.map({ (dic:[String:AnyObject]) -> CUTETicket in
                        return  MTLJSONAdapter.modelOfClass(resultClass, fromJSONDictionary:CUTERentTicketAPIProxy.getModifiedJsonDictionary(dic, types: types)) as! CUTETicket
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

        let URL = NSURL(string: URLString, relativeToURL:self.restClient.baseURL)
        var absURLString = URLString
        if URL != nil {
            absURLString = URL!.absoluteString
        }

        let request = self.restClient.requestSerializer.requestWithMethod(method, URLString: absURLString, parameters: parameters, error: nil)
        let operation = self.restClient.HTTPRequestOperationWithRequest(request, resultClass: resultClass, resultKeyPath: keyPath, completion: { (operation:AFHTTPRequestOperation!, responseObject:AnyObject!, error:NSError!) -> Void in
            
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
        self.restClient.operationQueue.addOperation(operation)
        return tcs.task
    }

}