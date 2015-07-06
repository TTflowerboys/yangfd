//
//  KIFUITestActor+PropertyInfo.m
//  currant
//
//  Created by Foster Yin on 7/3/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "KIFUITestActor+PropertyInfo.h"
#import "CUTECommonMacro.h"

@implementation KIFUITestActor (PropertyInfo)

- (void)setBedroomCount {
    [self waitForViewWithAccessibilityLabel:STR(@"房产信息表单")];
    [self tapRowAtIndexPath:[NSIndexPath indexPathForRow:3 inSection:1] inTableViewWithAccessibilityIdentifier:STR(@"房产信息表单")];
    [self selectPickerViewRowWithTitle:@"1室" inComponent:0];
    [self tapViewWithAccessibilityLabel:STR(@"确认")];
}

@end
