//
//  CUTECity.m
//  currant
//
//  Created by Foster Yin on 5/25/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTECity.h"
#import "CUTECommonMacro.h"

@implementation CUTECity

+ (NSDictionary *)JSONKeyPathsByPropertyKey
{
    return @{@"identifier": @"id",
             @"name": @"name",
             @"admin1": @"admin1",
             @"country": @"country"};
}

//FXForm use this to display
- (NSString *)fieldDescription {
    if (!IsNilNullOrEmpty(self.admin1) && [self.country isEqualToString:@"US"]) {
        return CONCAT(self.name, @" ", self.admin1);
    }
    else {
        return self.name;
    }
}

- (BOOL)isEqual:(CUTECity *)object {
    if ([object isKindOfClass:[self class]]) {
        return [self.identifier isEqualToString:[object identifier]];
    }
    else {
        return false;
    }
}

- (NSUInteger)hash {
    if (self.identifier) {
        return self.identifier.hash;
    }
    return [super hash];
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
