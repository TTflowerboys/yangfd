//
//  CUTEUser.m
//  currant
//
//  Created by Foster Yin on 4/9/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEUser.h"

@implementation CUTEUser

+ (NSDictionary *)JSONKeyPathsByPropertyKey
{
    return @{@"identifier": @"id",
             @"nickname": @"nickname",
             @"phone": @"phone",
             @"email": @"email",
             };
}

- (NSDictionary *)toParams {
    return @{
             @"nickname":self.nickname,
             @"phone":self.phone,
             @"email":self.email,
             };
}

@end
