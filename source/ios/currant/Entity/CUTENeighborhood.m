//
//  CUTENeighborhood.m
//  currant
//
//  Created by Foster Yin on 7/21/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTENeighborhood.h"
#import "NSValueTransformer+MTLPredefinedTransformerAdditions.h"
#import "CUTECommonMacro.h"

@implementation CUTENeighborhood

+ (NSDictionary *)JSONKeyPathsByPropertyKey
{
    return @{@"identifier": @"id",
             @"name": @"name",
             @"country": @"country",
             @"parent": @"parent"};
}

+ (NSValueTransformer *)parentJSONTransformer {
    return [NSValueTransformer mtl_JSONDictionaryTransformerWithModelClass:[CUTENeighborhood class]];
}


//FXForm use this to display
- (NSString *)fieldDescription {
    if (self.parent && !IsNilNullOrEmpty(self.parent.name) && !IsNilNullOrEmpty(self.name)) {
        return CONCAT(self.name, @", ", self.parent.name);
    }
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
