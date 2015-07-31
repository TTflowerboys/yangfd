//
//  CUTEUser.m
//  currant
//
//  Created by Foster Yin on 4/9/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEUser.h"
#import "CUTECommonMacro.h"
#import <EXTKeyPathCoding.h>

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
             @"userTypes": @"user_type",
             @"phoneVerified": @"phone_verified"
             };
}

+ (NSValueTransformer *)countryJSONTransformer
{
    return [NSValueTransformer mtl_JSONDictionaryTransformerWithModelClass:[CUTECountry class]];
}

+ (NSValueTransformer *)userTypesJSONTransformer
{
    return [NSValueTransformer mtl_JSONArrayTransformerWithModelClass:[CUTEEnum class]];
}


- (BOOL)hasRole:(NSString *)role {
    return [self.roles containsObject:role];
}

- (id)paramValueForKey:(NSString *)key withValue:(id)value {
    if ([key isEqualToString:@keypath(self.nickname)]) {
        return value;
    }
    else if ([key isEqualToString:@keypath(self.country)] && [value isKindOfClass:[CUTECountry class]]) {
        return [(CUTECountry *)value ISOcountryCode];
    }
    else if ([key isEqualToString:@keypath(self.phone)]) {
        return value;
    }
    else if ([key isEqualToString:@keypath(self.email)]) {
        return value;
    }
    else if ([key isEqualToString:@keypath(self.wechat)]) {
        return value;
    }
    else if ([key isEqualToString:@keypath(self.privateContactMethods)] && [value isKindOfClass:[NSArray class]] && !IsArrayNilOrEmpty(value)) {
        return [(NSArray *)value componentsJoinedByString:@","];
    }
    
    NSAssert(nil, @"[%@|%@|%d] %@", NSStringFromClass([self class]) , NSStringFromSelector(_cmd) , __LINE__ ,key);
    return nil;
}

- (NSDictionary *)toParams {
    NSMutableDictionary *params = [NSMutableDictionary dictionaryWithDictionary:@{
                                                                                  @"nickname":self.nickname,
                                                                                  @"country":self.country.ISOcountryCode,
                                                                                  @"phone": CONCAT(NilNullToEmpty(self.countryCode), NilNullToEmpty(self.phone)),
                                                                                  @"email":self.email,
                                                                                  }];

    if (!IsNilNullOrEmpty(self.wechat)) {
        [params setObject:self.wechat forKey:@"wechat"];
    }
    
    if (IsArrayNilOrEmpty(self.privateContactMethods)) {
        [params setObject:@"private_contact_methods" forKey:@"unset_fields"];
    }
    else {
        [params setObject:[self.privateContactMethods componentsJoinedByString:@","] forKey:@"private_contact_methods"];
    }
    return params;
}

@end
