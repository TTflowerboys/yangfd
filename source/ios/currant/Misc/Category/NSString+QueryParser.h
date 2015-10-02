//
//  NSString+QueryParser.h
//  currant
//
//  Created by Foster Yin on 10/2/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface NSString (QueryParser)

- (NSString *)stringByAppendingQueryDictionary:(NSDictionary *)params;

@end
