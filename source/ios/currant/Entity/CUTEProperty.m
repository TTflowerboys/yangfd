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


@interface CUTEProperty ()
{
    NSMutableDictionary *_updateMarkDictionary;

    NSMutableArray *_deleteMarkArray;
}
@end

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
    return @{DEFAULT_I18N_LOCALE: string};
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
    else if ([key isEqualToString:@keypath(self.name)]) {
        return [self toI18nString:value];
    }
    else if ([key isEqualToString:@keypath(self.propertyDescription)]) {
        return [self toI18nString:self.propertyDescription];
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
        return [self toI18nString:self.street];
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
    return nil;
}


- (NSDictionary *)toParams {
    //unset_fields
    NSMutableArray *unsetFields = [NSMutableArray array];
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

    if (self.country.code) {
        [params setValue:self.country.code forKey:@"country"];
    }

    if (self.city && self.city.identifier) {
        [params setValue:self.city.identifier forKey:@"city"];
    }

    if (!IsArrayNilOrEmpty(self.indoorFacilities)) {
        [params setValue:[[self.indoorFacilities map:^id(CUTEEnum *object) {
            return object.identifier;
        }] componentsJoinedByString:@","] forKey:@"indoor_facility"];
    }
    else {
        [unsetFields addObject:@"indoor_facility"];
    }

    if (!IsArrayNilOrEmpty(self.communityFacilities)) {
        [params setValue:[[self.communityFacilities map:^id(CUTEEnum *object) {
            return object.identifier;
        }] componentsJoinedByString:@","] forKey:@"community_facility"];
    }
    else {
        [unsetFields addObject:@"community_facility"];
    }

    NSArray *realityImages = [self.realityImages select:^BOOL(NSString *object) {
        NSURL *url = [NSURL URLWithString:object];
        return  url && [url isHttpOrHttpsURL];
    }];

    if (!IsArrayNilOrEmpty(realityImages)) {
        [params setValue:@{DEFAULT_I18N_LOCALE:realityImages} forKey:@"reality_images"];
    }
    else {
        [unsetFields addObject:@"reality_images"];
    }

    if (!fequalzero(self.latitude) || !fequalzero(self.longitude)) {
        [params setValue:@(self.latitude) forKey:@"latitude"];
        [params setValue:@(self.longitude) forKey:@"longitude"];
    }
    else {
        [unsetFields addObject:@"latitude"];
        [unsetFields addObject:@"longitude"];
    }

    if (!IsArrayNilOrEmpty(unsetFields)) {
        [params setValue:[unsetFields componentsJoinedByString:@","] forKey:@"unset_fields"];
    }

    return params;
}

- (NSDictionary *)toEditedParams {
    NSCParameterAssert(self.identifier);
    NSMutableDictionary *dic = [NSMutableDictionary dictionary];
    [dic addEntriesFromDictionary:_updateMarkDictionary];

    if (!IsArrayNilOrEmpty(_deleteMarkArray)) {
        [dic setValue:[_deleteMarkArray componentsJoinedByString:@","] forKey:@"unset_fields"];
    }

    if (dic.count > 0) {
        [dic setObject:self.identifier forKey:@"id"];
    }

    return dic;
}

- (void)markPropertyKeyUpdated:(NSString *)propertyKey {
    if (!_updateMarkDictionary) {
        _updateMarkDictionary = [NSMutableDictionary dictionary];
    }

    [_updateMarkDictionary setObject:[self valueForKey:propertyKey] forKey:propertyKey];
}

- (void)markPropertyKeyDeleted:(NSString *)propertyKey{
    if (!_deleteMarkArray) {
        _deleteMarkArray = [NSMutableArray array];
    }
    [_deleteMarkArray addObject:[[[self class] JSONKeyPathsByPropertyKey] objectForKey:propertyKey]];
}

- (void)clearMarks {
    _updateMarkDictionary = nil;
    _deleteMarkArray = nil;
}


- (NSString *)address {
    return [CUTEAddressUtil buildAddress:@[NilNullToEmpty(self.houseName), NilNullToEmpty(self.floor), NilNullToEmpty(self.community), NilNullToEmpty(self.street), NilNullToEmpty(self.city.name), NilNullToEmpty(self.zipcode)]];
}

@end
