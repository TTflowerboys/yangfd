//
//  CUTEUnfinishedRentTicketPlaceholderImageView.m
//  currant
//
//  Created by Foster Yin on 4/23/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEUnfinishedRentTicketPlaceholderImageView.h"
#import "CUTECommonMacro.h"
#import "CUTEUIMacro.h"
#import "MasonryMake.h"

@interface CUTEUnfinishedRentTicketPlaceholderImageView ()
{
    UIImageView *_iconView;

    UILabel *_label;
}

@end

@implementation CUTEUnfinishedRentTicketPlaceholderImageView

- (instancetype)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self) {
        _iconView = [[UIImageView alloc] initWithImage:IMAGE(@"icon-camera")];
        [self addSubview:_iconView];

        _label = [UILabel new];
        _label.text = STR(@"暂未添加照片");
        _label.textColor = CUTE_MAIN_COLOR;
        _label.font = [UIFont systemFontOfSize:12];
        [self addSubview:_label];

        MakeBegin(_iconView)
        MakeCenterXEqualTo(self);
        MakeTopEqualTo(self.top);
        MakeEnd

        MakeBegin(_label)
        MakeCenterXEqualTo(self);
        MakeTopEqualTo(_iconView.bottom).offset(10);
        MakeEnd

    }
    return self;
}


@end
