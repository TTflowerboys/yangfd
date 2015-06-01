//
//  CUTEMapBackView.m
//  currant
//
//  Created by Foster Yin on 5/27/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEMapBackView.h"
#import "CUTECommonMacro.h"
#import "MasonryMake.h"

@interface CUTEMapBackView ()
{
    UIImageView *_backgroundView;

    UIView *_seperator;
}

@end


@implementation CUTEMapBackView

- (instancetype)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self) {
        _backgroundView = [[UIImageView alloc] initWithImage:IMAGE(@"map-back-background")];
        [self addSubview:_backgroundView];
        _button = [UIButton buttonWithType:UIButtonTypeCustom];
        [_button setImage:IMAGE(@"map-back") forState:UIControlStateNormal];
        [self addSubview:_button];
        _seperator = [UIView new];
        _seperator.backgroundColor = HEXCOLOR(0x999999, 1.0);
        [self addSubview:_seperator];

        _label = [UILabel new];
        _label.font = [UIFont systemFontOfSize:12];
        _label.textColor = [UIColor whiteColor];
        _label.textAlignment = NSTextAlignmentCenter;
        [self addSubview:_label];
        [self setupContraints];
    }
    return self;
}

- (void)setupContraints {
    MakeBegin(_backgroundView);
    MakeEdgesEqualTo(self);
    MakeEnd
    
    MakeBegin(_button);
    MakeLeftEqualTo(self.left);
    MakeRighEqualTo(self.left).offset(40);
    MakeTopEqualTo(self.top);
    MakeBottomEqualTo(self.bottom);
    MakeEnd

    MakeBegin(_seperator)
    MakeLeftEqualTo(_button.right);
    MakeRighEqualTo(_button.right).offset(1);
    MakeTopEqualTo(self.top).offset(8);
    MakeBottomEqualTo(self.bottom).offset(-8);
    MakeEnd

    MakeBegin(_label)
    MakeLeftEqualTo(_seperator.right).offset(28);
    MakeRighEqualTo(self.right).offset(-28);
    MakeTopEqualTo(self.top).offset(8);
    MakeBottomEqualTo(self.bottom).offset(-8);
    MakeEnd
}


@end
