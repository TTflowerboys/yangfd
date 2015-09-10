//
//  CUTEFormImagePickerPlaceholderView.m
//  currant
//
//  Created by Foster Yin on 4/14/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEFormImagePickerPlaceholderView.h"
#import "MasonryMake.h"
#import "CUTECommonMacro.h"
#import "CUTEUIMacro.h"

@interface CUTEFormImagePickerPlaceholderView ()
{
    UIImageView *_imageView;

    UILabel *_label;
}

@end



@implementation CUTEFormImagePickerPlaceholderView

- (instancetype)init
{
    self = [super init];
    if (self) {
        _imageView = [[UIImageView alloc] initWithImage:IMAGE(@"icon-camera")];
        [self addSubview:_imageView];

        _label = [UILabel new];
        _label.text = STR(@"ImagePickerPlaceholder/添加照片");
        _label.textColor = CUTE_MAIN_COLOR;
        _label.font = [UIFont systemFontOfSize:12];
        [self addSubview:_label];

        MakeBegin(_imageView)
        MakeCenterXEqualTo(self);
        MakeTopEqualTo(self.top);
        MakeEnd

        MakeBegin(_label)
        MakeCenterXEqualTo(self);
        MakeTopEqualTo(_imageView.bottom).offset(10);
        MakeEnd
    }
    return self;
}



@end
