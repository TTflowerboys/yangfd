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

    
    override init() {
        super.init()
    }

    var apiManager:CUTEAPIManager!

    //, "hesaUniversity":"hesa_university", "doogalStation":"doogal_station"
    func getAdaptedParamters(_ parameters: [String: AnyObject]?) -> BFTask<AnyObject>! {
        if parameters != nil {

            return CUTEAPICacheManager.sharedInstance().getEnumsByType("featured_facility_type", cancellationToken: nil).continue({ (task:BFTask?) -> Any?! in
                let types = task!.result as! [CUTEEnum]

                var params = [String: AnyObject]()
                for (paramKey, paramValue) in parameters! {
                    if paramKey == "featured_facility" {
                        if let featuredFacility:[[String:AnyObject]] = paramValue as? [[String:AnyObject]] {

                            params[paramKey] = featuredFacility.map({ (facilityDictionary:[String: AnyObject]) -> [String:AnyObject] in
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
                            }) as AnyObject
                        }
                    }
                    else {
                        params[paramKey] = paramValue
                    }
                }


                let result = params as AnyObject
                return BFTask(result: result)
            })
        }
        else {
            return BFTask(result: nil)
        }

    }

    static func getModifiedJsonDictionary(_ jsonDic:[String:AnyObject] ,types:[CUTEEnum]) -> [String:AnyObject] {
        var modifiedJsonDic = [String:AnyObject]()
        for (jsonKey, jsonValue) in jsonDic {
            if jsonKey == "featured_facility" {
                if let featuredFacility = jsonValue as? [[String:AnyObject]] {
                    modifiedJsonDic[jsonKey] = featuredFacility.map({(facilityDictionary:[String:AnyObject]) -> [String:AnyObject] in
                        let type = facilityDictionary["type"] as! [String:AnyObject]
                        let typeKey = type["slug"] as! String

                        var dic = [String:AnyObject]()
                        for (key, value) in facilityDictionary {
                            if key == typeKey {
                                if value is String {
                                    dic["id"] = value
                                }
                                else if let valueDic = value as? [String:AnyObject] {
                                    dic["id"] = valueDic["id"]
                                    dic["name"] = valueDic["name"]

                                    //tricky, hesa_university has postcode but no zipcode
                                    if valueDic["postcode"] != nil {
                                        dic["zipcode"] = valueDic["postcode"]
                                    }
                                    else if valueDic["zipcode"] != nil {
                                        dic["zipcode"] = valueDic["zipcode"]
                                    }

                                    
                                    if valueDic["latitude"] != nil && valueDic["longitude"] != nil {
                                        dic["latitude"] = valueDic["latitude"]
                                        dic["longitude"] = valueDic["longitude"]
                                    }
                                }
                            }
                            else {
                                dic[key] = value
                            }
                        }
                        return dic
                    }) as AnyObject
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


        if responseObject is CUTEProperty {

            CUTEAPICacheManager.sharedInstance().getEnumsByType("featured_facility_type", cancellationToken: nil).continue({ (task:BFTask!) -> AnyObject! in
                let types = task.result as! [CUTEEnum]
                do {
                    let result = jsonData!

                    if let val = result.value(forKeyPath: keyPath) as? [String:AnyObject] {

                        let model = try MTLJSONAdapter.model(of: resultClass, fromJSONDictionary:CUTEPropertyAPIProxy.getModifiedJsonDictionary(val, types: types)) as AnyObject

                        tcs.setResult(model)
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
        else if responseObject is [CUTEProperty] {
            CUTEAPICacheManager.sharedInstance().getEnumsByType("featured_facility_type", cancellationToken: nil).continue({ (task:BFTask!) -> AnyObject! in
                let types = task.result as! [CUTEEnum]
                do {
                    let result = jsonData!
                    let array = result.value(forKeyPath: keyPath) as! [[String:AnyObject]]
                    let models = try array.map({ (dic:[String:AnyObject]) -> CUTEProperty in
                        return  try MTLJSONAdapter.model(of: resultClass, fromJSONDictionary:CUTEPropertyAPIProxy.getModifiedJsonDictionary(dic, types: types)) as! CUTEProperty
                    }) as AnyObject
                    tcs.setResult(models)
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
        self.getAdaptedParamters(parameters as! [String : AnyObject]?).continue({ (task:BFTask!) -> AnyObject! in
            let modifiedParamters  = task.result as? [String : AnyObject]

            let task = self.apiManager.forwardMethod(method, urlString: URLString, parameters: modifiedParamters, resultClass: resultClass, resultKeyPath: keyPath, cancellationToken: cancellationToken).continue({ (task:BFTask!) -> Any? in
                //trySetCancelled will cancel this request
                if tcs.task.isCancelled {
                    return tcs.task
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
            
            return task
        })
        return tcs.task
    }
}
