//
//  CUTEFromOtherRequirementTextViewCell.m
//  currant
//
//  Created by Foster Yin on 2/2/16.
//  Copyright © 2016 BBTechgroup. All rights reserved.
//

#import "CUTEFromOtherRequirementsTextViewCell.h"

@implementation CUTEFromOtherRequirementsTextViewCell


+ (CGFloat)heightForField:(FXFormField *)field width:(CGFloat)width {
    CGFloat height =  [super heightForField:field width:width];
    return height + 40;
}

@end
