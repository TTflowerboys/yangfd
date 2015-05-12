//
//  UILabel+UILabelDynamicHeight.m
//  currant
//
//  Created by Foster Yin on 5/12/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "UILabel+UILabelDynamicHeight.h"

@implementation UILabel (UILabelDynamicHeight)

#pragma mark - Calculate the size,bounds,frame of the Multi line Label
/*====================================================================*/

/* Calculate the size,bounds,frame of the Multi line Label */

/*====================================================================*/
/**
 *  Returns the size of the Label
 *
 *  @param aLabel To be used to calculte the height
 *
 *  @return size of the Label
 */
-(CGSize)sizeOfMultiLineLabel{

    NSAssert(self, @"UILabel was nil");

    //Label text
    NSString *aLabelTextString = [self text];

    //Label font
    UIFont *aLabelFont = [self font];

    //Width of the Label
    CGFloat aLabelSizeWidth = self.frame.size.width;

    return [aLabelTextString boundingRectWithSize:CGSizeMake(aLabelSizeWidth, MAXFLOAT)
                                          options:NSStringDrawingUsesLineFragmentOrigin
                                       attributes:@{
                                                    NSFontAttributeName : aLabelFont
                                                    }
                                          context:nil].size;
}

@end
