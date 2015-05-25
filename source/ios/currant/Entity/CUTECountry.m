//
//  CUTECountry.m
//  currant
//
//  Created by Foster Yin on 5/25/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTECountry.h"

@implementation CUTECountry

+ (NSDictionary *)JSONKeyPathsByPropertyKey
{
    return @{@"code": @"code",
             @"name": @"name",};
}

//FXForm use this to display
- (NSString *)fieldDescription {
    return self.name;
}

- (BOOL)isEqual:(id)object {
    if ([object isKindOfClass:[CUTECountry class]]) {
        return [self.code isEqualToString:((CUTECountry *)object).code];
    }
    return NO;

}

@end
