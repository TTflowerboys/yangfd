//
//  CUTECountry.m
//  currant
//
//  Created by Foster Yin on 5/25/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTECountry.h"
#import "CUTECommonMacro.h"

@implementation CUTECountry

+ (NSDictionary *)JSONKeyPathsByPropertyKey
{
    return @{@"code": @"code",
             @"name": @"name",};
}

+ (NSString *)nameOfCode:(NSString *)code {
    return @{@"GB": STR(@"英国"),
             @"CN": STR(@"中国"),
             @"US": STR(@"美国"),
             @"HK": STR(@"香港"),
             }[code];
}

+ (NSString *)countryCodeAndNameOfCode:(NSString *)code {
    return @{@"GB": STR(@"（+44）英国"),
             @"CN": STR(@"（+86）中国"),
             @"US": STR(@"（+1）美国"),
             @"HK": STR(@"（+851）香港"),
             }[code];
}

- (NSString *)name {
    return _name?: [CUTECountry nameOfCode:self.code];
}

- (NSString *)countryCodeAndName {
    return [CUTECountry countryCodeAndNameOfCode:self.code];
}

//FXForm use this to display
- (NSString *)fieldDescription {
    return self.showCountryCode? self.countryCodeAndName: self.name;
}

- (BOOL)isEqual:(id)object {
    if ([object isKindOfClass:[CUTECountry class]]) {
        return [self.code isEqualToString:((CUTECountry *)object).code];
    }
    return NO;

}

@end
