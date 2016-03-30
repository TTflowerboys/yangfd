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


    /// ![](https://www.gstatic.com/images/branding/product/1x/maps_64dp.png)
    ///
    /// 获取[Google Map Geocoding API](https://developers.google.com/maps/documentation/geocoding/intro)的结果
    /// - parameter location: 经纬度
    /// - returns: BFTask
    func reverseGeocodeLocation(location:CLLocation, cancellationToken:BFCancellationToken?) -> BFTask {
        let tcs = BFTaskCompletionSource()

        //retry 3 times

        let sequencer = SwiftSequencer()

        sequencer.enqueueStep { (result:AnyObject?, completion:(AnyObject? -> Void)
            ) -> Void in
            self.requsetReverseGeocodeLocation(location, cancellationToken: cancellationToken).continueWithBlock({ (task:BFTask!) -> AnyObject! in
                if task.cancelled {
                    if !tcs.task.completed {
                        tcs.cancel()
                    }
                }
                else if task.result != nil {
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
            self.requsetReverseGeocodeLocation(location, cancellationToken: cancellationToken).continueWithBlock({ (task:BFTask!) -> AnyObject! in
                if task.cancelled {
                    if !tcs.task.completed {
                        tcs.cancel()
                    }
                }
                else if task.result != nil {
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
            self.requsetReverseGeocodeLocation(location, cancellationToken: cancellationToken).continueWithBlock({ (task:BFTask!) -> AnyObject! in
                if task.cancelled {
                    if !tcs.task.completed {
                        tcs.cancel()
                    }
                }
                else if task.result != nil {
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


    /// ![](https://www.gstatic.com/images/branding/product/1x/maps_64dp.png)
    ///
    /// 获取[Google Map Geocoding API](https://developers.google.com/maps/documentation/geocoding/intro)的结果
    /// - parameter address: 街区地址
    /// - parameter components: route | locality | administrative_area | postal_code | country
    /// - returns: BFTask
    func geocodeWithAddress(address:String?, components:String, cancellationToken:BFCancellationToken?) -> BFTask {
        let tcs = BFTaskCompletionSource()

        //retry 3 times


        let sequencer = SwiftSequencer()

        sequencer.enqueueStep { (result:AnyObject?, completion:(AnyObject? -> Void)
            ) -> Void in
            self.requestGeocodeWithAddress(address, components: components, cancellationToken: cancellationToken).continueWithBlock({ (task:BFTask!) -> AnyObject! in
                if task.cancelled {
                    if !tcs.task.completed {
                        tcs.cancel()
                    }
                }
                else if task.result != nil {
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
            self.requestGeocodeWithAddress(address, components: components, cancellationToken: cancellationToken).continueWithBlock({ (task:BFTask!) -> AnyObject! in
                if task.cancelled {
                    if !tcs.task.completed {
                        tcs.cancel()
                    }
                }
                else if task.result != nil {
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
            self.requestGeocodeWithAddress(address, components: components, cancellationToken: cancellationToken).continueWithBlock({ (task:BFTask!) -> AnyObject! in
                if task.cancelled {
                    if !tcs.task.completed {
                        tcs.cancel()
                    }
                }
                else if task.result != nil {
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

    func searchPostcodeIndex(postCodeIndex:String, countryCode:String, cancellationToken:BFCancellationToken?) -> BFTask {
        return CUTEAPIManager.sharedInstance().POST("/api/1/postcode/search", parameters: ["postcode_index":postCodeIndex, "country":countryCode], resultClass: CUTEPostcodePlace.self, cancellationToken:cancellationToken)
    }

    func requestCurrentLocation(cancellationToken:BFCancellationToken?) -> BFTask {
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

        if cancellationToken != nil {
            cancellationToken!.registerCancellationObserverWithBlock({ () -> Void in
                tcs.trySetCancelled()
            })

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
    func searchDistanceMatrixWithOrigins(origins:[String], destinations:[String], mode:String = "driving", timeZone:NSTimeZone?, cancellationToken:BFCancellationToken?) -> BFTask {
        let tcs = BFTaskCompletionSource()

        let sequencer = SwiftSequencer()

        sequencer.enqueueStep { (result:AnyObject?, completion:(AnyObject?->Void)) -> Void in
            CUTEAPICacheManager.sharedInstance().getEnumsByType("featured_facility_traffic_type", cancellationToken: cancellationToken).continueWithBlock({ (task:BFTask!) -> AnyObject! in
                if task.cancelled {
                    if !tcs.task.completed {
                        tcs.cancel()
                    }
                }
                else if let enums = task.result as? [CUTEEnum] {
                    completion(enums)
                }
                return task
            })
        }

        sequencer.enqueueStep { (result:AnyObject?, completion:(AnyObject?->Void)) -> Void in
            let types = result as! [CUTEEnum]
            let originsParam = origins.joinWithSeparator("|").URLEncode()
            let destinationsParam = destinations.joinWithSeparator("|").URLEncode()
            var URLString = "https://maps.googleapis.com/maps/api/distancematrix/json?origins=\(originsParam)&destinations=\(destinationsParam)&mode=\(mode)&language=en-GB&key=\(CUTEConfiguration.googleAPIKey())"
            if timeZone != nil {
                let depatureTime = self.getDepatureTime(timeZone!)
                URLString = URLString + "&departure_time=\(Int64(depatureTime))"
            }

            self.reverseProxyWithLink(URLString, cancellationToken: cancellationToken).continueWithBlock { (task:BFTask!) -> AnyObject! in
                if task.cancelled {
                    if !tcs.task.completed {
                        tcs.cancel()
                    }
                }
                else if task.error != nil {
                    tcs.setError(task.error)
                }
                else if let dic = task.result as? [String:AnyObject] {

                    do {
                        guard let rows = dic["rows"] as? [[String: AnyObject]] else {
                            throw NSError(domain: "Google", code: -1, userInfo: [NSLocalizedDescriptionKey:"Parse Error" + " " + dic.description])
                        }

                        var trafficTimesMatrix = [[CUTETrafficTime]]()
                        for dic:[String:AnyObject] in rows {
                            guard let elements = dic["elements"] as? [[String: AnyObject]] else {
                                throw NSError(domain: "Google", code: -1, userInfo: [NSLocalizedDescriptionKey:"Parse Error" + " " + dic.description])
                            }

                            var trafficTimesArray = [CUTETrafficTime]()
                            for element:[String:AnyObject] in elements {
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

                               trafficTimesArray.append(trifficTime)
                            }

                            trafficTimesMatrix.append(trafficTimesArray)
                        }

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

    func searchSurroundingsTrafficInfoWithProperty(propertyPostcodeIndex:String!, surroundings:[CUTESurrounding]!, country:CUTECountry?, cancellationToken:BFCancellationToken?) -> BFTask {

        let tcs = BFTaskCompletionSource()
        let sequencer = SwiftSequencer()


        sequencer.enqueueStep { (result:AnyObject?, completion:(AnyObject? -> Void)) -> Void in

            let enumTask = CUTEAPICacheManager.sharedInstance().getEnumsByType("featured_facility_traffic_type", cancellationToken: cancellationToken);
            var timeZoneTask:BFTask?
            if (country != nil && country!.ISOcountryCode == "GB") {
                // Greate Britain is GMT
                let timeZone = NSTimeZone(forSecondsFromGMT: 0)
                timeZoneTask = BFTask(result: timeZone)
            }
            else {
                timeZoneTask = BFTask(result: NSNull())
            }

            let task = BFTask(forCompletionOfAllTasksWithResults: [enumTask, timeZoneTask!])
            task.continueWithBlock({ (task:BFTask!) -> AnyObject! in
                if task.cancelled {
                    if !tcs.task.completed {
                        tcs.cancel()
                    }
                }

                if task.result != nil {
                    if let resultArray = task.result as? [AnyObject] {
                        if let enums = resultArray[0] as? [CUTEEnum] {
                            if let timeZone = resultArray[1] as? NSTimeZone {
                                completion([enums, timeZone])
                            }
                            else {
                                completion([enums, NSNull()])
                            }
                        }
                        else {
                            tcs.setError(NSError(domain: "CUTE", code: -1, userInfo: [NSLocalizedDescriptionKey:STR("GeoManager/请求失败")]))
                        }
                    }
                    else {
                        tcs.setError(NSError(domain: "CUTE", code: -1, userInfo: [NSLocalizedDescriptionKey:STR("GeoManager/请求失败")]))
                    }
                }
                else if task.error != nil {
                    tcs.setError(task.error)
                }
                else if task.exception != nil {
                    tcs.setException(task.exception)
                }
                else {
                    tcs.setError(NSError(domain: "CUTE", code: -1, userInfo: [NSLocalizedDescriptionKey:STR("GeoManager/请求失败")]))
                }
                return task
            })
        }

        sequencer.enqueueStep { (result:AnyObject?, completion:(AnyObject? -> Void)) -> Void in
            let resultArray = result as! [AnyObject]
            let enums = resultArray[0] as! [CUTEEnum]
            let timeZone = resultArray[1] as? NSTimeZone

            let trafficEnums = enums.sort({ (e1:CUTEEnum, e2:CUTEEnum) -> Bool in
                return e1.sortValue < e2.sortValue
            })

            if surroundings.count > 0 {

                var destinations = [String]()

                //TODO check here has performance issues for like hundred of results
                for surrrounding in surroundings {
                    if let address = surrrounding.address {
                        destinations.append(address)
                    }
                }

                var requestTaskArray = [BFTask!]()
                for type in trafficEnums {
                    requestTaskArray.append(self.searchDistanceMatrixWithOrigins([propertyPostcodeIndex], destinations: destinations, mode: type.slug!, timeZone: timeZone, cancellationToken: cancellationToken))
                }

                //default walking as the first mode
                BFTask(forCompletionOfAllTasksWithResults: requestTaskArray).continueWithBlock { (task:BFTask!) -> AnyObject! in
                    if task.cancelled {
                        if !tcs.task.completed {
                            tcs.cancel()
                        }
                    }
                    else if let taskArray = task.result as? [[[CUTETrafficTime]]] {
                        if taskArray.count == requestTaskArray.count {

                            for timeMatix in taskArray {
                                let timeArray = timeMatix[0]
                                if timeArray.count == surroundings.count {

                                    for index in Range(start: 0, end: surroundings.count) {
                                        let surrouding = surroundings[index]
                                        if let trafficTimes =  surrouding.trafficTimes  {
                                            var array = trafficTimes
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

                            tcs.setResult(surroundings)
                        }
                    }
                    else {
                        tcs.setError(NSError(domain: "CUTE", code: -1, userInfo: [NSLocalizedDescriptionKey:STR("GeoManager/请求失败")]))
                    }
                    
                    return task;
                }
            }
            else {
                tcs.setResult(surroundings)
            }
        }

        sequencer.run()

        return tcs.task
    }

    func searchSurroundingsMainInfoWithName(name:String?, latitude:NSNumber?, longitude:NSNumber?, city:CUTECity?, country:CUTECountry?, propertyPostcodeIndex:String!, cancellationToken:BFCancellationToken?) -> BFTask {
        let tcs = BFTaskCompletionSource()
        let sequencer = SwiftSequencer()

        sequencer.enqueueStep { (result:AnyObject?, completion:(AnyObject? -> Void)) -> Void in
            CUTEAPICacheManager.sharedInstance().getEnumsByType("featured_facility_type", cancellationToken: cancellationToken).continueWithBlock({ (
                task:BFTask!) -> AnyObject! in
                if task.cancelled {
                    if !tcs.task.completed {
                        tcs.cancel()
                    }
                }
                else if let enums = task.result as? [CUTEEnum] {
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

            CUTEAPIManager.sharedInstance().POST("/api/1/main_mixed_index/search", parameters: parameters, resultClass: CUTESurrounding.self, cancellationToken: cancellationToken).continueWithBlock({ (task:BFTask!) -> AnyObject! in
                if task.cancelled {
                    if !tcs.task.completed {
                        tcs.cancel()
                    }
                }
                else if let result = task.result as? [CUTESurrounding] {
                    tcs.setResult(result)
                }
                else {
                    tcs.setResult([])
                }
                return task
            })

        }
        
        sequencer.run()
        
        return tcs.task
    }


    func searchSurroundingsWithName(name:String?, latitude:NSNumber?, longitude:NSNumber?, city:CUTECity?, country:CUTECountry?, propertyPostcodeIndex:String!, cancellationToken:BFCancellationToken?) -> BFTask {

        ///Must have location or name
        if (latitude == nil || longitude == nil) && (name == nil || name == "") {
            return BFTask(error: NSError(domain: "CUTE", code: -1, userInfo: [NSLocalizedDescriptionKey: "Must have location or name"]))
        }

        let tcs = BFTaskCompletionSource()
        let sequencer = SwiftSequencer()

        sequencer.enqueueStep { (result:AnyObject?, completion:(AnyObject? -> Void)) -> Void in
            self.searchSurroundingsMainInfoWithName(name, latitude: latitude, longitude: longitude, city: city, country: country, propertyPostcodeIndex: propertyPostcodeIndex, cancellationToken: cancellationToken).continueWithBlock({ (task:BFTask!) -> AnyObject! in
                if task.cancelled {
                    if !tcs.task.completed {
                        tcs.cancel()
                    }
                }
                else if let result = task.result as? [CUTESurrounding] {
                    completion(result)
                }
                else {
                    tcs.setResult([])
                }
                return task
            })
        }

        sequencer.enqueueStep { (result:AnyObject?, completion:(AnyObject? -> Void)
            ) -> Void in

            let surroundings = result as! [CUTESurrounding]
            if surroundings.count > 0 {
                self.searchSurroundingsTrafficInfoWithProperty(propertyPostcodeIndex, surroundings: surroundings, country: country, cancellationToken: cancellationToken).continueWithBlock({ (task:BFTask!) -> AnyObject! in
                    if task.cancelled {
                        if !tcs.task.completed {
                            tcs.cancel()
                        }
                    }
                    else if let result = task.result as? [CUTESurrounding] {
                        tcs.setResult(result)
                    }
                    else {
                        tcs.setResult([])
                    }
                    return task
                })
            }
            else {
                tcs.setResult([])
            }
        }

        sequencer.run()

        return tcs.task
    }

    //MARK: - Private
    func reverseProxyWithLink(link:String, cancellationToken:BFCancellationToken?) -> BFTask {
        let tcs = BFTaskCompletionSource()
        let request = NSURLRequest(URL: NSURL(string:"/reverse_proxy?link=" + link.URLEncode(), relativeToURL: CUTEConfiguration.hostURL())!)

        let task = NSURLSession.sharedSession().dataTaskWithRequest(request) { (data:NSData?, response:NSURLResponse?, error:NSError?) -> Void in

            dispatch_async(dispatch_get_main_queue(), { () -> Void in

                if tcs.task.cancelled {
                    return
                }

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

        cancellationToken?.registerCancellationObserverWithBlock({ () -> Void in
            task.cancel()
            tcs.trySetCancelled()
        })

        task.resume()

        return tcs.task
    }


    /// - parameter location: 经纬度
    /// - returns: BFTask , task.result 的 placemark，因为我们的数据和 google 不一致，可能没有国家和城市。
    func requsetReverseGeocodeLocation(location:CLLocation, cancellationToken:BFCancellationToken?) -> BFTask {
        let tcs = BFTaskCompletionSource()
        let geocoderURLString = "https://maps.googleapis.com/maps/api/geocode/json?latlng=\(location.coordinate.latitude),\(location.coordinate.longitude)&key=\(CUTEConfiguration.googleAPIKey())&language=en"
        reverseProxyWithLink(geocoderURLString, cancellationToken: cancellationToken).continueWithBlock { (task:BFTask!) -> AnyObject! in

            if task.cancelled {
                if !tcs.task.completed {
                    tcs.cancel()
                    return task
                }
            }
            else if task.error != nil {
                tcs.setError(task.error)
                return task
            }

            guard let dic = task.result as? [String:AnyObject] else {
                tcs.setError(NSError(domain: "CUTE", code: -1, userInfo: [NSLocalizedDescriptionKey:STR("GeoManager/请求失败")]))
                return task
            }

            guard let results = dic["results"] as? [[String:AnyObject]] else {
                tcs.setError(NSError(domain: "CUTE", code: -1, userInfo: [NSLocalizedDescriptionKey:STR("GeoManager/请求失败")]))
                return task
            }


            guard results.count > 0 else {
                tcs.setError(NSError(domain: "CUTE", code: -1, userInfo: [NSLocalizedDescriptionKey:STR("GeoManager/请求失败")]))
                return task
            }

            let result = results[0]
            let placemark = CUTEPlacemark.placeMarkWithGoogleResult(result)

            CUTEAPICacheManager.sharedInstance().getCountriesWithCountryCode(false).continueWithBlock({ (task:BFTask!) -> AnyObject! in
                if let countries = task.result as? [CUTECountry] {
                    if let country = countries.filter({ (country:CUTECountry) -> Bool in
                        if placemark.country != nil {
                            return country.ISOcountryCode == placemark.country!.ISOcountryCode
                        }
                        else {
                            return false
                        }
                    }).first {
                        CUTEAPICacheManager.sharedInstance().getCitiesByCountry(country).continueWithBlock({ (task:BFTask!) -> AnyObject! in
                            if let cities = task.result as? [CUTECity] {
                                if let city = cities.filter({ (city:CUTECity) -> Bool in
                                    if placemark.city != nil {
                                        return placemark.city!.name.lowercaseString.hasPrefix(city.name.lowercaseString)
                                    }
                                    else {
                                        return false
                                    }
                                }).first {
                                    placemark.country = country
                                    placemark.city = city
                                    tcs.setResult(placemark)
                                }
                                else {
                                    placemark.country = country
                                    placemark.city = nil
                                    tcs.setResult(placemark)
                                }
                            }
                            else {
                                tcs.setError(task.error)
                            }

                            return task
                        })
                    }
                    else {
                        placemark.country = nil
                        placemark.city = nil
                        tcs.setResult(placemark)
                    }
                }
                else {
                    tcs.setError(task.error)
                }
                return task
            })
            
            return task
        }
        return tcs.task
    }

    func requestGeocodeWithAddress(address:String?, components:String, cancellationToken:BFCancellationToken?) -> BFTask {
        let tcs = BFTaskCompletionSource()
        var geocoderURLString = "https://maps.googleapis.com/maps/api/geocode/json?key=\(CUTEConfiguration.googleAPIKey())&language=en&components=\(components.URLEncode())"
        if address != nil {
            geocoderURLString += "&addresss=" + address!.URLEncode()
        }

        reverseProxyWithLink(geocoderURLString, cancellationToken:cancellationToken).continueWithBlock { (task:BFTask!) -> AnyObject! in

            if task.cancelled {
                if !tcs.task.completed {
                    tcs.cancel()
                    return task
                }
            }
            else if task.error != nil {
                tcs.setError(task.error)
                return task
            }

            guard let dic = task.result as? [String:AnyObject] else {
                tcs.setError(NSError(domain: "CUTE", code: -1, userInfo: [NSLocalizedDescriptionKey:STR("GeoManager/请求失败")]))
                return task
            }

            guard let results = dic["results"] as? [[String:AnyObject]] else {
                tcs.setError(NSError(domain: "CUTE", code: -1, userInfo: [NSLocalizedDescriptionKey:STR("GeoManager/请求失败")]))
                return task
            }

            guard results.count > 0 else {
                tcs.setError(NSError(domain: "CUTE", code: -1, userInfo: [NSLocalizedDescriptionKey:STR("GeoManager/请求失败")]))
                return task
            }

            let result = results[0]
            let placemark = CUTEPlacemark.placeMarkWithGoogleResult(result)
            tcs.setResult(placemark)
            
            return task
        }
        
        return tcs.task
    }


    //MARK: - Util
    /// depature time just a given value, tranform current time to the timeZone time, then get the time's next week monday, 9'o clock
    func getDepatureTime(timeZone:NSTimeZone) -> NSTimeInterval {
        let date = NSDate()
        let calendar = NSCalendar(calendarIdentifier: NSGregorianCalendar)
        calendar?.timeZone = timeZone

        var startDate:NSDate?
        //http://stackoverflow.com/questions/24084717/error-extra-argument-in-call-when-passing-argument-to-method
        var timeInterval:NSTimeInterval = 0
        calendar?.rangeOfUnit(NSCalendarUnit.WeekOfYear, startDate: &startDate, interval: &timeInterval, forDate: date)
        if (startDate != nil ) {
            return startDate!.dateByAddingDays(7).dateByAddingHours(9).timeIntervalSince1970
        }
        print("Error: should not go here for getDepatureTime")
        return date.timeIntervalSince1970
    }

}
