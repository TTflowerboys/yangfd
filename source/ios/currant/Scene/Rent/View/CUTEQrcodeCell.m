//
//  CUTEQrcodeCell.m
//  currant
//
//  Created by Foster Yin on 4/27/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEQrcodeCell.h"
#import "CUTECommonMacro.h"

@implementation CUTEQrcodeCell

+ (CGFloat)heightForField:(FXFormField *)field width:(CGFloat)width
{
    return 176;
}

- (void)setUp {
    [super setUp];

    UIImageView *qrcodeView = [[UIImageView alloc] init];
    qrcodeView.frame = CGRectMake(0, 0, 118, 118);
    [self.contentView addSubview:qrcodeView];
    _qrcodeView = qrcodeView;
}

#define QRCODE_SIDE_LENGTH 118

- (void)layoutSubviews {
    [super layoutSubviews];
    self.qrcodeView.frame = CGRectMake(RectWidthExclude(self.contentView.bounds, QRCODE_SIDE_LENGTH)/ 2, RectHeightExclude(self.contentView.bounds, QRCODE_SIDE_LENGTH) / 2, QRCODE_SIDE_LENGTH, QRCODE_SIDE_LENGTH);
}

@end
