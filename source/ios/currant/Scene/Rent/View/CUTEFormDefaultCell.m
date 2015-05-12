//
//  CUTEFormDefaultCell.m
//  currant
//
//  Created by Foster Yin on 4/1/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEFormDefaultCell.h"
#import "CUTECommonMacro.h"
#import "CUTEUIMacro.h"


@implementation CUTEFormDefaultCell

+ (CGFloat)heightForField:(FXFormField *)field width:(CGFloat)width
{
    return CUTE_CELL_DEFAULT_HEIGHT;
}

- (void)setUp {
    [super setUp];
    self.textLabel.textColor = HEXCOLOR(0x333333, 1.0);
    self.textLabel.font = [UIFont systemFontOfSize:16];
}

- (void)update {
    [super update];
    
}


@end
