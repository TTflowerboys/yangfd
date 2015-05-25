//
//  CUTECity.m
//  currant
//
//  Created by Foster Yin on 5/25/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTECity.h"
#import "CUTECommonMacro.h"

@implementation CUTECity

+ (NSDictionary *)JSONKeyPathsByPropertyKey
{
    return @{@"identifier": @"id",
             @"name": @"name",
             @"admin1": @"admin1",
             @"country": @"country"};
}

//FXForm use this to display
- (NSString *)fieldDescription {
    if (!IsNilNullOrEmpty(self.admin1) && [self.country isEqualToString:@"US"]) {
        return CONCAT(self.name, @" ", self.admin1);
    }
    else {
        return self.name;
    }
}

- (BOOL)isEqual:(CUTECity *)object {
    if ([object isKindOfClass:[self class]]) {
        return [self.identifier isEqualToString:[object identifier]];
    }
    else {
        return false;
    }
}

@end
