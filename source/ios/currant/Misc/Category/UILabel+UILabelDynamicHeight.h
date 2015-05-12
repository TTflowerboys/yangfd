//
//  UILabel+UILabelDynamicHeight.h
//  currant
//
//  http://stackoverflow.com/questions/7174007/how-to-calculate-uilabel-height-dynamically
//  Created by Foster Yin on 5/12/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface UILabel (UILabelDynamicHeight)

#pragma mark - Calculate the size the Multi line Label
/*====================================================================*/

/* Calculate the size of the Multi line Label */

/*====================================================================*/
/**
 *  Returns the size of the Label
 *
 *  @param aLabel To be used to calculte the height
 *
 *  @return size of the Label
 */
-(CGSize)sizeOfMultiLineLabel;

@end
