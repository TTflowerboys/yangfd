//
//  NSURL+CUTE.m
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "NSURL+CUTE.h"
#import "CUTEConfiguration.h"

@implementation NSURL (CUTE)

+ (instancetype)WebURLWithString:(NSString *)URLString {
    return [NSURL URLWithString:URLString relativeToURL:[CUTEConfiguration hostURL]];
}

+ (instancetype)YangfdURLWithString:(NSString *)URLString {
    return [[NSURL alloc] initWithScheme:[CUTEConfiguration yangfdScheme] host:@"page" path:URLString];
}

- (BOOL)isYangfdURL {
    return [[self scheme] isEqualToString:[CUTEConfiguration yangfdScheme]];
}

@end
