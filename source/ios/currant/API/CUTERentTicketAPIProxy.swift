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

    func getAdaptedResponseObject(_ responseObject:AnyObject!, jsonData:Data?, resultClass: AnyClass!, keyPath: String!) -> BFTask<AnyObject>! {
        let tcs = BFTaskCompletionSource<AnyObject>()


        if responseObject is CUTETicket {

            CUTEAPICacheManager.sharedInstance().getEnumsByType("featured_facility_type", cancellationToken: nil).continue ({ (task:BFTask!) -> AnyObject! in
                let types = task.result as! [CUTEEnum]
                do {
                    let result = try JSONSerialization .jsonObject(with: jsonData!, options: JSONSerialization.ReadingOptions(rawValue: 0)) as AnyObject
                    if let val = result.value(forKeyPath: keyPath) as? [String:AnyObject] {
                        let model = MTLJSONAdapter.model(of: resultClass, fromJSONDictionary:CUTERentTicketAPIProxy.getModifiedJsonDictionary(val, types: types))
                        tcs.setResult(model as AnyObject?)
                    }
                }
                catch let error as NSError {
                    print(error)
                }

                return task
            })
        }
        else if responseObject is [CUTETicket] {
            CUTEAPICacheManager.sharedInstance().getEnumsByType("featured_facility_type", cancellationToken: nil).continue ({ (task:BFTask!) -> AnyObject! in
                let types = task.result as! [CUTEEnum]
                do {
                    let result = try JSONSerialization .jsonObject(with: jsonData!, options: JSONSerialization.ReadingOptions(rawValue: 0)) as AnyObject
                    let array = result.value(forKeyPath: keyPath) as! [[String:AnyObject]]
                    let models = array.map({ (dic:[String:AnyObject]) -> CUTETicket in
                        return  MTLJSONAdapter.model(of: resultClass, fromJSONDictionary:CUTERentTicketAPIProxy.getModifiedJsonDictionary(dic, types: types)) as! CUTETicket
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


    func method(_ method: String!, URLString: String!, parameters: [String : AnyObject]!, resultClass: AnyClass!, resultKeyPath keyPath: String!, cancellationToken: BFCancellationToken?) -> BFTask<AnyObject>! {
        let tcs = BFTaskCompletionSource<AnyObject>()

        let URL = Foundation.URL(string: URLString, relativeTo:self.restClient.baseURL)
        var absURLString = URLString
        if URL != nil {
            absURLString = URL!.absoluteString
        }

        let request = self.restClient.requestSerializer.request(withMethod: method, urlString: absURLString!, parameters: parameters, error: nil)
        let operation = self.restClient.httpRequestOperation(with: request as URLRequest!, resultClass: resultClass, resultKeyPath: keyPath, completion: { (operation:AFHTTPRequestOperation?, responseObject:Any?, error:Error?) -> Void in
            
            //trySetCancelled will cancel this request
            if tcs.task.isCancelled {
                return;
            }

            if error != nil {
                tcs.setError(error!)
            }
            else {
                self.getAdaptedResponseObject(responseObject as AnyObject?, jsonData: operation!.responseData, resultClass: resultClass, keyPath:keyPath).continue(successBlock: { (task:BFTask!) -> AnyObject! in
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
        return tcs.task
    }

}
