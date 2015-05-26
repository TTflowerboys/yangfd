//
//  CUTETicket.m
//  currant
//
//  Created by Foster Yin on 4/7/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETicket.h"
#import "CUTECommonMacro.h"

@implementation CUTETicket

+ (NSDictionary *)JSONKeyPathsByPropertyKey
{
    return @{@"identifier": @"id",
             @"status": @"status",
             @"rentPeriod": @"rent_period",
             @"rentType": @"rent_type",
             @"depositType": @"deposit_type",
             @"space": @"space",
             @"price": @"price",
             @"billCovered": @"bill_covered",
             @"rentAvailableTime": @"rent_available_time",
             @"lastModifiedTime": @"last_modified_time",
             @"rentType": @"rent_type",
             @"ticketDescription": @"description"
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

+ (NSValueTransformer *)rentPeriodJSONTransformer
{
    return [NSValueTransformer mtl_JSONDictionaryTransformerWithModelClass:[CUTERentPeriod class]];
}

+ (NSValueTransformer *)depositTypeJSONTransformer
{
    return [NSValueTransformer mtl_JSONDictionaryTransformerWithModelClass:[CUTEEnum class]];
}

+ (NSValueTransformer *)spaceJSONTransformer
{
    return [NSValueTransformer mtl_JSONDictionaryTransformerWithModelClass:[CUTEArea class]];
}

+ (NSValueTransformer *)priceJSONTransformer
{
    return [NSValueTransformer mtl_JSONDictionaryTransformerWithModelClass:[CUTECurrency class]];
}

- (NSString *)titleForDisplay {
    if ([self.title isKindOfClass:[NSString class]] && !IsNilNullOrEmpty(self.title)) {
        return self.title;
    }
    NSString *altTitle = nil;
    if (self.property && self.property.bedroomCount > 0 && self.rentType)
    {
        altTitle = [NSString stringWithFormat:@"%d居室 %@出租", self.property.bedroomCount, self.rentType.value];
    }
    else if (self.property && self.rentType && self.property.street) {
        altTitle = [NSString stringWithFormat:@"%@ %@出租", self.property.street, self.rentType.value];
    }
    else if (self.property && self.rentType) {
        altTitle = [NSString stringWithFormat:@"%@出租", self.rentType.value];
    }

    if (altTitle.length > kTicketTitleMaxCharacterCount) {
        altTitle = [NSString stringWithFormat:@"%@出租", self.rentType.value];
    }
    return altTitle;
}

- (NSDictionary *)toParams {
    NSMutableDictionary *dic = [NSMutableDictionary dictionary];
    [dic addEntriesFromDictionary:@{
                                    @"bill_covered":@(self.billCovered),
                                    }];
    if (self.status) {
        [dic setValue:self.status forKey:@"status"];
    }
    if (self.property && self.property.identifier) {
        [dic setValue:self.property.identifier forKey:@"property_id"];
    }
    if (self.space) {
        [dic setValue:self.space.toParams forKey:@"space"];
    }
    if (self.price) {
        [dic setValue:self.price.toParams forKey:@"price"];
    }
    if (self.depositType) {
        [dic setValue:self.depositType.identifier forKey:@"deposit_type"];
    }
    if (self.rentType) {
        [dic setValue:self.rentType.identifier forKey:@"rent_type"];
    }
    if (self.rentAvailableTime) {
        [dic setValue:[NSNumber numberWithLong:self.rentAvailableTime] forKey:@"rent_available_time"];
    }

    if (self.rentPeriod && ![self.rentPeriod isEqual:[CUTERentPeriod negotiableRentPeriod]]) {
        [dic setValue:self.rentPeriod.identifier forKey:@"rent_period"];
    }

    NSString *title = self.titleForDisplay;
    if (title) {
        [dic setValue:title forKey:@"title"];
    }

    if (self.ticketDescription) {
        [dic setValue:self.ticketDescription forKey:@"description"];
    }

    return dic;
}

@end
