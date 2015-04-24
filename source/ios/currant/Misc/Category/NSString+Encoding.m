//
//  NSString+Encoding.m
//  currant
//
//  Created by Foster Yin on 4/24/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "NSString+Encoding.h"

@implementation NSString (Encoding)

- (NSString *)stringByURLEncoding {
    return (__bridge NSString *)CFURLCreateStringByAddingPercentEscapes(NULL,
                                                                        (CFStringRef)self,
                                                                        NULL,
                                                                        (CFStringRef)@"!*'\"();:@&=+$,/?%#[]% ",
                                                                        CFStringConvertNSStringEncodingToEncoding(NSUTF8StringEncoding));
}

@end
