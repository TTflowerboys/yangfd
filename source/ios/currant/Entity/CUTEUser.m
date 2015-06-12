//
//  CUTEUser.m
//  currant
//
//  Created by Foster Yin on 4/9/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEUser.h"
#import "CUTECommonMacro.h"

@implementation CUTEUser

+ (NSDictionary *)JSONKeyPathsByPropertyKey
{
    return @{@"identifier": @"id",
             @"nickname": @"nickname",
             @"countryCode": @"country_code",
             @"country": @"country",
             @"phone": @"phone",
             @"email": @"email",
             @"wechat": @"wechat",
             @"privateContactMethods": @"private_contact_methods",
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
    NSMutableDictionary *params = [NSMutableDictionary dictionaryWithDictionary:@{
                                                                                  @"nickname":self.nickname,
                                                                                  @"country":self.country.code,
                                                                                  @"phone":self.phone,
                                                                                  @"email":self.email,
                                                                                  }];
    if (!IsNilNullOrEmpty(self.wechat)) {
        [params setObject:self.wechat forKey:@"wechat"];
    }
    
    if (!IsArrayNilOrEmpty(self.privateContactMethods)) {
        [params setObject:@"private_contact_methods" forKey:@"unset_fields"];
    }
    else {
        [params setObject:[self.privateContactMethods componentsJoinedByString:@","] forKey:@"private_contact_methods"];
    }
    return params;
}

@end
