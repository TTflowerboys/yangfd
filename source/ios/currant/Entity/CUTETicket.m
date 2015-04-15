//
//  CUTETicket.m
//  currant
//
//  Created by Foster Yin on 4/7/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETicket.h"

@implementation CUTETicket

+ (NSDictionary *)JSONKeyPathsByPropertyKey
{
    return @{@"identifier": @"id",
             @"status": @"status",
             @"rentPeriod": @"rent_period",
             @"depositType": @"deposit_type",
             @"space": @"space",
             @"billCovered": @"bill_covered",
             @"rentAvailableTime": @"rent_available_time",
             @"rentType": @"rent_type"
             };
}

- (NSDictionary *)toParams {
    NSMutableDictionary *dic = [NSMutableDictionary dictionary];
    [dic addEntriesFromDictionary:@{
                                    @"bill_covered":@(self.billCovered),
                                    @"property_id":self.property.identifier
                                    }];
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
        [dic setValue:[NSNumber numberWithLong:[self.rentAvailableTime timeIntervalSince1970]] forKey:@"rent_available_time"];
    }
    if (self.rentPeriod) {
        [dic setValue:self.rentPeriod forKey:@"rent_period"];
    }

    if (!self.title) {
        self.title = [CUTEI18n i18nWithValue:[NSString stringWithFormat:@"%d居室 %@出租", self.property.bedroomCount, self.rentType.value]];
    }
    [dic setValue:self.title.toParams forKey:@"title"];

    if (self.ticketDescription) {
        [dic setValue:self.ticketDescription.toParams forKey:@"description"];
    }

    return dic;
}

@end
