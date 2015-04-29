//
//  BPLPickerView.m
//  BluePlate
//
//  Created by Foster Yin on 12/24/13.
//  Copyright (c) 2013 Brothers Bridge Technology. All rights reserved.
//

#import "BBTPickerView.h"
#import <BBTCommonMacro.h>
#import "MasonryMake.h"

@interface BBTPickerView ()
{

    UIView *_topBorder;

    UIButton *_doneButton;

    UIPickerView *_pickerView;
}

@end

@implementation BBTPickerView
@synthesize doneButton = _doneButton, pickerView = _pickerView;

- (id)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self) {
        // Initialization code
        self.backgroundColor = [UIColor whiteColor];
        
        _topBorder = [UIView new];
        _topBorder.backgroundColor = [UIColor lightGrayColor];
        [self addSubview:_topBorder];

        _doneButton = [UIButton buttonWithType:UIButtonTypeCustom];
        [_doneButton setTitle:STR(@"Done") forState:UIControlStateNormal];
        [_doneButton setTitleColor:[UIColor blackColor] forState:UIControlStateNormal];
        [self addSubview:_doneButton];

        _pickerView = [[UIPickerView alloc] init];

        if (SYSTEM_VERSION_LESS_THAN(@"7.0"))
        {
            _pickerView.showsSelectionIndicator = YES;
        }

        [self addSubview:_pickerView];

        [self setupConstraints];
    }
    return self;
}

#define PICKER_HEADER_HEIGHT 40
#define DONE_BUTTON_HEIGHT 30
#define DONE_BUTTON_WIDTH 50
#define DONE_BUTTON_RIGHT_MARGIN 10

- (void)setupConstraints
{

    [_topBorder makeConstraints:^(MASConstraintMaker *make) {
        MakeLeftEqualTo(@(0));
        MakeRighEqualTo(@(0));
        MakeTopEqualTo(@(0));
        MakeHeightEqualTo(@(1));
    }];

    [_doneButton makeConstraints:^(MASConstraintMaker *make) {
        MakeRighEqualTo(@(-DONE_BUTTON_RIGHT_MARGIN));
        MakeWidthEqualTo(@(DONE_BUTTON_WIDTH));
        MakeTopEqualTo(@((PICKER_HEADER_HEIGHT - DONE_BUTTON_HEIGHT) / 2));
        MakeHeightEqualTo(@(DONE_BUTTON_HEIGHT));
    }];

    [_pickerView makeConstraints:^(MASConstraintMaker *make) {
        MakeLeftEqualTo(@(0));
        MakeRighEqualTo(@(0));
        MakeTopEqualTo(@(PICKER_HEADER_HEIGHT));
        MakeHeightEqualTo(_pickerView.superview).offset(-PICKER_HEADER_HEIGHT);
    }];
}


@end
