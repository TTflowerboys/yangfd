//
//  NSString+Encoding.h
//  currant
//
//  https://github.com/kevinrenskers/NSString-URLEncode
//  Created by Foster Yin on 4/24/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface NSString (Encoding)

- (NSString *)URLEncode;

- (NSString *)URLEncodeUsingEncoding:(NSStringEncoding)encoding;

- (NSString *)URLDecode;

- (NSString *)URLDecodeUsingEncoding:(NSStringEncoding)encoding;

@end
