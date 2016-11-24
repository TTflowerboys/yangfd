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

    init(restClient:BBTRestClient) {
        self.restClient = restClient
        super.init()
    }

    var restClient:BBTRestClient

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

    func getAdaptedResponseObject(_ responseObject:AnyObject!, jsonData:Data?, resultClass: AnyClass!, keyPath: String!) -> BFTask<AnyObject>! {
        let tcs = BFTaskCompletionSource<AnyObject>()


        if responseObject is CUTEProperty {

            CUTEAPICacheManager.sharedInstance().getEnumsByType("featured_facility_type", cancellationToken: nil).continue({ (task:BFTask!) -> AnyObject! in
                let types = task.result as! [CUTEEnum]
                do {
                    let result = try JSONSerialization .jsonObject(with: jsonData!, options: JSONSerialization.ReadingOptions(rawValue: 0)) as AnyObject

                    if let val = result.value(forKeyPath: keyPath) as? [String:AnyObject] {

                        //TODO fix this warning
                        let model = MTLJSONAdapter.model(of: resultClass, fromJSONDictionary:CUTEPropertyAPIProxy.getModifiedJsonDictionary(val, types: types)) as AnyObject

                        tcs.setResult(model)
                    }
                }
                catch let error as NSError {
                    print(error)
                }

                return task
            })
        }
        else if responseObject is [CUTEProperty] {
            CUTEAPICacheManager.sharedInstance().getEnumsByType("featured_facility_type", cancellationToken: nil).continue({ (task:BFTask!) -> AnyObject! in
                let types = task.result as! [CUTEEnum]
                do {
                    let result = try JSONSerialization .jsonObject(with: jsonData!, options: JSONSerialization.ReadingOptions(rawValue: 0)) as AnyObject
                    let array = result.value(forKeyPath: keyPath) as! [[String:AnyObject]]
                    let models = array.map({ (dic:[String:AnyObject]) -> CUTEProperty in
                        return  MTLJSONAdapter.model(of: resultClass, fromJSONDictionary:CUTEPropertyAPIProxy.getModifiedJsonDictionary(dic, types: types)) as! CUTEProperty
                    }) as AnyObject
                    tcs.setResult(models)
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


    func method(_ method: String!, URLString: String!, parameters: [String : AnyObject]!, resultClass: AnyClass!, resultKeyPath keyPath: String!, cancellationToken: BFCancellationToken?) -> BFTask<AnyObject>! {
        let tcs = BFTaskCompletionSource<AnyObject>()
        self.getAdaptedParamters(parameters).continue({ (task:BFTask!) -> AnyObject! in
            let modifiedParamters  = task.result as? [String : AnyObject]

            let URL = Foundation.URL(string: URLString, relativeTo:self.restClient.baseURL)
            var absURLString = URLString
            if URL != nil {
                absURLString = URL!.absoluteString
            }

            let request = self.restClient.requestSerializer.request(withMethod: method, urlString: absURLString!, parameters: modifiedParamters, error: nil)
            let operation = self.restClient.httpRequestOperation(with: request as URLRequest, resultClass: resultClass, resultKeyPath: keyPath, completion: { (operation:AFHTTPRequestOperation?, responseObject:Any?, error:Error?) -> Void in

                //trySetCancelled will cancel this request
                if tcs.task.isCancelled {
                    return;
                }

                if error != nil {
                    tcs.setError(error!)
                }
                else {
                    self.getAdaptedResponseObject(responseObject as AnyObject, jsonData: operation!.responseData, resultClass: resultClass, keyPath:keyPath).continue(successBlock: { (task:BFTask!) -> AnyObject! in
                        tcs.setResult(task.result)
                        return task
                    })
                }
            })

            if cancellationToken != nil {
                cancellationToken!.registerCancellationObserver({ () -> Void in
                    operation!.cancel()
                    tcs.trySetCancelled()
                })
            }
            self.restClient.operationQueue.addOperation(operation!)
            
            return task
        })
        return tcs.task
    }
}
