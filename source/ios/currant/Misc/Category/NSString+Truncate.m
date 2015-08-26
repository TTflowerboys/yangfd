//
//  NSString+Truncate.m
//  currant
//
//  Created by Foster Yin on 8/26/15.
//  Copyright © 2015 Foster Yin. All rights reserved.
//

#import "NSString+Truncate.h"

@implementation NSString (Truncate)

//http://stackoverflow.com/questions/2952298/how-can-i-truncate-an-nsstring-to-a-set-length
- (NSString *)truncateWithLength:(NSInteger)length {
    // define the range you're interested in
    NSRange stringRange = {0, MIN([self length], length)};

    // adjust the range to include dependent chars
    stringRange = [self rangeOfComposedCharacterSequencesForRange:stringRange];

    // Now you can create the short string
    NSString *shortString = [self substringWithRange:stringRange];
    return shortString;
}

@end
