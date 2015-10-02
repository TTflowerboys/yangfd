//
//  NSString+QueryParser.m
//  currant
//
//  Created by Foster Yin on 10/2/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

#import "NSString+QueryParser.h"
#import "NSString+Encoding.h"

@implementation NSString (QueryParser)

//http://stackoverflow.com/questions/718429/creating-url-query-parameters-from-nsdictionary-objects-in-objectivec
- (NSString *)stringByAppendingQueryDictionary:(NSDictionary *)params {
    NSMutableArray *pairs = NSMutableArray.array;
    for (NSString *key in params.keyEnumerator) {
        id value = params[key];
        if ([value isKindOfClass:[NSDictionary class]])
            for (NSString *subKey in value)
                [pairs addObject:[NSString stringWithFormat:@"%@[%@]=%@", key, subKey, [(NSString *)[value objectForKey:subKey] URLEncode]]];

        else if ([value isKindOfClass:[NSArray class]])
            for (NSString *subValue in value)
                [pairs addObject:[NSString stringWithFormat:@"%@[]=%@", key, [(NSString *)subValue URLEncode]]];

        else
            [pairs addObject:[NSString stringWithFormat:@"%@=%@", key, [(NSString *)value URLEncode]]];

    }
    if ([self hasSuffix:@"?"]) {
        return [self stringByAppendingString:[pairs componentsJoinedByString:@"&"]];
    }
    else {
        return [[self stringByAppendingString:@"?"] stringByAppendingString:[pairs componentsJoinedByString:@"&"]];
    }
}

@end
