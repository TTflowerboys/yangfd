//
//  CUTEProperty.m
//  currant
//
//  Created by Foster Yin on 4/7/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEProperty.h"
#import "CUTECommonMacro.h"
#import "CUTEEnum.h"
#import "CUTECityEnum.h"
#import <NSArray+Frankenstein.h>
#import <MapKit/MapKit.h>

@implementation CUTEProperty

+ (NSDictionary *)JSONKeyPathsByPropertyKey
{
    //TODO finish mapping
    return @{@"identifier": @"id",
             @"propertyType": @"property_type",
             @"realityImages": @"reality_images",
             @"name": @"name",
             @"country": @"country",
             @"city": @"city",
             @"street": @"street",
             @"zipcode": @"zipcode",
             @"propertyDescription": @"description",
             @"bedroomCount": @"bedroom_count",
             @"space": @"space",
             @"status": @"status",
             @"indoorFacilities": @"indoor_facility",
             @"communityFacilities": @"community_facility"
             };
}

+ (NSValueTransformer *)propertyTypeJSONTransformer
{
    return [NSValueTransformer mtl_JSONDictionaryTransformerWithModelClass:[CUTEEnum class]];
}

+ (NSValueTransformer *)countryJSONTransformer
{
    return [NSValueTransformer mtl_JSONDictionaryTransformerWithModelClass:[CUTEEnum class]];
}

+ (NSValueTransformer *)cityJSONTransformer
{
    return [NSValueTransformer mtl_JSONDictionaryTransformerWithModelClass:[CUTECityEnum class]];
}

+ (NSValueTransformer *)nameJSONTransformer
{
    return [NSValueTransformer mtl_JSONDictionaryTransformerWithModelClass:[CUTEI18n class]];
}

+ (NSValueTransformer *)locationJSONTransformer
{
    return [MTLValueTransformer reversibleTransformerWithForwardBlock:^(NSDictionary *locationDict) {
        CLLocationDegrees latitude = [locationDict[@"latitude"] doubleValue];
        CLLocationDegrees longitude = [locationDict[@"longitude"] doubleValue];

        return [NSValue valueWithMKCoordinate:CLLocationCoordinate2DMake(latitude, longitude)];
    } reverseBlock:^(CLLocation *location) {
        return @{@"latitude": @(location.coordinate.latitude), @"longitude": @(location.coordinate.longitude)};
    }];
}

+ (NSValueTransformer *)streetJSONTransformer
{
    return [NSValueTransformer mtl_JSONDictionaryTransformerWithModelClass:[CUTEI18n class]];
}

+ (NSValueTransformer *)propertyDescriptionJSONTransformer
{
    return [NSValueTransformer mtl_JSONDictionaryTransformerWithModelClass:[CUTEI18n class]];
}

+ (NSValueTransformer *)spaceSONTransformer
{
    return [NSValueTransformer mtl_JSONDictionaryTransformerWithModelClass:[CUTEArea class]];
}

+ (NSValueTransformer *)indoorFacilitiesJSONTransformer
{
    return [NSValueTransformer mtl_JSONArrayTransformerWithModelClass:[CUTEEnum class]];
}

+ (NSValueTransformer *)communityFacilitiesJSONTransformer
{
    return [NSValueTransformer mtl_JSONArrayTransformerWithModelClass:[CUTEEnum class]];
}

- (NSDictionary *)toParams {
    NSMutableDictionary *params =
    [NSMutableDictionary dictionaryWithDictionary:@{@"bedroom_count": @(self.bedroomCount),
                                                    @"zipcode": self.zipcode? self.zipcode: @"",
                                                    }];
    if (self.name && self.name.toParams) {
        [params setValue:self.name.toParams forKey:@"name"];
    }
    if (self.propertyDescription && self.propertyDescription.toParams) {
        [params setValue:self.propertyDescription.toParams forKey:@"description"];
    }
    if (self.propertyType) {
        [params setValue:self.propertyType.identifier forKey:@"property_type"];
    }
    if (self.street && self.street.toParams) {
        [params setValue:self.street.toParams forKey:@"street"];
    }
    if (self.country && self.country.identifier) {
        [params setValue:self.country.identifier forKey:@"country"];
    }
    if (self.city && self.city.identifier) {
        [params setValue:self.city.identifier forKey:@"city"];
    }
    if (!IsArrayNilOrEmpty(self.indoorFacilities)) {
        [params setValue:[[self.indoorFacilities map:^id(CUTEEnum *object) {
            return object.identifier;
        }] componentsJoinedByString:@","] forKey:@"indoor_facility"];
    }
    if (!IsArrayNilOrEmpty(self.communityFacilities)) {
        [params setValue:[[self.communityFacilities map:^id(CUTEEnum *object) {
            return object.identifier;
        }] componentsJoinedByString:@","] forKey:@"community_facility"];
    }
    if (!IsArrayNilOrEmpty(self.realityImages)) {

        [params setValue:@{DEFAULT_I18N_LOCALE:self.realityImages} forKey:@"reality_images"];
    }
    if (self.location) {
        [params setValue:@(self.location.coordinate.latitude) forKey:@"latitude"];
        [params setValue:@(self.location.coordinate.longitude) forKey:@"longitude"];
    }
    return params;
}

- (NSString *)address {
    return [@[NilNullToEmpty(self.street.value),
              NilNullToEmpty(self.zipcode),
              NilNullToEmpty(self.city.value),
              NilNullToEmpty(self.country.value)]
            componentsJoinedByString:@" "];
}

@end
