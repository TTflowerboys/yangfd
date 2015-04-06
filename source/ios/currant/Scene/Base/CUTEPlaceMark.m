//
//  CUTEPlaceMark.m
//  currant
//
//  Created by Foster Yin on 4/4/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEPlacemark.h"
#import "CUTECommonMacro.h"

@implementation CUTEPlacemark

+ (CUTEPlacemark *)placeMarkWithCLPlaceMark:(CLPlacemark *)placemark {
    CUTEPlacemark *retPlacemark = [[CUTEPlacemark alloc] init];
    retPlacemark.name = placemark.name;
    retPlacemark.subThoroughfare = placemark.subThoroughfare;
    retPlacemark.thoroughfare = placemark.thoroughfare;
    retPlacemark.locality = placemark.locality;
    retPlacemark.subLocality = placemark.subLocality;
    retPlacemark.administrativeArea = placemark.administrativeArea;
    retPlacemark.subAdministrativeArea = placemark.subAdministrativeArea;
    retPlacemark.postalCode = placemark.postalCode;
    retPlacemark.ISOcountryCode = placemark.ISOcountryCode;
    retPlacemark.country = placemark.country;
    retPlacemark.inlandWater = placemark.inlandWater;
    retPlacemark.ocean = placemark.ocean;
    retPlacemark.areasOfInterest = placemark.areasOfInterest;
    return retPlacemark;
}

- (NSString *)address {
    return [@[NilNullToEmpty(self.subThoroughfare),
              NilNullToEmpty(self.thoroughfare),
              NilNullToEmpty(self.postalCode),
              NilNullToEmpty(self.locality),
              NilNullToEmpty(self.administrativeArea),
              NilNullToEmpty(self.country)]
            componentsJoinedByString:@" "];
}

- (NSString *)street {
    return [@[NilNullToEmpty(self.subThoroughfare),
              NilNullToEmpty(self.thoroughfare)]
            componentsJoinedByString:@" "];
}


@end
