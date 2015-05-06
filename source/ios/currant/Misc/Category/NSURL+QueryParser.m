//
//  NSURL+QueryParser.m
//  currant
//
//  Created by Foster Yin on 5/5/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "NSURL+QueryParser.h"

@implementation NSURL (QueryParser)

-(NSDictionary *)queryDictionary
{
    NSMutableDictionary *params = [[NSMutableDictionary alloc] init];
    for (NSString *param in [[self query] componentsSeparatedByString:@"&"]) {
        NSArray *parts = [param componentsSeparatedByString:@"="];
        if([parts count] < 2) continue;
        [params setObject:[parts objectAtIndex:1] forKey:[parts objectAtIndex:0]];
    }
    return params;
}

@end
