//
//  CUTEFormButtonCell.m
//  currant
//
//  Created by Foster Yin on 4/2/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEFormButtonCell.h"
#import "CUTECommonMacro.h"
#import "CUTEUIMacro.h"

@implementation CUTEFormButtonCell

- (void)setUp {
    [super setUp];
    self.accessoryType = UITableViewCellAccessoryNone;
    self.accessoryView = nil;
}

- (void)layoutSubviews {
    [super layoutSubviews];

    self.textLabel.textColor = [UIColor whiteColor];
    self.textLabel.font = [UIFont systemFontOfSize:16];
    self.textLabel.backgroundColor = CUTE_MAIN_COLOR;
    self.textLabel.textAlignment = NSTextAlignmentCenter;
    self.textLabel.frame = self.bounds;
}

@end
