//
//  BBTInputAccessoryView.m
//  currant
//
//  Created by Foster Yin on 5/8/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "BBTInputAccessoryView.h"
#import "MasonryMake.h"
#import "CUTEUIMacro.h"
#import "CUTECommonMacro.h"

#define BACKGROUD_COLOR RGB(248, 248, 248)
#define BUTTON_MARGIN 10

@interface BBTInputAccessoryView ()
{
    UIButton *_doneButton;
}
@end

@implementation BBTInputAccessoryView


- (id)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self) {
        // Initialization code
        self.backgroundColor = BACKGROUD_COLOR;
        _doneButton = [UIButton buttonWithType:UIButtonTypeCustom];
        [_doneButton setTitle:STR(@"确认") forState:UIControlStateNormal];
        [_doneButton setTitleColor:[UIColor blackColor] forState:UIControlStateNormal];
        [_doneButton setTitleColor:[UIColor grayColor] forState:UIControlStateDisabled];
        [self addSubview:_doneButton];

        [_doneButton addTarget:self action:@selector(onDoneButtonPressed:) forControlEvents:UIControlEventTouchUpInside];

        [self setupConstraints];
    }
    return self;
}

- (void)setupConstraints
{
    [_doneButton makeConstraints:^(MASConstraintMaker *make) {
        MakeRighEqualTo(@(-BUTTON_MARGIN));
        MakeTopEqualTo(@(0));
        MakeHeightEqualTo(_doneButton.superview);
        MakeWidthEqualTo(@(TextSizeOfLabel(_doneButton.titleLabel).width));
    }];
}

- (void)setInputView:(UIView *)inputView
{
    _inputView = inputView;
    _doneButton.enabled = inputView? YES: NO;
}
- (void)onDoneButtonPressed:(id)sender
{
    [self.inputView resignFirstResponder];
}


@end
