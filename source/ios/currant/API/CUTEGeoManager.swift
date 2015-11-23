//
//  CUTEGeoManager.swift
//  currant
//
//  Created by Foster Yin on 10/30/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import UIKit

@objc(CUTEGeoManager)
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
                            tcs.setError(NSError(domain: "Google", code: httpResponse.statusCode, userInfo: [NSLocalizedDescriptionKey:STR("GeoManager/请求失败")]))
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
                                                tcs.setError(NSError(domain: "CUTE", code: -1, userInfo: [NSLocalizedDescriptionKey:STR("GeoManager/请求失败")]))
                                            }
                                        }
                                        else {
                                            tcs.setError(task.error)
                                        }

                                        return task
                                    })
                                }
                                else {
                                    tcs.setError(NSError(domain: "CUTE", code: -1, userInfo: [NSLocalizedDescriptionKey:STR("GeoManager/请求失败")]))
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

        let sequencer = SwiftSequencer()

        sequencer.enqueueStep { (result:AnyObject?, completion:(AnyObject? -> Void)
            ) -> Void in
            self.requsetReverseGeocodeLocation(location).continueWithBlock({ (task:BFTask!) -> AnyObject! in
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

        sequencer.enqueueStep { (result:AnyObject?, completion:(AnyObject? -> Void)
            ) -> Void in
            self.requsetReverseGeocodeLocation(location).continueWithBlock({ (task:BFTask!) -> AnyObject! in
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

        sequencer.enqueueStep { (result:AnyObject?, completion:(AnyObject? -> Void)
            ) -> Void in
            self.requsetReverseGeocodeLocation(location).continueWithBlock({ (task:BFTask!) -> AnyObject! in
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
                        tcs.setError(NSError(domain: "CUTE", code: -1, userInfo: [NSLocalizedDescriptionKey:STR("GeoManager/请求失败")]))
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


        let sequencer = SwiftSequencer()

        sequencer.enqueueStep { (result:AnyObject?, completion:(AnyObject? -> Void)
            ) -> Void in
            self.requestGeocodeWithAddress(address, components: components).continueWithBlock({ (task:BFTask!) -> AnyObject! in
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

        sequencer.enqueueStep { (result:AnyObject?, completion:(AnyObject? -> Void)
            ) -> Void in
       self.requestGeocodeWithAddress(address, components: components).continueWithBlock({ (task:BFTask!) -> AnyObject! in
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

        sequencer.enqueueStep { (result:AnyObject?, completion:(AnyObject? -> Void)
            ) -> Void in
            self.requestGeocodeWithAddress(address, components: components).continueWithBlock({ (task:BFTask!) -> AnyObject! in
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
                    tcs.setError(NSError(domain: "INTULocationManager", code: 0, userInfo: [NSLocalizedDescriptionKey:STR("GeoManager/获取当前位置超时")]))
                }
                else if status == INTULocationStatus.Error {
                    tcs.setError(NSError(domain: "INTULocationManager", code: 0, userInfo: [NSLocalizedDescriptionKey:STR("GeoManager/获取当前位置失败")]))
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
    /// - parameter mode: 交通工具的模式，有bicycling, driving, walking, transit, 默认driving
    /// - returns: BFTask
    func searchDistanceMatrixWithOrigins(origins:[String], destinations:[String], mode:String = "driving") -> BFTask {
        let tcs = BFTaskCompletionSource()

        let sequencer = SwiftSequencer()

        sequencer.enqueueStep { (result:AnyObject?, completion:(AnyObject?->Void)) -> Void in
            CUTEAPICacheManager.sharedInstance().getEnumsByType("featured_facility_traffic_type").continueWithBlock({ (task:BFTask!) -> AnyObject! in
                if let enums = task.result as? [CUTEEnum] {
                    completion(enums)
                }
                return task
            })
        }

        sequencer.enqueueStep { (result:AnyObject?, completion:(AnyObject?->Void)) -> Void in
            let types = result as! [CUTEEnum]
            let originsParam = origins.joinWithSeparator("|").URLEncode()
            let destinationsParam = destinations.joinWithSeparator("|").URLEncode()
            let URLString = "https://maps.googleapis.com/maps/api/distancematrix/json?origins=\(originsParam)&destinations=\(destinationsParam)&mode=\(mode)&language=en-GB&key=\(CUTEConfiguration.googleAPIKey())"

            self.reverseProxyWithLink(URLString).continueWithBlock { (task:BFTask!) -> AnyObject! in
                if let dic = task.result as? [String:AnyObject] {

                    do {
                        guard let rows = dic["rows"] as? [[String: AnyObject]] else {
                            throw NSError(domain: "Google", code: -1, userInfo: [NSLocalizedDescriptionKey:"Parse Error" + " " + dic.description])
                        }

                        let trafficTimesMatrix = try rows.map({ (dic: [String: AnyObject]) -> [CUTETrafficTime] in
                            guard let elements = dic["elements"] as? [[String: AnyObject]] else {
                                throw NSError(domain: "Google", code: -1, userInfo: [NSLocalizedDescriptionKey:"Parse Error" + " " + dic.description])
                            }

                            let trafficTimesArray = try elements.map({ (element: [String: AnyObject]) -> CUTETrafficTime in
                                guard let durationDic = element["duration"] as? [String: AnyObject] else {
                                    throw NSError(domain: "Google", code: -1, userInfo: [NSLocalizedDescriptionKey:"Parse Error" + " " + element.description])
                                }
                                guard let duration = durationDic["value"] as? Float else {
                                    throw NSError(domain: "Google", code: -1, userInfo: [NSLocalizedDescriptionKey:"Parse Error" + " " + durationDic.description])
                                }
                                let mins = Int32(ceil(duration / 60.0))
                                let timePeriod = CUTETimePeriod(value: mins, unit: "minute")
                                let trifficTime = CUTETrafficTime()
                                trifficTime.time = timePeriod
                                trifficTime.type = types.filter({ (type:CUTEEnum) -> Bool in
                                    return type.slug == mode
                                }).first

                                return trifficTime
                            })
                            return trafficTimesArray
                        })
                        tcs.setResult(trafficTimesMatrix)
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
        }

        sequencer.run()

        return tcs.task
    }

    func searchSurroundingsWithName(name:String?, latitude:NSNumber?, longitude:NSNumber?, city:CUTECity?, country:CUTECountry?, propertyPostcodeIndex:String!) -> BFTask {
        let tcs = BFTaskCompletionSource()
        let sequencer = SwiftSequencer()

        sequencer.enqueueStep { (result:AnyObject?, completion:(AnyObject? -> Void)) -> Void in
            CUTEAPICacheManager.sharedInstance().getEnumsByType("featured_facility_type").continueWithBlock({ (
                task:BFTask!) -> AnyObject! in
                if let enums = task.result as? [CUTEEnum] {
                    completion(enums)
                }
                return task
            })
        }

        sequencer.enqueueStep { (result:AnyObject?, completion:(AnyObject? -> Void)
            ) -> Void in
            let types = result as! [CUTEEnum]
            let typeIds = types.map({ (type:CUTEEnum) -> String in
                return type.identifier
            })

            var parameters = [String:AnyObject]()
            if name != nil {
                parameters["query"] = name
            }
            if city != nil {
                parameters["city"] = city!.identifier
            }

            if latitude != nil && longitude != nil {
                parameters["latitude"] = latitude!.stringValue
                parameters["longitude"] = longitude!.stringValue
            }

            parameters["type"] = typeIds.joinWithSeparator(",")

            CUTEAPIManager.sharedInstance().POST("/api/1/main_mixed_index/search", parameters: parameters, resultClass: CUTESurrounding.self, cancellationToken: nil).continueWithBlock({ (task:BFTask!) -> AnyObject! in
                let result = task.result
                completion(result)
                return task
            })

        }

        sequencer.enqueueStep { (result:AnyObject?, completion:(AnyObject? -> Void)
            ) -> Void in

            CUTEAPICacheManager.sharedInstance().getEnumsByType("featured_facility_traffic_type").continueWithBlock({ (task:BFTask!) -> AnyObject! in
                if let enums = task.result as? [CUTEEnum] {
                    let trafficEnums = enums.sort({ (e1:CUTEEnum, e2:CUTEEnum) -> Bool in
                        return e1.sortValue < e2.sortValue
                    })

                    if let surroudings:[CUTESurrounding] = result as? [CUTESurrounding] {
                        if surroudings.count > 0 {

                            var destinations = [String]()

                            //TODO check here has performance issues for like hundred of results
                            for surrrounding in surroudings {
                                if let address = surrrounding.address {
                                    destinations.append(address)
                                }
                            }

                            var requestTaskArray = [BFTask!]()
                            for type in trafficEnums {
                                requestTaskArray.append(self.searchDistanceMatrixWithOrigins([propertyPostcodeIndex], destinations: destinations, mode: type.slug))
                            }

                            //default walking as the first mode
                            BFTask(forCompletionOfAllTasksWithResults: requestTaskArray).continueWithBlock { (task:BFTask!) -> AnyObject! in

                                if let taskArray = task.result as? [[[CUTETrafficTime]]] {
                                    if taskArray.count == requestTaskArray.count {

                                        for timeMatix in taskArray {
                                            let timeArray = timeMatix[0]
                                            if timeArray.count == surroudings.count {

                                                for index in Range(start: 0, end: surroudings.count) {
                                                    let surrouding = surroudings[index]
                                                    if surrouding.trafficTimes != nil && surrouding.trafficTimes.count > 0 {
                                                        var array = surrouding.trafficTimes
                                                        array.append(timeArray[index])
                                                        surrouding.trafficTimes = array
                                                    }
                                                    else {
                                                        var array = [CUTETrafficTime]()
                                                        array.append(timeArray[index])
                                                        surrouding.trafficTimes = array
                                                    }
                                                }
                                            }
                                        }
                                        
                                        tcs.setResult(surroudings)
                                    }
                                }
                                return task;
                            }
                        }
                        else {
                            tcs.setResult(surroudings)
                        }
                    }
                    else {
                        tcs.setResult([])
                    }

                }
                return task
            })
        }

        sequencer.run()

        return tcs.task
    }
}
