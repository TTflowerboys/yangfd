//
//  NSString+Numberic.m
//  currant
//
//  Created by Foster Yin on 5/4/16.
//  Copyright © 2016 BBTechgroup. All rights reserved.
//

#import "NSString+Numberic.h"

@implementation NSString (Numberic)

/**
 *  Determines if the current NSString is numeric or not. It also accounts for the localised (Germany for example use "," instead of ".") decimal point and includes these as a valid number.
 *
 *  @return BOOL - True if the string is numeric.
 */

- (BOOL) isNumeric
{
    NSString *localDecimalSymbol = [[NSLocale currentLocale] objectForKey:NSLocaleDecimalSeparator];
    NSMutableCharacterSet *decimalCharacterSet = [NSMutableCharacterSet characterSetWithCharactersInString:localDecimalSymbol];
    [decimalCharacterSet formUnionWithCharacterSet:[NSCharacterSet decimalDigitCharacterSet]];

    NSCharacterSet *stringSet = [NSCharacterSet characterSetWithCharactersInString:self];
    BOOL setCheckOk = [decimalCharacterSet isSupersetOfSet:stringSet];

    if (setCheckOk) {
        // check to see how many times the decimal symbol appears in the string. It should only appear once for the number to be numeric.
        NSUInteger numberOfOccurances = [[self componentsSeparatedByString:localDecimalSymbol] count]-1;
        return (numberOfOccurances > 1) ? NO : YES;
    }
    else  {
        return NO;
    }
}

@end
