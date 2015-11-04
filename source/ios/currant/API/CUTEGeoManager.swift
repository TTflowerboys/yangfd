//
//  CUTEGeoManager.swift
//  currant
//
//  Created by Foster Yin on 10/30/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import UIKit

class CUTEGeoManager: NSObject {

    static let sharedInstance = CUTEGeoManager()

    static func buildComponentsWithDictionary(dictionary:[String:String]?) -> String? {
        if let dic = dictionary {
            if dic.count > 0 {
                var array = [String]()
                for (key ,value) in dic {
                    let part = key + ":" + value
                    array.append(part)
                }
                return array.joinWithSeparator("|")
            }
        }
        return nil
    }

    private func reverseProxyWithLink(link:String) -> BFTask {
        let tcs = BFTaskCompletionSource()
        let request = NSURLRequest(URL: NSURL(string:"/reverse_proxy?link=" + link.URLEncode(), relativeToURL: CUTEConfiguration.hostURL())!)



        let task = NSURLSession.sharedSession().dataTaskWithRequest(request) { (data:NSData?, response:NSURLResponse?, error:NSError?) -> Void in

            dispatch_async(dispatch_get_main_queue(), { () -> Void in
                let dic = data?.JSONData()
                if error != nil {
                    tcs.setError(error)
                }
                else if dic != nil {
                    tcs.setResult(dic)
                }
                else {
                    if let httpResponse = response as? NSHTTPURLResponse {
                        if httpResponse.statusCode == 500 {
                            tcs.setError(NSError(domain: "Google", code: httpResponse.statusCode, userInfo: [NSLocalizedDescriptionKey:NSLocalizedString("GeoManager/请求失败", comment: "")]))
                        }
                        else {
                            tcs.setError(NSError(domain: "Google", code: httpResponse.statusCode, userInfo: [NSLocalizedDescriptionKey:NSHTTPURLResponse.localizedStringForStatusCode(httpResponse.statusCode)]))
                        }
                    }
                }
            })
        }

        task.resume()

        return tcs.task
    }

    private func requsetReverseGeocodeLocation(location:CLLocation) -> BFTask {
        let tcs = BFTaskCompletionSource()
        let geocoderURLString = "https://maps.googleapis.com/maps/api/geocode/json?latlng=\(location.coordinate.latitude),\(location.coordinate.longitude)&key=\(CUTEConfiguration.googleAPIKey())&language=en"
        reverseProxyWithLink(geocoderURLString).continueWithBlock { (task:BFTask!) -> AnyObject! in
            if let dic = task.result as? [String:AnyObject] {
                if let results = dic["results"] as? [[String:AnyObject]]{
                    if results.count > 0 {
                        let result = results[0]
                        let placemark = CUTEPlacemark.placeMarkWithGoogleResult(result)

                        CUTEAPICacheManager.sharedInstance().getCountriesWithCountryCode(false).continueWithBlock({ (task:BFTask!) -> AnyObject! in
                            if let countries = task.result as? [CUTECountry] {
                                if let country = countries.filter({ (country:CUTECountry) -> Bool in
                                    return country.ISOcountryCode == placemark.country.ISOcountryCode
                                }).first {
                                    CUTEAPICacheManager.sharedInstance().getCitiesByCountry(country).continueWithBlock({ (task:BFTask!) -> AnyObject! in
                                        if let cities = task.result as? [CUTECity] {
                                            if let city = cities.filter({ (city:CUTECity) -> Bool in
                                                return placemark.city.name.lowercaseString.hasPrefix(city.name.lowercaseString)
                                            }).first {
                                                placemark.country = country
                                                placemark.city = city
                                                tcs.setResult(placemark)
                                            }
                                            else {
                                                tcs.setError(NSError(domain: "CUTE", code: -1, userInfo: [NSLocalizedDescriptionKey:NSLocalizedString("GeoManager/请求失败", comment: "")]))
                                            }
                                        }
                                        else {
                                            tcs.setError(task.error)
                                        }

                                        return task
                                    })
                                }
                                else {
                                    tcs.setError(NSError(domain: "CUTE", code: -1, userInfo: [NSLocalizedDescriptionKey:NSLocalizedString("GeoManager/请求失败", comment: "")]))
                                }
                            }
                            else {
                                tcs.setError(task.error)
                            }
                            return task
                        })
                    }
                }
            }
            return task
        }
        return tcs.task
    }

    /// ![](https://www.gstatic.com/images/branding/product/1x/maps_64dp.png)
    ///
    /// 获取[Google Map Geocoding API](https://developers.google.com/maps/documentation/geocoding/intro)的结果
    /// - parameter location: 经纬度
    /// - returns: BFTask
    func reverseGeocodeLocation(location:CLLocation) -> BFTask {
        let tcs = BFTaskCompletionSource()

        //retry 3 times

        let sequencer = Sequencer()

        sequencer.enqueueStep { (result:AnyObject!, completion:(AnyObject -> Void)!
            ) -> Void in
            requsetReverseGeocodeLocation(location).continueWithBlock({ (task:BFTask!) -> AnyObject! in
                if task.result != nil {
                    tcs.setResult(task.result)
                }
                else {
                    CUTETracker.sharedInstance().trackError(task.error)
                    completion(task.error)
                }
                return task
            })
        }

        sequencer.enqueueStep { (result:AnyObject!, completion:(AnyObject -> Void)!
            ) -> Void in
            requsetReverseGeocodeLocation(location).continueWithBlock({ (task:BFTask!) -> AnyObject! in
                if task.result != nil {
                    tcs.setResult(task.result)
                }
                else {
                    CUTETracker.sharedInstance().trackError(task.error)
                    completion(task.error)
                }
                return task
            })
        }

        sequencer.enqueueStep { (result:AnyObject!, completion:(AnyObject -> Void)!
            ) -> Void in
            requsetReverseGeocodeLocation(location).continueWithBlock({ (task:BFTask!) -> AnyObject! in
                if task.result != nil {
                    tcs.setResult(task.result)
                }
                else {
                    CUTETracker.sharedInstance().trackError(task.error)
                    tcs.setError(task.error)
                }
                return task
            })
        }

        sequencer.run()

        return tcs.task
    }

    private func requestGeocodeWithAddress(address:String?, components:String) -> BFTask {
        let tcs = BFTaskCompletionSource()
        var geocoderURLString = "https://maps.googleapis.com/maps/api/geocode/json?key=\(CUTEConfiguration.googleAPIKey())&language=en&components=\(components.URLEncode())"
        if address != nil {
            geocoderURLString += "&addresss=" + address!.URLEncode()
        }

        reverseProxyWithLink(geocoderURLString).continueWithBlock { (task:BFTask!) -> AnyObject! in
            if let dic = task.result as? [String:AnyObject] {
                if let results = dic["results"] as? [[String:AnyObject]] {
                    if results.count > 0 {
                        let result = results[0]
                        let placemark = CUTEPlacemark.placeMarkWithGoogleResult(result)
                        tcs.setResult(placemark)
                    }
                    else {
                        tcs.setError(NSError(domain: "CUTE", code: -1, userInfo: [NSLocalizedDescriptionKey:NSLocalizedString("GeoManager/请求失败", comment: "")]))
                    }
                }
                else {
                    tcs.setError(task.error)
                }
            }
            return task
        }

        return tcs.task
    }

    /// ![](https://www.gstatic.com/images/branding/product/1x/maps_64dp.png)
    ///
    /// 获取[Google Map Geocoding API](https://developers.google.com/maps/documentation/geocoding/intro)的结果
    /// - parameter address: 街区地址
    /// - parameter components: route | locality | administrative_area | postal_code | country
    /// - returns: BFTask
    func geocodeWithAddress(address:String?, components:String) -> BFTask {
        let tcs = BFTaskCompletionSource()

        //retry 3 times

        //TODO fix sequencer completion will crash in swift call back
        let sequencer = Sequencer()

        sequencer.enqueueStep { (result:AnyObject!, completion:(AnyObject -> Void)!
            ) -> Void in
            requestGeocodeWithAddress(address, components: components).continueWithBlock({ (task:BFTask!) -> AnyObject! in
                if task.result != nil {
                    tcs.setResult(task.result)
                }
                else {
                    CUTETracker.sharedInstance().trackError(task.error)
                    completion(task.error)
                }
                return task
            })
        }

        sequencer.enqueueStep { (result:AnyObject!, completion:(AnyObject -> Void)!
            ) -> Void in
            requestGeocodeWithAddress(address, components: components).continueWithBlock({ (task:BFTask!) -> AnyObject! in
                if task.result != nil {
                    tcs.setResult(task.result)
                }
                else {
                    CUTETracker.sharedInstance().trackError(task.error)
                    completion(task.error)
                }
                return task
            })
        }

        sequencer.enqueueStep { (result:AnyObject!, completion:(AnyObject -> Void)!
            ) -> Void in
            requestGeocodeWithAddress(address, components: components).continueWithBlock({ (task:BFTask!) -> AnyObject! in
                if task.result != nil {
                    tcs.setResult(task.result)
                }
                else {
                    CUTETracker.sharedInstance().trackError(task.error)
                    tcs.setError(task.error)
                }
                return task
            })
        }

        sequencer.run()
        
        return tcs.task
    }

    func searchPostcodeIndex(postCodeIndex:String, countryCode:String) -> BFTask {
        return CUTEAPIManager.sharedInstance().POST("/api/1/postcode/search", parameters: ["postcode_index":postCodeIndex, "country":countryCode], resultClass: CUTEPostcodePlace.self)
    }

    func requestCurrentLocation() -> BFTask {
        let tcs = BFTaskCompletionSource()
        INTULocationManager.sharedInstance().requestLocationWithDesiredAccuracy(INTULocationAccuracy.City, timeout: 30, delayUntilAuthorized: true) { (currentLocation:CLLocation!, achievedAccuracy:INTULocationAccuracy, status:INTULocationStatus) -> Void in
            if currentLocation != nil {
                tcs.setResult(currentLocation)
            }
            else {
                if status == INTULocationStatus.TimedOut {
                    tcs.setError(NSError(domain: "INTULocationManager", code: 0, userInfo: [NSLocalizedDescriptionKey:NSLocalizedString("GeoManager/获取当前位置超时", comment: "")]))
                }
                else if status == INTULocationStatus.Error {
                    tcs.setError(NSError(domain: "INTULocationManager", code: 0, userInfo: [NSLocalizedDescriptionKey:NSLocalizedString("GeoManager/获取当前位置失败", comment: "")]))
                }
                else if status == INTULocationStatus.ServicesDenied {
                    tcs.cancel()
                }
                else {
                    tcs.setError(nil)
                }
            }
        }
        
        return tcs.task
    }

    /// ![](https://www.gstatic.com/images/branding/product/1x/maps_64dp.png)
    ///
    /// 获取[Google Distance Matrix API](https://developers.google.com/maps/documentation/distance-matrix/intro)的结果
    /// - parameter origins: 源地点地址的列表
    /// - parameter destinations: 目的地址的列表
    /// - parameter mode: 交通工具的模式，有bicyling, driving, walking, transit, 默认driving
    /// - returns: BFTask
    func searchDistanceMatrixWithOrigins(origins:[String], destinations:[String], mode:String = "driving") -> BFTask {
        let tcs = BFTaskCompletionSource()

        let originsParam = origins.joinWithSeparator("|").URLEncode()
        let destinationsParam = destinations.joinWithSeparator("|").URLEncode()
        let URLString = "https://maps.googleapis.com/maps/api/distancematrix/json?origins=\(originsParam)&destinations=\(destinationsParam)&mode=\(mode)&language=en-GB&key=\(CUTEConfiguration.googleAPIKey())"

        reverseProxyWithLink(URLString).continueWithBlock { (task:BFTask!) -> AnyObject! in
            if let dic = task.result as? [String:AnyObject] {

                do {
                    guard let rows = dic["rows"] as? [[String: AnyObject]] else {
                        throw NSError(domain: "Google", code: -1, userInfo: [NSLocalizedDescriptionKey:"Parse Error" + " " + dic.description])
                    }

                    let trafficTimes = try rows.map({ (dic: [String: AnyObject]) -> [CUTETrafficTime] in
                        guard let elements = dic["elements"] as? [[String: AnyObject]] else {
                            throw NSError(domain: "Google", code: -1, userInfo: [NSLocalizedDescriptionKey:"Parse Error" + " " + dic.description])
                        }

                        let trafficTimes = try elements.map({ (element: [String: AnyObject]) -> CUTETrafficTime in
                            guard let durationDic = element["duration"] as? [String: AnyObject] else {
                                throw NSError(domain: "Google", code: -1, userInfo: [NSLocalizedDescriptionKey:"Parse Error" + " " + element.description])
                            }
                            guard let duration = durationDic["value"] as? Float else {
                                throw NSError(domain: "Google", code: -1, userInfo: [NSLocalizedDescriptionKey:"Parse Error" + " " + durationDic.description])
                            }
                            let timePeriod = CUTETimePeriod(value: duration, unit: "second")
                            let trifficTime = CUTETrafficTime()
                            trifficTime.time = timePeriod
                            let type = CUTEEnum()
                            type.type = mode
                            trifficTime.type = type
                            return trifficTime
                        })
                        return trafficTimes
                    })
                    tcs.setResult(trafficTimes)
                }
                catch let error as NSError {
                    tcs.setError(error)
                }
            }
            else {
                tcs.setError(task.error)
            }
            return task
        }

        return tcs.task
    }

    func searchSurroundingsWithPostcodeIndex(postcodeIndex:String, city:CUTECity, country:CUTECountry) -> BFTask {
        let tcs = BFTaskCompletionSource()
        let sequencer = Sequencer()
        sequencer.enqueueStep { (result:AnyObject!, completion:(AnyObject -> Void)!
            ) -> Void in

            let universityTask = CUTEAPIManager.sharedInstance().POST("/api/1/hesa_university/search", parameters: ["postcode_index":postcodeIndex, "country":country.ISOcountryCode], resultClass: CUTESurrounding.self)
            let stationTask = CUTEAPIManager.sharedInstance().POST("/api/1/doogal_station/search", parameters: ["postcode_index":postcodeIndex, "country":country.ISOcountryCode], resultClass: CUTESurrounding.self)


            BFTask(forCompletionOfAllTasksWithResults: [universityTask, stationTask]).continueWithBlock {[unowned completion](task:BFTask!) -> AnyObject! in
                if let resultArray = task.result as? [[AnyObject]] {
                    let result = Array(resultArray.flatten())
                    completion(result)
                }
                return task;
            }
        }

        sequencer.enqueueStep { (result:AnyObject!, completion:(AnyObject -> Void)!
            ) -> Void in
            if let surroudings:[CUTESurrounding] = result as? [CUTESurrounding] {
                let destinations = surroudings.map({ (surrouding:CUTESurrounding) -> String in
                    return (surrouding.zipcode != nil ? surrouding.zipcode: surrouding.postcode)!
                })
                let byclingTask = self.searchDistanceMatrixWithOrigins([postcodeIndex], destinations: destinations, mode:"bycling")
                let drivingTask = self.searchDistanceMatrixWithOrigins([postcodeIndex], destinations: destinations)
                let walkingTask = self.searchDistanceMatrixWithOrigins([postcodeIndex], destinations: destinations, mode:"walking")

                BFTask(forCompletionOfAllTasksWithResults: [byclingTask, drivingTask, walkingTask]).continueWithBlock { (task:BFTask!) -> AnyObject! in

                    if let taskArray = task.result as? [[CUTETrafficTime]] {
                        if taskArray.count == 3 {
                            let byclingArray = taskArray[0]
                            let drivingArray = taskArray[1]
                            let walkingArray = taskArray[2]

                            guard surroudings.count == byclingArray.count && byclingArray.count == drivingArray.count && byclingArray.count == walkingArray.count else {
                                tcs.setError(NSError(domain: "Google", code: -1, userInfo: [NSLocalizedDescriptionKey:"Result Error"]))
                                return task
                            }

                            for index in Range(start: 0, end: surroudings.count) {
                                let surrouding = surroudings[index]
                                surrouding.trafficTimes = [byclingArray[index], drivingArray[index], walkingArray[index]]
                            }

                            tcs.setResult(surroudings)
                        }
                    }

                    return task;
                }
            }

        }

        sequencer.run()

        return tcs.task
    }
}
