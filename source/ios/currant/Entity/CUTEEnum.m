//
//  CUTEEnum.m
//  currant
//
//  Created by Foster Yin on 4/6/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEEnum.h"

@implementation CUTEEnum

+ (NSDictionary *)JSONKeyPathsByPropertyKey
{
    return @{@"identifier": @"id",
             @"slug": @"slug",
             @"status": @"status",
             @"type": @"type",
             @"time": @"time",
             @"value": @"value"};
}

@end
