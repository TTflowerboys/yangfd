//
//  CUTEEnum.m
//  currant
//
//  Created by Foster Yin on 4/6/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEEnum.h"
#import "CUTECityEnum.h"

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
    if (JSONDictionary && [JSONDictionary count] > 0)
    {
        if ([[JSONDictionary objectForKey:@"type"] isEqualToString:@"city"])
        {
            return [CUTECityEnum class];
        }
    }
    return [self class];
}

//FXForm use this to display
- (NSString *)fieldDescription {
    return self.value;
}

- (BOOL)isEqual:(id)object {
    if ([object isKindOfClass:[self class]]) {
      return [self.slug isEqual:[object slug]];
    }
    else {
      return false;
    }
}

@end
