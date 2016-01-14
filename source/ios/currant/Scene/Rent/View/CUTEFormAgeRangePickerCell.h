//
//  CUTEFormRangePickerCell.h
//  currant
//
//  Created by Foster Yin on 1/13/16.
//  Copyright © 2016 BBTechgroup. All rights reserved.
//

#import <FXForms/FXForms.h>

@interface CUTEFormAgeRangePickerCell : FXFormOptionPickerCell

+ (NSString *)formattedDisplayTextWithMinAge:(NSInteger)minAge maxAge:(NSInteger)maxAge;

@end
