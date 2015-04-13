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
             @"rentPeriod": @"lease_period",
             @"depositOption": @"cash_pledge",
             @"space": @"space",
             @"billCovered": @"bill_covered",
             @"rentAvailableTime": @"lease_available_time",
             @"rentType": @"lease_type"
             };
}

- (NSDictionary *)toParams {
    NSMutableDictionary *dic = [NSMutableDictionary dictionary];
    [dic addEntriesFromDictionary:@{@"space":self.space.toParams,
                                    @"bill_covered":@(self.billCovered),
                                    @"price":self.price.toParams,
                                    @"property_id":self.property.identifier
                                    }];
    if (self.depositType) {
        [dic setValue:self.depositType.identifier forKey:@"deposit_type"];
    }
    if (self.rentType) {
        [dic setValue:self.rentType.identifier forKey:@"rent_type"];
    }
    if (self.rentPeriod) {
        [dic setValue:self.rentPeriod forKey:@"rent_period"];
    }

    return dic;
}

@end
