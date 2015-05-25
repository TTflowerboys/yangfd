//
//  CUTECity.m
//  currant
//
//  Created by Foster Yin on 5/25/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTECity.h"

@implementation CUTECity

+ (NSDictionary *)JSONKeyPathsByPropertyKey
{
    return @{@"identifier": @"id",
             @"name": @"name",
             @"country": @"country"};
}

//FXForm use this to display
- (NSString *)fieldDescription {
    return self.name;
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
