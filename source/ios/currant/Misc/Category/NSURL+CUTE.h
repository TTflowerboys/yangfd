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

+ (instancetype)YangfdURLWithString:(NSString *)URLString;

- (BOOL)isYangfdURL;

@end
