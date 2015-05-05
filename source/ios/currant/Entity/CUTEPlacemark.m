//
//  CUTEPlaceMark.m
//  currant
//
//  Created by Foster Yin on 4/4/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEPlacemark.h"
#import "CUTECommonMacro.h"
#import <NSArray+ObjectiveSugar.h>

@interface CUTEPlacemark ()

@property (nonatomic, copy) NSString *name; // eg. Apple Inc.
@property (nonatomic, copy) NSString *thoroughfare; // street address, eg. 1 Infinite Loop
@property (nonatomic, copy) NSString *subThoroughfare; // eg. 1
@property (nonatomic, copy) NSString *subLocality; // neighborhood, common name, eg. Mission District
@property (nonatomic, copy) NSString *administrativeArea; // state, eg. CA
@property (nonatomic, copy) NSString *subAdministrativeArea; // county, eg. Santa Clara
@property (nonatomic, copy) NSString *ISOcountryCode; // eg. US
@property (nonatomic, copy) NSString *inlandWater; // eg. Lake Tahoe
@property (nonatomic, copy) NSString *ocean; // eg. Pacific Ocean
@property (nonatomic, copy) NSArray *areasOfInterest; // eg. Golden Gate Park

@end

@implementation CUTEPlacemark

+ (CUTEPlacemark *)placeMarkWithCLPlaceMark:(CLPlacemark *)placemark {
    CUTEPlacemark *retPlacemark = [[CUTEPlacemark alloc] init];
    retPlacemark.name = placemark.name;
    retPlacemark.subThoroughfare = placemark.subThoroughfare;
    retPlacemark.thoroughfare = placemark.thoroughfare;
    retPlacemark.street = [@[NilNullToEmpty(placemark.subThoroughfare), NilNullToEmpty(placemark.thoroughfare)] componentsJoinedByString:@" "];
    retPlacemark.subLocality = placemark.subLocality;
    retPlacemark.administrativeArea = placemark.administrativeArea;
    retPlacemark.subAdministrativeArea = placemark.subAdministrativeArea;
    retPlacemark.zipcode = placemark.postalCode;
    retPlacemark.ISOcountryCode = placemark.ISOcountryCode;
    retPlacemark.inlandWater = placemark.inlandWater;
    retPlacemark.ocean = placemark.ocean;
    retPlacemark.areasOfInterest = placemark.areasOfInterest;
    return retPlacemark;
}

+ (NSString *)getComponentByType:(NSString *)type fromCompnents:(NSArray *)components {
    NSArray *array = [components select:^BOOL(NSDictionary *object) {
        NSArray *types = [object objectForKey:@"types"];
        return [types containsObject:type];
    }];
    if (!IsArrayNilOrEmpty(array)) {
        return array[0][@"long_name"];
    }
    return nil;;
}

+ (NSString *)getISOCountryCodefromCompnents:(NSArray *)components {
    NSArray *array = [components select:^BOOL(NSDictionary *object) {
        NSArray *types = [object objectForKey:@"types"];
        return [types containsObject:@"country"];
    }];
    if (!IsArrayNilOrEmpty(array)) {
        return array[0][@"short_name"];
    }
    return nil;;
}

+ (CUTEPlacemark *)placeMarkWithGoogleResult:(NSDictionary *)result {
    CUTEPlacemark *placemark = [CUTEPlacemark new];
    NSArray *components = [result objectForKey:@"address_components"];
    placemark.subThoroughfare = [CUTEPlacemark getComponentByType:@"street_number" fromCompnents:components];
    placemark.thoroughfare = [CUTEPlacemark getComponentByType:@"route" fromCompnents:components];
    placemark.subLocality = [CUTEPlacemark getComponentByType:@"sublocality" fromCompnents:components];
    placemark.city = [CUTECityEnum cityWithValue:[CUTEPlacemark getComponentByType:@"locality" fromCompnents:components]];
    placemark.administrativeArea = [CUTEPlacemark getComponentByType:@"administrative_area_level_1" fromCompnents:components];
    CUTEEnum *country = [CUTEEnum new];
    country.type = @"country";
    country.slug = [CUTEPlacemark getISOCountryCodefromCompnents:components];
    country.value = [CUTEPlacemark getComponentByType:@"country" fromCompnents:components];
    placemark.country = country;
    placemark.zipcode = [CUTEPlacemark getComponentByType:@"postal_code" fromCompnents:components];
    return placemark;
}

- (NSString *)address {
    return [@[NilNullToEmpty(self.street),
              NilNullToEmpty(self.zipcode),
              NilNullToEmpty(self.city.value),
              NilNullToEmpty(self.country.value)]
            componentsJoinedByString:@" "];
}


@end
