//
//  CUTEStringMatcher.h
//  currant
//
//  Created by Foster Yin on 7/21/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface CUTEStringMatcher : NSObject

+ (NSArray *)matchElementsWithString:(NSString *)string sourceElements:(NSArray *)sourceElements attributeSelector:(SEL)selector;

@end
