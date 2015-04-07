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

@end
