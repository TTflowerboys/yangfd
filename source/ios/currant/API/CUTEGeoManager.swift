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

    static func buildComponentsWithDictionary(_ dictionary:[String:String]?) -> String? {
        if let dic = dictionary {
            if dic.count > 0 {
                var array = [String]()
                for (key ,value) in dic {
                    let part = key + ":" + value
                    array.append(part)
                }
                return array.joined(separator: "|")
            }
        }
        return nil
    }


    /// ![](https://www.gstatic.com/images/branding/product/1x/maps_64dp.png)
    ///
    /// 获取[Google Map Geocoding API](https://developers.google.com/maps/documentation/geocoding/intro)的结果
    /// - parameter location: 经纬度
    /// - returns: BFTask
    func reverseGeocodeLocation(_ location:CLLocation, cancellationToken:BFCancellationToken?) -> BFTask<AnyObject> {
        let tcs = BFTaskCompletionSource<AnyObject>()

        //retry 3 times

        let sequencer = SwiftSequencer()

        sequencer.enqueueStep { (result:AnyObject?, completion: @escaping (AnyObject?) -> Void
            ) -> Void in

            self.requsetReverseGeocodeLocation(location, cancellationToken: cancellationToken).continue({ (task:BFTask!) -> Any? in
                if task.isCancelled {
                    if !tcs.task.isCompleted {
                        tcs.cancel()
                    }
                }
                else if task.result != nil {
                    tcs.setResult(task.result)
                }
                else if task.error != nil{
                    CUTETracker.sharedInstance().trackError(task.error!)
                    completion(task.error as AnyObject?)
                }
                return task
            })
        }

        sequencer.enqueueStep { (result:AnyObject?, completion: @escaping ((AnyObject?) -> Void)
            ) -> Void in
            self.requsetReverseGeocodeLocation(location, cancellationToken: cancellationToken).continue({ (task:BFTask!) -> AnyObject! in
                if task.isCancelled {
                    if !tcs.task.isCompleted {
                        tcs.cancel()
                    }
                }
                else if task.result != nil {
                    tcs.setResult(task.result)
                }
                else if task.error != nil{
                    CUTETracker.sharedInstance().trackError(task.error!)
                    completion(task.error! as AnyObject?)
                }
                return task
            })
        }

        sequencer.enqueueStep { (result:AnyObject?, completion: @escaping ((AnyObject?) -> Void)
            ) -> Void in
            self.requsetReverseGeocodeLocation(location, cancellationToken: cancellationToken).continue({ (task:BFTask!) -> AnyObject! in
                if task.isCancelled {
                    if !tcs.task.isCompleted {
                        tcs.cancel()
                    }
                }
                else if task.result != nil {
                    tcs.setResult(task.result)
                }
                else if task.error != nil {
                    CUTETracker.sharedInstance().trackError(task.error!)
                    tcs.setError(task.error!)
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
    func geocodeWithAddress(_ address:String?, components:String, cancellationToken:BFCancellationToken?) -> BFTask<AnyObject> {
        let tcs = BFTaskCompletionSource<AnyObject>()

        //retry 3 times


        let sequencer = SwiftSequencer()

        sequencer.enqueueStep { (result:AnyObject?, completion:@escaping ((AnyObject?) -> Void)
            ) -> Void in
            self.requestGeocodeWithAddress(address, components: components, cancellationToken: cancellationToken).continue({ (task:BFTask!) -> AnyObject! in
                if task.isCancelled {
                    if !tcs.task.isCompleted {
                        tcs.cancel()
                    }
                }
                else if task.result != nil {
                    tcs.setResult(task.result)
                }
                else if task.error != nil{
                    CUTETracker.sharedInstance().trackError(task.error!)
                    completion(task.error as AnyObject?)
                }
                return task
            })
        }

        sequencer.enqueueStep { (result:AnyObject?, completion:@escaping ((AnyObject?) -> Void)
            ) -> Void in
            self.requestGeocodeWithAddress(address, components: components, cancellationToken: cancellationToken).continue({ (task:BFTask!) -> AnyObject! in
                if task.isCancelled {
                    if !tcs.task.isCompleted {
                        tcs.cancel()
                    }
                }
                else if task.result != nil {
                    tcs.setResult(task.result)
                }
                else if task.error != nil{
                    CUTETracker.sharedInstance().trackError(task.error!)
                    completion(task.error as AnyObject?)
                }
                return task
            })
        }

        sequencer.enqueueStep { (result:AnyObject?, completion: @escaping ((AnyObject?) -> Void)
            ) -> Void in
            self.requestGeocodeWithAddress(address, components: components, cancellationToken: cancellationToken).continue({ (task:BFTask!) -> AnyObject! in
                if task.isCancelled {
                    if !tcs.task.isCompleted {
                        tcs.cancel()
                    }
                }
                else if task.result != nil {
                    tcs.setResult(task.result)
                }
                else if task.error != nil{
                    CUTETracker.sharedInstance().trackError(task.error!)
                    tcs.setError(task.error!)
                }
                return task
            })
        }

        sequencer.run()
        
        return tcs.task
    }

    func searchPostcodeIndex(_ postCodeIndex:String, countryCode:String, cancellationToken:BFCancellationToken?) -> BFTask<AnyObject> {
        return CUTEAPIManager.sharedInstance().post("/api/1/postcode/search", parameters: ["postcode_index":postCodeIndex, "country":countryCode], resultClass: CUTEPostcodePlace.self, cancellationToken:cancellationToken)
    }

    func requestCurrentLocation(_ cancellationToken:BFCancellationToken?) -> BFTask<AnyObject> {
        let tcs = BFTaskCompletionSource<AnyObject>()
        INTULocationManager.sharedInstance().requestLocation(withDesiredAccuracy: INTULocationAccuracy.city, timeout: 30, delayUntilAuthorized: true) { (currentLocation:CLLocation?, achievedAccuracy:INTULocationAccuracy, status:INTULocationStatus) -> Void in

            if tcs.task.isCancelled {
                return
            }

            if currentLocation != nil {
                tcs.setResult(currentLocation)
            }
            else {
                if status == INTULocationStatus.timedOut {
                    tcs.setError(NSError(domain: "INTULocationManager", code: 0, userInfo: [NSLocalizedDescriptionKey:STR("GeoManager/获取当前位置超时")]))
                }
                else if status == INTULocationStatus.error {
                    tcs.setError(NSError(domain: "INTULocationManager", code: 0, userInfo: [NSLocalizedDescriptionKey:STR("GeoManager/获取当前位置失败")]))
                }
                else if status == INTULocationStatus.servicesDenied {
                    tcs.setError(NSError(domain: "INTULocationManager", code: 0, userInfo: [NSLocalizedDescriptionKey:STR("GeoManager/拒绝服务")]))
                }
                else {
                    tcs.setError(NSError(domain: "INTULocationManager", code: 0, userInfo: [NSLocalizedDescriptionKey:""]))
                }
            }
        }

        if cancellationToken != nil {
            cancellationToken!.registerCancellationObserver({ () -> Void in
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
    func searchDistanceMatrixWithOrigins(_ origins:[String], destinations:[String], mode:String = "driving", timeZone:TimeZone?, cancellationToken:BFCancellationToken?) -> BFTask<AnyObject> {
        let tcs = BFTaskCompletionSource<AnyObject>()

        let sequencer = SwiftSequencer()

        sequencer.enqueueStep { (result:AnyObject?, completion:@escaping ((AnyObject?)->Void)) -> Void in
            CUTEAPICacheManager.sharedInstance().getEnumsByType("featured_facility_traffic_type", cancellationToken: cancellationToken).continue({ (task:BFTask!) -> Any? in
                if task.isCancelled {
                    if !tcs.task.isCompleted {
                        tcs.cancel()
                    }
                }
                else if let enums = task.result as? [CUTEEnum] {
                    completion(enums as AnyObject?)
                }
                return task
            })
        }

        sequencer.enqueueStep { (result:AnyObject?, completion: @escaping ((AnyObject?)->Void)) -> Void in
            let types = result as! [CUTEEnum]
            let originsParam = origins.joined(separator: "|").urlEncode()
            let destinationsParam = destinations.joined(separator: "|").urlEncode()
            var URLString = "https://maps.googleapis.com/maps/api/distancematrix/json?origins=\(originsParam)&destinations=\(destinationsParam)&mode=\(mode)&language=en-GB&key=\(CUTEConfiguration.googleAPIKey())"
            if timeZone != nil {
                let depatureTime = self.getDepatureTime(timeZone!)
                URLString = URLString + "&departure_time=\(Int64(depatureTime))"
            }

            self.reverseProxyWithLink(URLString, cancellationToken: cancellationToken).continue ({ (task:BFTask!) -> AnyObject! in
                if task.isCancelled {
                    if !tcs.task.isCompleted {
                        tcs.cancel()
                    }
                }
                else if task.error != nil {
                    tcs.setError(task.error!)
                }
                else if let dic = task.result as? [String:AnyObject] {

                    do {
                        guard let rows = dic["rows"] as? [[String: AnyObject]] else {
                            throw NSError(domain: "Google", code: -1, userInfo: [NSLocalizedDescriptionKey:"Parse Error" + " " + dic.description])
                        }

                        guard rows.count > 0 else {
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
                                trifficTime!.time = timePeriod
                                trifficTime!.type = types.filter({ (type:CUTEEnum) -> Bool in
                                    return type.slug == mode
                                }).first

                               trafficTimesArray.append(trifficTime!)
                            }

                            trafficTimesMatrix.append(trafficTimesArray)
                        }

                        tcs.setResult(trafficTimesMatrix as AnyObject?)
                    }
                    catch let error as NSError {
                        tcs.setError(error)
                    }
                }
                else if task.error != nil{
                    tcs.setError(task.error!)
                }
                return task
            })
        }

        sequencer.run()

        return tcs.task
    }

    func searchSurroundingsTrafficInfoWithProperty(_ propertyPostcodeIndex:String!, surroundings:[CUTESurrounding]!, country:CUTECountry?, cancellationToken:BFCancellationToken?) -> BFTask<AnyObject> {

        let tcs = BFTaskCompletionSource<AnyObject>()
        let sequencer = SwiftSequencer()


        sequencer.enqueueStep { (result:AnyObject?, completion: @escaping (AnyObject?) -> Void) in

            let enumTask = CUTEAPICacheManager.sharedInstance().getEnumsByType("featured_facility_traffic_type", cancellationToken: cancellationToken);
            var timeZoneTask:BFTask<AnyObject>?
            if (country != nil && country!.isOcountryCode == "GB") {
                // Greate Britain is GMT
                let timeZone = TimeZone(secondsFromGMT: 0)
                timeZoneTask = BFTask(result: timeZone as AnyObject)
            }
            else {
                timeZoneTask = BFTask(result: NSNull())
            }

            let laterTasks:[BFTask<AnyObject>]? = [enumTask!, timeZoneTask!]
            let task = BFTask<AnyObject>(forCompletionOfAllTasksWithResults: laterTasks as [BFTask<AnyObject>]?)
            task.continue({ (task:BFTask!) -> AnyObject! in
                if task.isCancelled {
                    if !tcs.task.isCompleted {
                        tcs.cancel()
                    }
                }

                if task.result != nil {
                    if let resultArray = task.result as? [AnyObject] {
                        if let enums = resultArray[0] as? [CUTEEnum] {
                            if let timeZone = resultArray[1] as? TimeZone {
                                var array = Array<AnyObject>()
                                array.append(enums as AnyObject)
                                array.append(timeZone as AnyObject)
                                completion(array as AnyObject)
                            }
                            else {
                                var array = Array<AnyObject>()
                                array.append(enums as AnyObject)
                                array.append(NSNull())
                                completion(array as AnyObject)
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
                    tcs.setError(task.error!)
                }
                else if task.exception != nil {
                    tcs.setException(task.exception!)
                }
                else {
                    tcs.setError(NSError(domain: "CUTE", code: -1, userInfo: [NSLocalizedDescriptionKey:STR("GeoManager/请求失败")]))
                }
                return task
            })
        }

        sequencer.enqueueStep { (result:AnyObject?, completion: @escaping ((AnyObject?) -> Void)) -> Void in
            let resultArray = result as! [AnyObject]
            let enums = resultArray[0] as! [CUTEEnum]
            let timeZone = resultArray[1] as? TimeZone

            let trafficEnums = enums.sorted(by: { (e1:CUTEEnum, e2:CUTEEnum) -> Bool in
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

                var requestTaskArray:[BFTask<AnyObject>]? = [BFTask<AnyObject>]()
                for type in trafficEnums {
                    requestTaskArray!.append(self.searchDistanceMatrixWithOrigins([propertyPostcodeIndex], destinations: destinations, mode: type.slug!, timeZone: timeZone, cancellationToken: cancellationToken))
                }

                //default walking as the first mode
                BFTask<AnyObject>(forCompletionOfAllTasksWithResults: requestTaskArray).continue({ (task:BFTask!) -> AnyObject! in
                    if task.isCancelled {
                        if !tcs.task.isCompleted {
                            tcs.cancel()
                        }
                    }
                    else if let taskArray = task.result as? [[[CUTETrafficTime]]] {
                        if taskArray.count == requestTaskArray!.count {

                            for timeMatix in taskArray {
                                let timeArray = timeMatix[0]
                                if timeArray.count == surroundings.count {

                                    for index in (0 ..< surroundings.count) {
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

                            tcs.setResult(surroundings as AnyObject?)
                        }
                    }
                    else {
                        tcs.setError(NSError(domain: "CUTE", code: -1, userInfo: [NSLocalizedDescriptionKey:STR("GeoManager/请求失败")]))
                    }
                    
                    return task;
                })
            }
            else {
                tcs.setResult(surroundings as AnyObject!)
            }
        }

        sequencer.run()

        return tcs.task
    }

    func searchSurroundingsMainInfoWithName(_ name:String?, latitude:NSNumber?, longitude:NSNumber?, city:CUTECity?, country:CUTECountry?, propertyPostcodeIndex:String!, cancellationToken:BFCancellationToken?) -> BFTask<AnyObject> {
        let tcs = BFTaskCompletionSource<AnyObject>()
        let sequencer = SwiftSequencer()

        sequencer.enqueueStep { (result:AnyObject?, completion: @escaping (AnyObject?) -> Void) in
            CUTEAPICacheManager.sharedInstance().getEnumsByType("featured_facility_type", cancellationToken: cancellationToken).continue({ (
                task:BFTask!) -> AnyObject! in
                if task.isCancelled {
                    if !tcs.task.isCompleted {
                        tcs.cancel()
                    }
                }
                else if let enums = task.result as? [CUTEEnum] {
                    completion(enums as AnyObject)
                }
                return task
            })

        }

        sequencer.enqueueStep { (result:AnyObject?, completion: @escaping ((AnyObject?) -> Void)
            ) -> Void in
            let types = result as! [CUTEEnum]
            let typeIds = types.map({ (type:CUTEEnum) -> String in
                return type.identifier
            })

            var parameters = [String:AnyObject]()
            if name != nil {
                parameters["query"] = name as AnyObject?
            }
            if city != nil {
                parameters["city"] = city!.identifier as AnyObject?
            }

            if latitude != nil && longitude != nil {
                parameters["latitude"] = latitude!.stringValue as AnyObject?
                parameters["longitude"] = longitude!.stringValue as AnyObject?
            }

            parameters["type"] = typeIds.joined(separator: ",") as AnyObject?

            CUTEAPIManager.sharedInstance().post("/api/1/main_mixed_index/search", parameters: parameters, resultClass: CUTESurrounding.self, cancellationToken: cancellationToken).continue({ (task:BFTask!) -> AnyObject! in
                if task.isCancelled {
                    if !tcs.task.isCompleted {
                        tcs.cancel()
                    }
                }
                else if let result = task.result as? [CUTESurrounding] {
                    tcs.setResult(result as AnyObject?)
                }
                else {
                    tcs.setResult([] as AnyObject?)
                }
                return task
            })

        }
        
        sequencer.run()
        
        return tcs.task
    }


    func searchSurroundingsWithName(_ name:String?, latitude:NSNumber?, longitude:NSNumber?, city:CUTECity?, country:CUTECountry?, propertyPostcodeIndex:String!, cancellationToken:BFCancellationToken?) -> BFTask<AnyObject> {

        ///Must have location or name
        if (latitude == nil || longitude == nil) && (name == nil || name == "") {
            return BFTask(error: NSError(domain: "CUTE", code: -1, userInfo: [NSLocalizedDescriptionKey: "Must have location or name"]))
        }

        let tcs = BFTaskCompletionSource<AnyObject>()
        let sequencer = SwiftSequencer()

        sequencer.enqueueStep { (result:AnyObject?, completion:@escaping ((AnyObject?) -> Void)) -> Void in
            self.searchSurroundingsMainInfoWithName(name, latitude: latitude, longitude: longitude, city: city, country: country, propertyPostcodeIndex: propertyPostcodeIndex, cancellationToken: cancellationToken).continue({ (task:BFTask!) -> AnyObject! in
                if task.isCancelled {
                    if !tcs.task.isCompleted {
                        tcs.cancel()
                    }
                }
                else if let result = task.result as? [CUTESurrounding] {
                    completion(result as AnyObject?)
                }
                else {
                    tcs.setResult([AnyObject]() as AnyObject?)
                }
                return task
            })
        }

        sequencer.enqueueStep { (result:AnyObject?, completion: @escaping ((AnyObject?) -> Void)
            ) -> Void in

            let surroundings = result as! [CUTESurrounding]
            if surroundings.count > 0 {
                self.searchSurroundingsTrafficInfoWithProperty(propertyPostcodeIndex, surroundings: surroundings, country: country, cancellationToken: cancellationToken).continue({ (task:BFTask!) -> AnyObject! in
                    if task.isCancelled {
                        if !tcs.task.isCompleted {
                            tcs.cancel()
                        }
                    }
                    else if let result = task.result as? [CUTESurrounding] {
                        tcs.setResult(result as AnyObject?)
                    }
                    else {
                        tcs.setResult([AnyObject]() as AnyObject?)
                    }
                    return task
                })
            }
            else {
                tcs.setResult([AnyObject]() as AnyObject?)
            }
        }

        sequencer.run()

        return tcs.task
    }

    //MARK: - Private
    func reverseProxyWithLink(_ link:String, cancellationToken:BFCancellationToken?) -> BFTask<AnyObject> {
        let tcs = BFTaskCompletionSource<AnyObject>()
        let request = URLRequest(url: URL(string:"/reverse_proxy?link=" + link.urlEncode(), relativeTo: CUTEConfiguration.hostURL())!)

        let task = URLSession.shared.dataTask(with: request, completionHandler: { (data:Data?, response:URLResponse?, error:Error?) -> Void in

            DispatchQueue.main.async(execute: { () -> Void in

                if tcs.task.isCancelled {
                    return
                }

                let dic = (data as NSData?)?.jsonData()
                if error != nil {
                    tcs.setError(error!)
                }
                else if dic != nil {
                    tcs.setResult(dic as AnyObject!)
                }
                else {
                    if let httpResponse = response as? HTTPURLResponse {
                        if httpResponse.statusCode == 500 {
                            tcs.setError(NSError(domain: "Google", code: httpResponse.statusCode, userInfo: [NSLocalizedDescriptionKey:STR("GeoManager/请求失败")]))
                        }
                        else {
                            tcs.setError(NSError(domain: "Google", code: httpResponse.statusCode, userInfo: [NSLocalizedDescriptionKey:HTTPURLResponse.localizedString(forStatusCode: httpResponse.statusCode)]))
                        }
                    }
                }
            })
        } as! (Data?, URLResponse?, Error?) -> Void) 

        cancellationToken?.registerCancellationObserver({ () -> Void in
            task.cancel()
            tcs.trySetCancelled()
        })

        task.resume()

        return tcs.task
    }


    /// - parameter location: 经纬度
    /// - returns: BFTask , task.result 的 placemark，因为我们的数据和 google 不一致，可能没有国家和城市。
    func requsetReverseGeocodeLocation(_ location:CLLocation, cancellationToken:BFCancellationToken?) -> BFTask<AnyObject> {
        let tcs = BFTaskCompletionSource<AnyObject>()
        let geocoderURLString = "https://maps.googleapis.com/maps/api/geocode/json?latlng=\(location.coordinate.latitude),\(location.coordinate.longitude)&key=\(CUTEConfiguration.googleAPIKey())&language=en"
        reverseProxyWithLink(geocoderURLString, cancellationToken: cancellationToken).continue ({ (task:BFTask!) -> AnyObject! in

            if task.isCancelled {
                if !tcs.task.isCompleted {
                    tcs.cancel()
                    return task
                }
            }
            else if task.error != nil {
                tcs.setError(task.error!)
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
            let placemark = CUTEPlacemark.placeMark(withGoogleResult: result)

            CUTEAPICacheManager.sharedInstance().getCountriesWithCountryCode(false).continue({ (task:BFTask!) -> AnyObject! in
                if let countries = task.result as? [CUTECountry] {
                    if let country = countries.filter({ (country:CUTECountry) -> Bool in
                        if placemark.country != nil {
                            return country.isOcountryCode == placemark.country!.isOcountryCode
                        }
                        else {
                            return false
                        }
                    }).first {
                        CUTEAPICacheManager.sharedInstance().getCitiesBy(country).continue({ (task:BFTask!) -> AnyObject! in
                            if let cities = task.result as? [CUTECity] {
                                if let city = cities.filter({ (city:CUTECity) -> Bool in
                                    return placemark.isCityEqual(to: city)                                
                                }).first {
                                    placemark.country = country
                                    placemark.city = city
                                    tcs.setResult(placemark)
                                }
                                else {
                                    if let placemarkCity = placemark.city {
                                        CUTETracker.sharedInstance().trackError(NSError(domain: "CUTE", code: -1, userInfo: [NSLocalizedDescriptionKey:"NO City: " + placemarkCity.name]))
                                    }
                                    placemark.country = country
                                    placemark.city = nil
                                    tcs.setResult(placemark)
                                }
                            }
                            else if task.error != nil {
                                tcs.setError(task.error!)
                            }

                            return task
                        })
                    }
                    else {
                        if let placemarkCountry = placemark.country {
                            CUTETracker.sharedInstance().trackError(NSError(domain: "CUTE", code: -1, userInfo: [NSLocalizedDescriptionKey:"NO Country: " + placemarkCountry.isOcountryCode]))
                        }
                        if let placemarkCity = placemark.city {
                            CUTETracker.sharedInstance().trackError(NSError(domain: "CUTE", code: -1, userInfo: [NSLocalizedDescriptionKey:"NO City: " + placemarkCity.name]))
                        }
                        placemark.country = nil
                        placemark.city = nil
                        tcs.setResult(placemark)
                    }
                }
                else if task.error != nil{
                    tcs.setError(task.error!)
                }
                return task
            })
            
            return task
        })
        return tcs.task
    }

    func requestGeocodeWithAddress(_ address:String?, components:String, cancellationToken:BFCancellationToken?) -> BFTask<AnyObject> {
        let tcs = BFTaskCompletionSource<AnyObject>()
        var geocoderURLString = "https://maps.googleapis.com/maps/api/geocode/json?key=\(CUTEConfiguration.googleAPIKey())&language=en&components=\(components.urlEncode())"
        if address != nil {
            geocoderURLString += "&addresss=" + address!.urlEncode()
        }

        reverseProxyWithLink(geocoderURLString, cancellationToken:cancellationToken).continue({ (task:BFTask!) -> AnyObject! in

            if task.isCancelled {
                if !tcs.task.isCompleted {
                    tcs.cancel()
                    return task
                }
            }
            else if task.error != nil {
                tcs.setError(task.error!)
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
            let placemark = CUTEPlacemark.placeMark(withGoogleResult: result)
            tcs.setResult(placemark)
            
            return task
        })
        
        return tcs.task
    }


    //MARK: - Util
    /// depature time just a given value, tranform current time to the timeZone time, then get the time's next week monday, 9'o clock
    func getDepatureTime(_ timeZone:TimeZone) -> TimeInterval {
        let date = Date()
        var calendar = Calendar(identifier: Calendar.Identifier.gregorian)
        calendar.timeZone = timeZone

        var startDate:NSDate?
        //http://stackoverflow.com/questions/24084717/error-extra-argument-in-call-when-passing-argument-to-method
        var timeInterval:TimeInterval = 0
        (calendar as NSCalendar?)?.range(of: NSCalendar.Unit.weekOfYear, start: &startDate, interval: &timeInterval, for: date)
        if (startDate != nil ) {
            return ((startDate! as NSDate).addingDays(7) as NSDate).addingHours(9).timeIntervalSince1970
        }
        print("Error: should not go here for getDepatureTime")
        return date.timeIntervalSince1970
    }

}
