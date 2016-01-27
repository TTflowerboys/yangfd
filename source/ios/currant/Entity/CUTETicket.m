//
//  CUTETicket.m
//  currant
//
//  Created by Foster Yin on 4/7/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETicket.h"
#import "CUTECommonMacro.h"
#import <EXTKeyPathCoding.h>

NSString * LocalizedLivingRoomTitle(NSString *title, NSInteger roomCount){
    if (roomCount == 0) {
        return @"Studio";
    }
    return title;
}

@implementation CUTETicket

//Must have full mapping
+ (NSDictionary *)JSONKeyPathsByPropertyKey
{
    return @{@"identifier": @"id",
             @"title": @"title",
             @"status": @"status",
             @"rentType": @"rent_type",
             @"deposit": @"deposit",
             @"holdingDeposit": @"holding_deposit",
             @"landlordType": @"landlord_type",
             @"space": @"space",
             @"price": @"price",
             @"property": @"property",
             @"billCovered": @"bill_covered",
             @"rentAvailableTime": @"rent_available_time",
             @"rentDeadlineTime": @"rent_deadline_time",
             @"minimumRentPeriod": @"minimum_rent_period",
             @"lastModifiedTime": @"last_modified_time",
             @"rentType": @"rent_type",
             @"ticketDescription": @"description",
             @"creatorUser": @"creator_user",
             @"genderRequirement": @"gender_requirement",
             @"minAge": @"min_age",
             @"maxAge": @"max_age",
             @"occupation": @"occupation",
             @"noSmoking": @"no_smoking",
             @"noPet": @"no_pet",
             @"noBaby": @"no_baby",
             @"otherRequirements": @"other_requirements",
             @"currentMaleRoommates": @"current_male_roommates",
             @"currentFemaleRoommates": @"current_female_roommates",
             @"availableRooms": @"available_rooms",
             @"independentBathroom": @"indenpendent_bathroome",
             };
}

+ (NSValueTransformer *)propertyJSONTransformer
{
    return [NSValueTransformer mtl_JSONDictionaryTransformerWithModelClass:[CUTEProperty class]];
}

+ (NSValueTransformer *)rentTypeJSONTransformer
{
    return [NSValueTransformer mtl_JSONDictionaryTransformerWithModelClass:[CUTEEnum class]];
}

+ (NSValueTransformer *)landlordTypeJSONTransformer
{
    return [NSValueTransformer mtl_JSONDictionaryTransformerWithModelClass:[CUTEEnum class]];
}

+ (NSValueTransformer *)minimumRentPeriodJSONTransformer
{
    return [NSValueTransformer mtl_JSONDictionaryTransformerWithModelClass:[CUTETimePeriod class]];
}

+ (NSValueTransformer *)depositJSONTransformer
{
    return [NSValueTransformer mtl_JSONDictionaryTransformerWithModelClass:[CUTECurrency class]];
}

+ (NSValueTransformer *)holdingDepositJSONTransformer
{
    return [NSValueTransformer mtl_JSONDictionaryTransformerWithModelClass:[CUTECurrency class]];
}

+ (NSValueTransformer *)spaceJSONTransformer
{
    return [NSValueTransformer mtl_JSONDictionaryTransformerWithModelClass:[CUTEArea class]];
}

+ (NSValueTransformer *)priceJSONTransformer
{
    return [NSValueTransformer mtl_JSONDictionaryTransformerWithModelClass:[CUTECurrency class]];
}

+ (NSValueTransformer *)occupationJSONTransformer
{
    return [NSValueTransformer mtl_JSONDictionaryTransformerWithModelClass:[CUTEEnum class]];
}

- (void)appendPart:(NSString *)part forString:(NSMutableString *)string {
    if (!IsNilNullOrEmpty(part)) {
        if (string.length > 0) {
            [string appendString:@" "];
            [string appendString:part];
        }
        else {
            [string appendString:part];
        }
    }
}

- (NSString *)titleForDisplay {
    if ([self.title isKindOfClass:[NSString class]] && !IsNilNullOrEmpty(self.title)) {
        return self.title;
    }
    NSMutableString *altTitle = [NSMutableString string];
    if (!IsNilNullOrEmpty(self.property.community)) {
        [self appendPart:self.property.community forString:altTitle];
    }
    else if (self.property.neighborhood && [self.property.neighborhood isKindOfClass:[CUTENeighborhood class]] && !IsNilNullOrEmpty(self.property.neighborhood.name)) {
        CUTENeighborhood *neighborhood = self.property.neighborhood;
        [self appendPart:neighborhood.name forString:altTitle];
    }
    else if (!IsNilNullOrEmpty(self.property.street)) {
        [self appendPart:self.property.street forString:altTitle];
    }

    [self appendPart:(self.property && self.property.bedroomCount)? LocalizedLivingRoomTitle([NSString stringWithFormat:STR(@"%d居室"), self.property.bedroomCount.intValue], self.property.bedroomCount.intValue) : nil forString:altTitle];
    [self appendPart:self.rentType.value? [NSString stringWithFormat:@"%@出租", self.rentType.value]: nil forString:altTitle];

    if (altTitle.length > kTicketTitleMaxCharacterCount) {
        return CONCAT(LocalizedLivingRoomTitle([NSString stringWithFormat:STR(@"%d居室"), self.property.bedroomCount.intValue], self.property.bedroomCount.intValue), [NSString stringWithFormat:@"%@出租", self.rentType.value]);
    }
    else if (altTitle.length == 0) {
        return nil;
    }
    else {
        return altTitle;
    }
}

- (NSString * __nonnull)genderRequirementForDisplay {
    if (self.genderRequirement == nil) {
        return STR(@"不限");
    }
    else {
        if ([self.genderRequirement isEqualToString:@"male"]) {
            return STR(@"男");
        }
        else if ([self.genderRequirement isEqualToString:@"female"]) {
            return STR(@"女");
        }
        else {
            return STR(@"不限");
        }
    }
}

#pragma -mark CUTEModelEditingListenerDelegate

- (id)paramValueForKey:(NSString *)key withValue:(id)value {
    if ([key isEqualToString:@keypath(self.billCovered)]) {
        return value;
    }
    else if ([key isEqualToString:@keypath(self.status)]) {
        return value;
    }
    else if ([key isEqualToString:@keypath(self.property)] && [value isKindOfClass:[CUTEProperty class]]) {
        return [(CUTEProperty *)value identifier];
    }
    else if ([key isEqualToString:@keypath(self.space)] && [value isKindOfClass:[CUTEArea class]]) {
        return [(CUTEArea *)value toParams];
    }
    else if ([key isEqualToString:@keypath(self.price)] && [value isKindOfClass:[CUTECurrency class]]) {
        return [(CUTECurrency *)value toParams];
    }
    else if ([key isEqualToString:@keypath(self.deposit)] && [value isKindOfClass:[CUTECurrency class]]) {
        return [(CUTECurrency *)value toParams];
    }
    else if ([key isEqualToString:@keypath(self.holdingDeposit)] && [value isKindOfClass:[CUTECurrency class]]) {
        return [(CUTECurrency *)value toParams];
    }
    else if ([key isEqualToString:@keypath(self.rentType)] && [value isKindOfClass:[CUTEEnum class]]) {
        return [(CUTEEnum *)value identifier];
    }
    else if ([key isEqualToString:@keypath(self.landlordType)] && [value isKindOfClass:[CUTEEnum class]]) {
        return [(CUTEEnum *)value identifier];
    }
    else if ([key isEqualToString:@keypath(self.rentAvailableTime)]) {
        return value;
    }
    else if ([key isEqualToString:@keypath(self.rentDeadlineTime)]) {
        return value;
    }
    else if ([key isEqualToString:@keypath(self.minimumRentPeriod)] && [value isKindOfClass:[CUTETimePeriod class]]) {
        return [(CUTETimePeriod *)value toParams];
    }
    else if ([key isEqualToString:@keypath(self.title)]) {
        return value;
    }
    else if ([key isEqualToString:@keypath(self.ticketDescription)]) {
        return value;
    }
    else if ([key isEqualToString:@keypath(self.genderRequirement)]) {
        return value;
    }
    else if ([key isEqualToString:@keypath(self.minAge)]) {
        return value;
    }
    else if ([key isEqualToString:@keypath(self.maxAge)]) {
        return value;
    }
    else if ([key isEqualToString:@keypath(self.occupation)] && [value isKindOfClass:[CUTEEnum class]]) {
        return [(CUTEEnum *)value identifier];
    }
    else if ([key isEqualToString:@keypath(self.noSmoking)]) {
        return value;
    }
    else if ([key isEqualToString:@keypath(self.noPet)]) {
        return value;
    }
    else if ([key isEqualToString:@keypath(self.noBaby)]) {
        return value;
    }
    else if ([key isEqualToString:@keypath(self.otherRequirements)]) {
        return value;
    }
    else if ([key isEqualToString:@keypath(self.currentFemaleRoommates)]) {
        return value;
    }
    else if ([key isEqualToString:@keypath(self.currentMaleRoommates)]) {
        return value;
    }
    else if ([key isEqualToString:@keypath(self.availableRooms)]) {
        return value;
    }
    else if ([key isEqualToString:@keypath(self.independentBathroom)]) {
        return value;
    }

    NSAssert(nil, @"[%@|%@|%d] %@", NSStringFromClass([self class]) , NSStringFromSelector(_cmd) , __LINE__ ,key);
    return nil;
}

- (BOOL)isAttributeEqualForKey:(NSString *)key oldValue:(id)oldValue newValue:(id)newValue {

    return [oldValue isEqual:newValue];
}


- (NSDictionary *)toParams {
    NSMutableArray *unsetFields = [NSMutableArray array];
    NSMutableDictionary *params = [NSMutableDictionary dictionary];

    NSMutableDictionary *keysMapping = [NSMutableDictionary dictionaryWithDictionary:[[self class] JSONKeyPathsByPropertyKey]];
    [keysMapping removeObjectForKey:@keypath(self.identifier)];//params don't need id
    [keysMapping removeObjectForKey:@keypath(self.lastModifiedTime)];//no need;
    //special for title
    [keysMapping removeObjectForKey:@keypath(self.title)];
    [keysMapping removeObjectForKey:@keypath(self.property)];
    [keysMapping removeObjectForKey:@keypath(self.creatorUser)];
    //space without value means need remove
    [keysMapping removeObjectForKey:@keypath(self.space)];
    //price and deposit without value means need remove
    [keysMapping removeObjectForKey:@keypath(self.price)];
    [keysMapping removeObjectForKey:@keypath(self.deposit)];
    [keysMapping removeObjectForKey:@keypath(self.holdingDeposit)];

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

    if (self.property && self.property.identifier) {
        [params setObject:self.property.identifier forKey:@"property_id"];
    }

    if (self.space && !IsNilNullOrEmpty(self.space.value)) {
        [params setObject:self.space.toParams forKey:@"space"];
    }
    else {
        [unsetFields addObject:@"space"];
    }

    if (self.price && !IsNilNullOrEmpty(self.price.value)) {
        [params setObject:self.price.toParams forKey:@"price"];
    }
    else {
        [unsetFields addObject:@"price"];
    }

    if (self.deposit && !IsNilNullOrEmpty(self.deposit.value)) {
        [params setObject:self.deposit.toParams forKey:@"deposit"];
    }
    else {
        [unsetFields addObject:@"deposit"];
    }

    if (self.holdingDeposit && !IsNilNullOrEmpty(self.holdingDeposit.value)) {
        [params setObject:self.holdingDeposit.toParams forKey:@"holding_deposit"];
    }
    else {
        [unsetFields addObject:@"holding_deposit"];
    }

    //like createTicket, not set title, will set a default title
    NSString *title = self.titleForDisplay;
    if (title) {
        [params setValue:title forKey:@"title"];
    }

    if (!IsArrayNilOrEmpty(unsetFields)) {
        [params setValue:[unsetFields componentsJoinedByString:@","] forKey:@"unset_fields"];
    }

    return params;
}

@end
