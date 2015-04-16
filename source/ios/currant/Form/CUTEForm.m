//
//  CUTEForm.m
//  currant
//
//  Created by Foster Yin on 4/1/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEForm.h"
#import "CUTECommonMacro.h"

@implementation CUTEForm

- (id)init {
    self = [super init];
    if (self) {
        static dispatch_once_t onceToken;
        dispatch_once(&onceToken, ^{
            [[self class] validationInit];
        });
    }
    return self;
}

- (NSArray * )rules {
    return nil;
}

@end
