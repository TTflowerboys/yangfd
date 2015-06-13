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
#import <NSArray+ObjectiveSugar.h>
#import <MapKit/MapKit.h>
#import "NSURL+CUTE.h"
#import "CUTEHouseType.h"
#import "CUTEAddressUtil.h"
#import <EXTKeyPathCoding.h>
#import "EXTKeyPathCoding.h"

@implementation CUTEProperty

+ (NSDictionary *)JSONKeyPathsByPropertyKey
{
    return @{@"identifier": @"id",
             @"propertyType": @"property_type",
             @"realityImages": @"reality_images",
             @"cover": @"cover",
             @"name": @"name",
             @"country": @"country",
             @"city": @"city",
             @"street": @"street",
             @"zipcode": @"zipcode",
             @"community": @"community",
             @"floor": @"floor",
             @"houseName": @"house_name",
             @"latitude": @"latitude",
             @"longitude": @"longitude",
             @"propertyDescription": @"description",
             @"bedroomCount": @"bedroom_count",
             @"livingroomCount": @"living_room_count",
             @"bathroomCount": @"bathroom_count",
             @"space": @"space",
             @"status": @"status",
             @"mainHouseTypes": @"main_house_types",
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
    return [NSValueTransformer mtl_JSONDictionaryTransformerWithModelClass:[CUTECountry class]];
}

+ (NSValueTransformer *)cityJSONTransformer
{
    return [NSValueTransformer mtl_JSONDictionaryTransformerWithModelClass:[CUTECity class]];
}

+ (NSValueTransformer *)spaceJSONTransformer
{
    return [NSValueTransformer mtl_JSONDictionaryTransformerWithModelClass:[CUTEArea class]];
}

+ (NSValueTransformer *)mainHouseTypesJSONTransformer
{
    return [NSValueTransformer mtl_JSONArrayTransformerWithModelClass:[CUTEHouseType class]];
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
    if (!string) {

    }
    return !IsNilOrNull(string)? @{DEFAULT_I18N_LOCALE: string}: nil;
}

- (id)paramValueForKey:(NSString *)key withValue:(id)value {
    if ([key isEqualToString:@keypath(self.bedroomCount)]) {
        return value;
    }
    else if ([key isEqualToString:@keypath(self.livingroomCount)]) {
        return value;
    }
    else if ([key isEqualToString:@keypath(self.bathroomCount)]) {
        return value;
    }
    else if ([key isEqualToString:@keypath(self.zipcode)]) {
        return value;
    }
    else if ([key isEqualToString:@keypath(self.status)]) {
        return value;
    }
    else if ([key isEqualToString:@keypath(self.name)]) {
        return [self toI18nString:value];
    }
    else if ([key isEqualToString:@keypath(self.propertyDescription)]) {
        return [self toI18nString:value];
    }
    else if ([key isEqualToString:@keypath(self.propertyType)] && [value isKindOfClass:[CUTEEnum class]]) {
        return [(CUTEEnum *)value identifier];
    }
    else if ([key isEqualToString:@keypath(self.space)] && [value isKindOfClass:[CUTEArea class]]) {
        return [(CUTEArea *)value toParams];
    }
    else if ([key isEqualToString:@keypath(self.houseName)]) {
        return [self toI18nString:value];
    }
    else if ([key isEqualToString:@keypath(self.community)]) {
        return [self toI18nString:value];
    }
    else if ([key isEqualToString:@keypath(self.floor)]) {
        return [self toI18nString:value];
    }
    else if ([key isEqualToString:@keypath(self.street)]) {
        return [self toI18nString:value];
    }
    else if ([key isEqualToString:@keypath(self.country)] && [value isKindOfClass:[CUTECountry class]]) {
        return [(CUTECountry *)value code];
    }
    else if ([key isEqualToString:@keypath(self.city)] && [value isKindOfClass:[CUTECity class]]) {
        return [(CUTECity *)value identifier];
    }
    else if ([key isEqualToString:@keypath(self.indoorFacilities)] && [value isKindOfClass:[NSArray class]]) {
        return [[(NSArray *)value map:^id(CUTEEnum *object) {
            return object.identifier;
        }] componentsJoinedByString:@","];
    }
    else if ([key isEqualToString:@keypath(self.communityFacilities)] && [value isKindOfClass:[NSArray class]]) {
        return [[(NSArray *)value map:^id(CUTEEnum *object) {
            return object.identifier;
        }] componentsJoinedByString:@","];
    }
    else if ([key isEqualToString:@keypath(self.cover)]) {
        return @{DEFAULT_I18N_LOCALE: value};
    }
    else if ([key isEqualToString:@keypath(self.realityImages)] && [value isKindOfClass:[NSArray class]]) {
        NSArray *realityImages = [(NSArray *)value select:^BOOL(NSString *object) {
            NSURL *url = [NSURL URLWithString:object];
            return  url && [url isHttpOrHttpsURL];
        }];
        return @{DEFAULT_I18N_LOCALE: realityImages};
    }
    else if ([key isEqualToString:@keypath(self.latitude)] && [value isKindOfClass:[NSNumber class]]) {
        return value;
    }
    else if ([key isEqualToString:@keypath(self.longitude)] && [value isKindOfClass:[NSNumber class]]) {
        return value;
    }
    NSAssert(nil, @"[%@|%@|%d] %@", NSStringFromClass([self class]) , NSStringFromSelector(_cmd) , __LINE__ ,key);
    return nil;
}

- (NSDictionary *)toParams {
    //unset_fields
    NSMutableArray *unsetFields = [NSMutableArray array];
    NSMutableDictionary *params =
    [NSMutableDictionary dictionaryWithDictionary:nil];

    NSMutableDictionary *keysMapping = [NSMutableDictionary dictionaryWithDictionary:[[self class] JSONKeyPathsByPropertyKey]];
    [keysMapping removeObjectForKey:@keypath(self.identifier)];//params don't need id
    [keysMapping removeObjectForKey:@keypath(self.mainHouseTypes)];//no need
    //special for lat and lng
    [keysMapping removeObjectForKey:@keypath(self.latitude)];
    [keysMapping removeObjectForKey:@keypath(self.longitude)];


    [keysMapping enumerateKeysAndObjectsUsingBlock:^(NSString *key, id obj, BOOL *stop) {
        NSString *paramKey = obj;
        id fieldValue = [self valueForKey:key];
        if (fieldValue && ![fieldValue isEqual:[NSNull null]]) {
            id paramValue = [self paramValueForKey:key withValue:fieldValue];
            NSAssert(paramValue, @"[%@|%@|%d] %@", NSStringFromClass([self class]) , NSStringFromSelector(_cmd) , __LINE__ ,@"");
            if (paramValue) {
                [params setObject:paramValue forKey:paramKey];
            }
        }
        else {
            [unsetFields addObject:paramKey];
        }
    }];

    if (self.latitude && self.longitude) {
        [params setValue:self.latitude forKey:@"latitude"];
        [params setValue:self.longitude forKey:@"longitude"];
    }
    else {
        [unsetFields addObject:@"latitude"];
        [unsetFields addObject:@"longitude"];
    }

    //here user not set the cover, just set the first image
    if (!IsArrayNilOrEmpty(self.realityImages) && IsNilNullOrEmpty(self.cover)) {
        [params setObject:[self.realityImages find:^BOOL(id object) {
            NSURL *url = [NSURL URLWithString:object];
            return  url && [url isHttpOrHttpsURL];
        }] forKey:@"cover"];
    }

    if (!IsArrayNilOrEmpty(unsetFields)) {
        [params setValue:[unsetFields componentsJoinedByString:@","] forKey:@"unset_fields"];
    }

    return params;
}

- (NSString *)address {
    return [CUTEAddressUtil buildAddress:@[NilNullToEmpty(self.houseName), NilNullToEmpty(self.floor), NilNullToEmpty(self.community), NilNullToEmpty(self.street), NilNullToEmpty(self.city.name), NilNullToEmpty(self.zipcode)]];
}

@end
