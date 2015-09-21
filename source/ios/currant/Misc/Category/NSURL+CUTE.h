//
//  NSURL+CUTE.h
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface NSURL (CUTE)

+ (instancetype)WebURLWithString:(NSString *)URLString;

- (BOOL)isYangfdURL;

- (BOOL)isHttpOrHttpsURL;

- (BOOL)isWebArchiveURL;

//don't care query, fragment and user etc
- (BOOL)isEquivalent:(NSURL *)aURL;

@end
