//
//  CUTEEnum.m
//  currant
//
//  Created by Foster Yin on 4/6/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEEnum.h"
#import "CUTECommonMacro.h"

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

+ (Class)classForParsingJSONDictionary:(NSDictionary *)JSONDictionary
{
    return [self class];
}

//FXForm use this to display
- (NSString *)fieldDescription {
    return self.value;
}

- (BOOL)isEqual:(CUTEEnum *)object {
    if ([object isKindOfClass:[self class]]) {
        return [self.identifier isEqualToString:[object identifier]];
    }
    else {
      return NO;
    }
}

@end
