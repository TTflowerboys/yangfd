//
//  CUTEFromRentTypeCell.m
//  currant
//
//  Created by Foster Yin on 4/1/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEFormRentTypeCell.h"
#import "CUTECommonMacro.h"

@implementation CUTEFormRentTypeCell

- (void)update {
    [super update];
    if (self.field) {
        [self.imageView setImage:IMAGE(CONCAT(@"rent-type-", self.field.key))];
    }
}


@end
