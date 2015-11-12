//
//  CUTEPropertyAPIAdapter.swift
//  currant
//
//  Created by Foster Yin on 11/6/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import UIKit

@objc(CUTEPropertyAPIProxy)
class CUTEPropertyAPIProxy: NSObject, CUTEAPIProxyProtocol {

    private var restClient:BBTRestClient?

    func setRestClient(restClient: BBTRestClient) {
        self.restClient = restClient
    }

    func  getRestClient() -> BBTRestClient {
        return self.restClient!
    }

    //, "hesaUniversity":"hesa_university", "doogalStation":"doogal_station"
    func getAdaptedParamters(parameters: [String: AnyObject]?) -> BFTask! {
        if parameters != nil {
            return CUTEAPICacheManager.sharedInstance().getEnumsByType("featured_facility_type").continueWithSuccessBlock { (task:BFTask!) -> AnyObject! in
                let types = task.result as! [CUTEEnum]

                var params = [String: AnyObject]()
                for (paramKey, paramValue) in parameters! {
                    if paramKey == "featured_facility" {
                        if let featuredFacility = paramValue as? [[String:AnyObject]] {
                            params[paramKey] = featuredFacility.map({ (facilityDictionary:[String:AnyObject]) -> [String:AnyObject] in

                                let typeId = facilityDictionary["type"] as! String
                                let typeKey = types.filter({ (type:CUTEEnum) -> Bool in
                                    return type.identifier == typeId
                                }).first?.slug
                                var dic = [String:AnyObject]()
                                for (key, value) in facilityDictionary {
                                    if key == "id" {
                                        if typeKey != nil {
                                            dic[typeKey!] = value
                                        }
                                    }
                                    else {
                                        dic[key] = value
                                    }
                                }

                                return dic
                            })
                        }
                    }
                    else {
                        params[paramKey] = paramValue
                    }
                }
                
                return BFTask(result: params)
            }
        }
        else {
            return BFTask(result: nil)
        }

    }

    func getModifiedJsonDictionary(jsonDic:[String:AnyObject] ,types:[CUTEEnum]) -> [String:AnyObject] {
        var modifiedJsonDic = [String:AnyObject]()
        for (jsonKey, jsonValue) in jsonDic {
            if jsonKey == "featured_facility" {
                if let featuredFacility = jsonValue as? [[String:AnyObject]] {
                    modifiedJsonDic[jsonKey] = featuredFacility.map({ (facilityDictionary:[String:AnyObject]) -> [String:AnyObject] in
                        let type = facilityDictionary["type"] as! [String:AnyObject]
                        let typeKey = type["slug"] as! String

                        var dic = [String:AnyObject]()
                        for (key, value) in facilityDictionary {
                            if key == typeKey {
                                dic["id"] = value
                            }
                            else {
                                dic[key] = value
                            }
                        }
                        return dic
                    })
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


        if responseObject is CUTEProperty {

            CUTEAPICacheManager.sharedInstance().getEnumsByType("featured_facility_type").continueWithSuccessBlock { (task:BFTask!) -> AnyObject! in
                let types = task.result as! [CUTEEnum]
                do {
                    let result = try NSJSONSerialization .JSONObjectWithData(jsonData!, options: NSJSONReadingOptions(rawValue: 0))
                    if let val = result.valueForKeyPath(keyPath) as? [String:AnyObject] {
                        let model = MTLJSONAdapter.modelOfClass(resultClass, fromJSONDictionary:self.getModifiedJsonDictionary(val, types: types))
                        tcs.setResult(model)
                    }
                }
                catch let error as NSError {
                    print(error)
                }

                return task
            }
        }
        else if responseObject is [CUTEProperty] {
            CUTEAPICacheManager.sharedInstance().getEnumsByType("featured_facility_type").continueWithSuccessBlock { (task:BFTask!) -> AnyObject! in
                let types = task.result as! [CUTEEnum]
                do {
                    let result = try NSJSONSerialization .JSONObjectWithData(jsonData!, options: NSJSONReadingOptions(rawValue: 0))
                    let array = result.valueForKeyPath(keyPath) as! [[String:AnyObject]]
                    let models = array.map({ (dic:[String:AnyObject]) -> CUTEProperty in
                        return  MTLJSONAdapter.modelOfClass(resultClass, fromJSONDictionary:self.getModifiedJsonDictionary(dic, types: types)) as! CUTEProperty
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


    func method(method: String!, URLString: String!, parameters: [String : AnyObject]!, resultClass: AnyClass!, resultKeyPath keyPath: String!, cancellationToken: BFCancellationToken!) -> BFTask! {
        let tcs = BFTaskCompletionSource()
        self.getAdaptedParamters(parameters).continueWithSuccessBlock() { (task:BFTask!) -> AnyObject! in
            let modifiedParamters  = task.result as? [String : AnyObject]

            let request = self.getRestClient().requestSerializer.requestWithMethod(method, URLString: URLString, parameters: modifiedParamters, error: nil)
            let operation = self.getRestClient().HTTPRequestOperationWithRequest(request, resultClass: resultClass, resultKeyPath: keyPath, completion: { (operation:AFHTTPRequestOperation!, responseObject:AnyObject!, error:NSError!) -> Void in
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

            cancellationToken.registerCancellationObserverWithBlock({ () -> Void in
                operation.cancel()
                tcs.trySetCancelled()
            })
            self.getRestClient().operationQueue.addOperation(operation)
            
            return task
        }
        return tcs.task
    }
}
