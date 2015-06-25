//
//  YTKKeyValueItem+CUTE.m
//  currant
//
//  Created by Foster Yin on 6/25/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "YTKKeyValueItem+CUTE.h"
#import "CUTECommonMacro.h"

@implementation YTKKeyValueItem (CUTE)

- (NSNumber *)itemNumber {
    if (self.itemObject && [self.itemObject isKindOfClass:[NSArray class]] && !IsArrayNilOrEmpty(self.itemObject)) {
        return [(NSArray *)self.itemObject firstObject];
    }
    return nil;
}

- (NSString *)itemString {
    if (self.itemObject && [self.itemObject isKindOfClass:[NSArray class]] && !IsArrayNilOrEmpty(self.itemObject)) {
        return [(NSArray *)self.itemObject firstObject];
    }
    return nil;
}

@end
