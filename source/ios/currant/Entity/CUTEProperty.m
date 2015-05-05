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
#import <NSArray+ObjectiveSugar.h>
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
             @"community": @"community",
             @"floor": @"floor",
             @"houseName": @"house_name",
             @"propertyDescription": @"description",
             @"bedroomCount": @"bedroom_count",
             @"livingroomCount": @"living_room_count",
             @"bathroomCount": @"bathroom_count",
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

+ (NSValueTransformer *)locationJSONTransformer
{
    return [MTLValueTransformer reversibleTransformerWithForwardBlock:^(NSDictionary *locationDict) {
        if (locationDict && [locationDict isKindOfClass:[NSDictionary class]] && [locationDict objectForKey:@"latitude"] && [locationDict objectForKey:@"longitude"]) {

            CLLocationDegrees latitude = [locationDict[@"latitude"] doubleValue];
            CLLocationDegrees longitude = [locationDict[@"longitude"] doubleValue];

            return [NSValue valueWithMKCoordinate:CLLocationCoordinate2DMake(latitude, longitude)];
        }
        else {
            return [NSValue new];
        }
    } reverseBlock:^(CLLocation *location) {
        if (location && [location isKindOfClass:[CLLocation class]]) {
            return @{@"latitude": @(location.coordinate.latitude), @"longitude": @(location.coordinate.longitude)};
        }
        else {
            return @{};
        }
    }];
}

+ (NSValueTransformer *)spaceJSONTransformer
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

- (NSDictionary *)toI18nString:(NSString *)string {
    return @{DEFAULT_I18N_LOCALE: string};
}

- (NSDictionary *)toParams {
    NSMutableDictionary *params =
    [NSMutableDictionary dictionaryWithDictionary:@{@"bedroom_count": @(self.bedroomCount),
                                                    @"living_room_count": @(self.livingroomCount),
                                                    @"bathroom_count": @(self.bathroomCount),
                                                    @"zipcode": self.zipcode? self.zipcode: @"",
                                                    }];
    if (self.name && self.name) {
        [params setValue:[self toI18nString:self.name] forKey:@"name"];
    }
    if (self.propertyDescription && self.propertyDescription) {
        [params setValue:[self toI18nString:self.propertyDescription] forKey:@"description"];
    }
    if (self.propertyType) {
        [params setValue:self.propertyType.identifier forKey:@"property_type"];
    }

    if (self.houseName) {
        [params setValue:[self toI18nString:self.houseName] forKey:@"house_name"];
    }
    if (self.community) {
        [params setValue:[self toI18nString:self.community] forKey:@"community"];
    }
    if (self.floor) {
        [params setValue:[self toI18nString:self.floor] forKey:@"floor"];
    }
    if (self.street) {
        [params setValue:[self toI18nString:self.street] forKey:@"street"];
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
    if (self.location && [self.location isKindOfClass:[CLLocation class]]) {
        [params setValue:@(self.location.coordinate.latitude) forKey:@"latitude"];
        [params setValue:@(self.location.coordinate.longitude) forKey:@"longitude"];
    }
    return params;
}

- (NSDictionary *)toRealityImagesParams {
    NSMutableDictionary *params =
    [NSMutableDictionary dictionaryWithDictionary:@{}];
    if (!IsArrayNilOrEmpty(self.realityImages)) {

        [params setValue:@{DEFAULT_I18N_LOCALE:self.realityImages} forKey:@"reality_images"];
    }
    return params;
}

#define AddressPart(part) IsNilNullOrEmpty(part)? @"": CONCAT(part, @" ")

- (NSString *)address {
    return CONCAT(AddressPart(self.houseName),
                  AddressPart(self.floor),
                  AddressPart(self.community),
                  AddressPart(self.street),
                  AddressPart(self.zipcode),
                  AddressPart(self.city.value),
                  AddressPart(self.country.value));
}

@end
