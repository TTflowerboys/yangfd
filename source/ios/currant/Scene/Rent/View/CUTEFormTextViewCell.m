//
//  CUTEFormTextViewCell.m
//  currant
//
//  Created by Foster Yin on 5/8/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEFormTextViewCell.h"
#import "BBTInputAccessoryView.h"
#import "CUTECommonMacro.h"
#import "CUTEUIMacro.h"

@implementation CUTEFormTextViewCell

- (void)setUp {
    [super setUp];
    BBTInputAccessoryView *inputAccessoryView = [[BBTInputAccessoryView alloc] initWithFrame:CGRectMake(0, 0, ScreenWidth, 40)];
    inputAccessoryView.inputView = self.textView;
    self.textView.inputAccessoryView = inputAccessoryView;
}

@end
