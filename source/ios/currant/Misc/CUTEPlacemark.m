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
    retPlacemark.postalCode = placemark.postalCode;
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
    NSDictionary *location = [result objectForKey:@"geometry"][@"location"];
    placemark.subThoroughfare = [CUTEPlacemark getComponentByType:@"street_number" fromCompnents:components];
    placemark.thoroughfare = [CUTEPlacemark getComponentByType:@"route" fromCompnents:components];
    placemark.subLocality = [CUTEPlacemark getComponentByType:@"sublocality" fromCompnents:components];
    CUTECountry *country = [CUTECountry new];
    country.code = [CUTEPlacemark getISOCountryCodefromCompnents:components];
    CUTECity *city = [CUTECity new];
    city.name = [CUTEPlacemark getComponentByType:@"locality" fromCompnents:components];
    placemark.city = city;
    placemark.administrativeArea = [CUTEPlacemark getComponentByType:@"administrative_area_level_1" fromCompnents:components];
    placemark.country = country;
    placemark.street = CONCAT(AddressPart([CUTEPlacemark getComponentByType:@"street_number" fromCompnents:components]), AddressPart([CUTEPlacemark getComponentByType:@"route" fromCompnents:components]), AddressPart([CUTEPlacemark getComponentByType:@"neighborhood" fromCompnents:components]));
    placemark.postalCode = [CUTEPlacemark getComponentByType:@"postal_code" fromCompnents:components];
    if (location) {
        placemark.location = [[CLLocation alloc] initWithLatitude:[location[@"lat"] doubleValue] longitude:[location[@"lng"] doubleValue]];
    }
    return placemark;
}


- (NSString *)address {
    return CONCAT(AddressPart(self.street),
                  AddressPart(self.city.name),
                  AddressPart(self.postalCode),
                  AddressPart(self.country.name));
}


@end
