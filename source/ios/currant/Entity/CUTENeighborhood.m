//
//  CUTENeighborhood.m
//  currant
//
//  Created by Foster Yin on 7/21/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTENeighborhood.h"

@implementation CUTENeighborhood

+ (NSDictionary *)JSONKeyPathsByPropertyKey
{
    return @{@"identifier": @"id",
             @"name": @"name",
             @"country": @"country"};
}

//FXForm use this to display
- (NSString *)fieldDescription {
    return self.name;
}

- (BOOL)isEqual:(CUTENeighborhood *)object {
    if ([object isKindOfClass:[self class]]) {
        return [self.identifier isEqualToString:[object identifier]];
    }
    else {
        return false;
    }
}

- (NSString *)localizedTitle {
    //http://stackoverflow.com/questions/16860108/how-to-determine-if-the-first-character-of-a-nsstring-is-a-letter
    NSRange first = [self.name rangeOfComposedCharacterSequenceAtIndex:0];
    NSRange match = [self.name rangeOfCharacterFromSet:[NSCharacterSet letterCharacterSet] options:0 range:first];
    if (match.location != NSNotFound) {
        // codeString starts with a letter
        return [self.name substringWithRange:match];
    }
    return nil;
}

@end
