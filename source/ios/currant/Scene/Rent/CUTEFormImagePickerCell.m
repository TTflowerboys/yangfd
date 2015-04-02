//
//  CUTEFormImagePickerCell.m
//  currant
//
//  Created by Foster Yin on 4/2/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEFormImagePickerCell.h"
#import "CUTECommonMacro.h"
#import "CUTEUIMacro.h"

@implementation CUTEFormImagePickerCell

+ (CGFloat)heightForField:(FXFormField *)field width:(CGFloat)width
{
    return 112;
}


- (void)setUp {
    [super setUp];
    [self.imageView setImage:IMAGE(@"icon-camera")];
}

- (void) layoutSubviews
{
    [super layoutSubviews];
    self.imageView.frame = CGRectMake(RectWidthExclude(self.bounds, self.imageView.image.size.width) / 2, 22, self.imageView.image.size.width, self.imageView.image.size.height);

    self.textLabel.textColor = CUTE_MAIN_COLOR;
    self.textLabel.font = [UIFont systemFontOfSize:12];
    CGSize textSize = TextSizeOfLabel(self.textLabel);
    self.textLabel.frame = CGRectMake(RectWidthExclude(self.bounds, textSize.width) / 2, RectY(self.imageView.frame) + RectHeight(self.imageView.frame) + 10, textSize.width, textSize.height);

}

@end
