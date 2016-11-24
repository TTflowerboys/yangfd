//
//  CUTEMainMixedIndexAPIProxy.swift
//  currant
//
//  Created by Foster Yin on 11/13/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import UIKit

@objc(CUTEMainMixedIndexAPIProxy) class CUTEMainMixedIndexAPIProxy: NSObject, CUTEAPIProxyProtocol {

    init(restClient:BBTRestClient) {
        self.restClient = restClient
        super.init()
    }

    var restClient:BBTRestClient

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

    func getAdaptedResponseObject(_ responseObject:AnyObject!, jsonData:Data?, resultClass: AnyClass!, keyPath: String!) -> BFTask<AnyObject>! {
        let tcs = BFTaskCompletionSource<AnyObject>()

        if responseObject is [CUTESurrounding] {
            CUTEAPICacheManager.sharedInstance().getEnumsByType("featured_facility_type", cancellationToken: nil).continue({ (task:BFTask!) -> AnyObject! in
                let types = task.result as! [CUTEEnum]
                do {
                    let result = try JSONSerialization .jsonObject(with: jsonData!, options: JSONSerialization.ReadingOptions(rawValue: 0)) as AnyObject
                    let array = result.value(forKeyPath: keyPath) as! [[String:AnyObject]]
                    let models = array.map({ (dic:[String:AnyObject]) -> CUTESurrounding in
                        return  MTLJSONAdapter.model(of: resultClass, fromJSONDictionary:self.getModifiedJsonDictionary(dic, types: types)) as! CUTESurrounding
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
                self.getAdaptedResponseObject(responseObject as AnyObject!, jsonData: operation!.responseData, resultClass: resultClass, keyPath:keyPath).continue(successBlock: { (task:BFTask!) -> AnyObject! in
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
