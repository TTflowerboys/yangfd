//
//  CUTEAPNSManager.swift
//  currant
//
//  Created by Foster Yin on 1/11/16.
//  Copyright © 2016 BBTechgroup. All rights reserved.
//

import Foundation


@objc(CUTEAPNSManager)
class CUTEAPNSManager : NSObject {
    static let sharedInstance = CUTEAPNSManager()
    var binded:Bool?
    var deviceToken:Data?
    var uuid:String!

    fileprivate let keyPrefix = "com.bbtechgroup.apns."

    override init() {
        super.init()
        deviceToken = UserDefaults.standard.data(forKey: keyPrefix + "deviceToken")
        uuid = UserDefaults.standard.string(forKey: keyPrefix + "uuid")
        if uuid == nil {
            uuid = UUID().uuidString
            UserDefaults.standard.set(uuid, forKey: keyPrefix + "uuid")
            UserDefaults.standard.synchronize()
        }
    }

    func saveDeviceToken(_ deviceToken:Data) {
        self.deviceToken = deviceToken
        UserDefaults.standard.set(deviceToken, forKey: keyPrefix + "deviceToken")
        UserDefaults.standard.synchronize()
    }

    ///Call after login, and must check deviceToken
    func bind() -> BFTask<AnyObject> {

        if deviceToken != nil {
            let tokenString = deviceToken!.description.replacingOccurrences(of: " ", with: "").replacingOccurrences(of: "<", with: "").replacingOccurrences(of: ">", with: "")

            return CUTEAPIManager.sharedInstance().post("/api/1/user/apns/" + uuid + "/register/" + tokenString, parameters: nil, resultClass: nil)
        }
        else {
            return BFTask(error: NSError(domain: "com.bbtechgroup.apns", code: -1, userInfo: [NSLocalizedDescriptionKey: "Device token should exist"]));
        }

    }

    ///Call before logout
    func unbind(_ cookie:HTTPCookie) -> BFTask<AnyObject> {
        //TODO:
        let tcs = BFTaskCompletionSource<AnyObject>()
        let url = URL(string: "/api/1/user/apns/" + uuid + "/unregister", relativeTo: URL(string: CUTEConfiguration.apiEndpoint()))
        var request:URLRequest? = nil
        do {
            request =  try CUTEAPIManager.sharedInstance().request(withMethod: "POST", urlString: (url?.absoluteString)!, parameters: [:])
            let cookieHeaders = HTTPCookie.requestHeaderFields(with: [cookie])
            let headersDic = NSMutableDictionary()
            if request!.allHTTPHeaderFields != nil {
                headersDic.addEntries(from: request!.allHTTPHeaderFields!)
            }
            headersDic.addEntries(from: cookieHeaders)

            request!.allHTTPHeaderFields =  ((headersDic as NSDictionary) as! Dictionary<String, String>)

        }
        catch let error {
            tcs.setError(error)
        }

        let dataTask = URLSession.shared.dataTask(with: request!, completionHandler: { (data:Data?, response:URLResponse?, error:Error?) -> Void in

            guard let response = response as? HTTPURLResponse, response.statusCode == 200 else {
                tcs.setError(error!)
                return
            }

            do {
                let result = try JSONSerialization .jsonObject(with: data!, options: JSONSerialization.ReadingOptions(rawValue: 0))

                guard let dic = result as? Dictionary<String, AnyObject>, let retNum = dic["ret"] as? NSNumber, retNum.int32Value == 0 else {
                    tcs.setError(NSError(domain: "com.bbtechgroup.apns", code: -1, userInfo: [NSLocalizedDescriptionKey: "Bad Ret code"]))
                    return
                }

                tcs.setResult(data! as AnyObject?)
            }
            catch let error as NSError {
                tcs.setError(error)
            }
        })

        dataTask.resume()
        return tcs.task;

    }
}
