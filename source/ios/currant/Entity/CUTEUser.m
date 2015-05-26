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
             @"countryCode": @"country_code",
             @"country": @"country",
             @"phone": @"phone",
             @"email": @"email",
             @"roles": @"role",
             };
}

+ (NSValueTransformer *)countryJSONTransformer
{
    return [NSValueTransformer mtl_JSONDictionaryTransformerWithModelClass:[CUTECountry class]];
}


- (BOOL)hasRole:(NSString *)role {
    return [self.roles containsObject:role];
}

- (NSDictionary *)toParams {
    return @{
             @"nickname":self.nickname,
             @"country":self.country.code,
             @"phone":self.phone,
             @"email":self.email,
             };
}

@end
