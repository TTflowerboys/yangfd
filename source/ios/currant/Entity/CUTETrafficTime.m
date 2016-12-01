//
//  CUTETrafficTime.m
//  currant
//
//  Created by Foster Yin on 11/10/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

#import "CUTETrafficTime.h"
#import <MTLJSONAdapter.h>

@implementation CUTETrafficTime

+ (NSDictionary *)JSONKeyPathsByPropertyKey {
    return @{@"type": @"type", @"time": @"time", @"isDefault": @"default"};
}

+ (NSValueTransformer *)typeJSONTransformer {
    return [MTLJSONAdapter dictionaryTransformerWithModelClass:[CUTEEnum class]];
}

+ (NSValueTransformer *)timeJSONTransformer {
    return [MTLJSONAdapter dictionaryTransformerWithModelClass:[CUTETimePeriod class]];
}


- (NSDictionary *)toParams {
    if (self.type == nil) {
        return nil;
    }
    if (self.time.toParams == nil) {
        return nil;
    }

    return @{@"type": self.type.identifier, @"time": self.time.toParams, @"default": @(self.isDefault)};
}



@end
