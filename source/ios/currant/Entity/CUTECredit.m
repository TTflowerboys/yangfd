//
//  CUTECredit.m
//  currant
//
//  Created by Foster Yin on 7/13/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTECredit.h"

@implementation CUTECredit

+ (NSDictionary *)JSONKeyPathsByPropertyKey
{
    return @{@"identifier": @"id",
             @"tag": @"tag",
             @"type": @"type",
             @"amount": @"amount",
             };
}

@end
