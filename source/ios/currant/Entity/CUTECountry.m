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
    return @{@"ISOcountryCode": @"code",
             @"name": @"name",};
}

+ (NSString *)nameOfISOcountryCode:(NSString *)code {
    return @{@"GB": STR(@"英国"),
             @"CN": STR(@"中国"),
             @"US": STR(@"美国"),
             @"HK": STR(@"香港"),
             }[code];
}

+ (NSString *)countryCodeAndNameOfISOcountryCode:(NSString *)code {
    return @{@"GB": STR(@"（+44）英国"),
             @"CN": STR(@"（+86）中国"),
             @"US": STR(@"（+1）美国"),
             @"HK": STR(@"（+851）香港"),
             }[code];
}

+ (NSString *)countryCodeOfISOcountryCode:(NSString *)code {
    return @{@"GB": @"+44",
             @"CN": @"+86",
             @"US": @"+1",
             @"HK": @"+851",
             }[code];
}

- (NSString *)name {
    return _name?: [CUTECountry nameOfISOcountryCode:self.ISOcountryCode];
}

- (NSString *)countryCode {
    return [CUTECountry countryCodeOfISOcountryCode:self.ISOcountryCode];
}

- (NSString *)countryCodeAndName {
    return [CUTECountry countryCodeAndNameOfISOcountryCode:self.ISOcountryCode];
}

//FXForm use this to display
- (NSString *)fieldDescription {
    return self.showCountryCode? self.countryCodeAndName: self.name;
}

- (BOOL)isEqual:(id)object {
    if ([object isKindOfClass:[CUTECountry class]]) {
        return [self.ISOcountryCode isEqualToString:((CUTECountry *)object).ISOcountryCode];
    }
    return NO;

}

@end
